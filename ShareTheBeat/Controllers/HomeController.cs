using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ShareTheBeat.Hubs;
using ShareTheBeat.Models;

namespace ShareTheBeat.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View("CreateRoom");
        }  

        [Route("/[controller]/Room/{roomId}")]
        public IActionResult Index(string roomId)
        {
            ViewBag.RoomId = roomId;
            return View();
        }

        public IActionResult CreateRoom()
        {
            var room = SpotifyController.RandomString(16);
            GroupHub.AddGroup(room);
            return RedirectToAction("Room", new { id = room });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
