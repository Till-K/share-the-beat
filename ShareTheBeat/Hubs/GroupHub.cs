using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareTheBeat.Hubs
{
    public class GroupHub : Hub
    {
        Dictionary<string, List<string>> queues;
        Dictionary<string, List<IClientProxy>> groups;

        private static List<string> allowedGroups;

        public GroupHub()
        {
            queues = new Dictionary<string, List<string>>();
            groups = new Dictionary<string, List<IClientProxy>>();
        }

        public async Task ConnectToGroup(string groupId)
        {
            if(!allowedGroups.Contains(groupId))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Group is not Valid");
                return;
            }

            if(!groups.ContainsKey(groupId))
            {
                groups.Add(groupId, new List<IClientProxy>());
            }

            if(!queues.ContainsKey(groupId))
            {
                queues.Add(groupId, new List<string>());
            }

            groups[groupId].Add(Clients.Caller);
            await Clients.Caller.SendAsync("ReceiveMessage", JsonConvert.SerializeObject(queues[groupId]));
        }

        public async Task EnqueueSong(string groupId, string trackUrl)
        {
            if(groups.ContainsKey(groupId) && groups[groupId].Contains(Clients.Caller))
            {
                queues[groupId].Remove(trackUrl);

                foreach(IClientProxy client in groups[groupId])
                {
                    await client.SendAsync("SongEnqueued", trackUrl);
                }
            }
        }

        public async Task DequeueSong(string groupId)
        {
            if (groups.ContainsKey(groupId) && groups[groupId].Contains(Clients.Caller))
            {
                queues[groupId].RemoveAt(0);


                foreach (IClientProxy client in groups[groupId])
                {
                    await client.SendAsync("SongDequeued");
                }
            }
        }

        public async Task RemoveSong(string groupId, string songUrl)
        {
            if(queues.ContainsKey(groupId))
            {
                queues[groupId].Remove(songUrl);

                foreach(IClientProxy client in groups[groupId])
                {
                    await client.SendAsync("QueueUpdated");
                }
            }

        }

        public async Task GetQueue(string groupId)
        {
            if(queues.ContainsKey(groupId))
            {
                if (groups[groupId].Contains(Clients.Caller)) await Clients.Caller.SendAsync("ReceiveQueue", queues[groupId]);
            }
        }



        public static void AddGroup(string id)
        {
            if (allowedGroups == null) allowedGroups = new List<string>();

            allowedGroups.Add(id);
        }

    }
}
