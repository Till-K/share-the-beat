using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ShareTheBeat.Models;

namespace ShareTheBeat.Controllers
{
    public class SpotifyController : Controller {
        private static readonly string CLIENT_ID = "a636ed5c8f9948e2a76f89b5ab6a8a5c";
        private static readonly string CLIENT_SECRET = "d133521ce8bd4f77a392dfa16d36b9e1";

        [HttpGet]
        public ActionResult Login() {
            var state = RandomString(16);
            HttpContext.Response.Cookies.Delete("spotify_state_token");
            HttpContext.Response.Cookies.Append("spotify_state_token", state);

            var redirectUri = $"{this.Request.Scheme}://{this.Request.Host}/Spotify/Callback";

            var querystring = GetQueryString(new {response_type = "code", client_id = CLIENT_ID, scope = "streaming user-modify-playback-state user-read-birthdate user-read-private user-read-email", redirect_uri = redirectUri, state = state});

            return Redirect("https://accounts.spotify.com/authorize?" + querystring);
        }

        [HttpGet]
        public async Task<ActionResult> Callback([FromQuery]string code, [FromQuery]string state) {
            string storedState = (HttpContext.Request.Cookies.ContainsKey("spotify_state_token")) ? HttpContext.Request.Cookies["spotify_state_token"] : "";

            if(storedState != state)
                return BadRequest("States do not match");

            HttpContext.Response.Cookies.Delete("spotify_state_token");

            var redirectUri = $"{this.Request.Scheme}://{this.Request.Host}/Spotify/Callback";

            var form = new Dictionary<string, string> {{"code", code}, {"redirect_uri", redirectUri}, {"grant_type", "authorization_code"}};

            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization","Basic " + System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(CLIENT_ID + ":" + CLIENT_SECRET)));

            var content = new FormUrlEncodedContent(form);

            var response = await client.PostAsync("https://accounts.spotify.com/api/token", content);


            if(response.IsSuccessStatusCode) {
                PostTokensBody postResponse = await response.Content.ReadAsAsync<PostTokensBody>();

                HttpContext.Response.Cookies.Append("spotify_access_token", postResponse.access_token);
                HttpContext.Response.Cookies.Append("spotify_refresh_token", postResponse.refresh_token);
                
                return RedirectToAction("Index", "Home");
            }
            else {
                var responseString = await response.Content.ReadAsStringAsync();
                return BadRequest(responseString);
            }
        }

        [HttpGet]
        public async Task<ActionResult> RefreshToken() {
            var refreshToken = HttpContext.Request.Cookies["spotify_refresh_token"];

            if(refreshToken == null)
                return BadRequest("No Current Token");

            var redirectUri = $"{this.Request.Scheme}://{this.Request.Host}/Spotify/Callback";

            var form = new Dictionary<string, string> {{"refresh_token", refreshToken}, {"grant_type", "refresh_token"}};

            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization","Basic " + System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(CLIENT_ID + ":" + CLIENT_SECRET)));

            var content = new FormUrlEncodedContent(form);

            var response = await client.PostAsync("https://accounts.spotify.com/api/token", content);


            if(response.IsSuccessStatusCode) {
                PostTokensBody postResponse = await response.Content.ReadAsAsync<PostTokensBody>();

                 HttpContext.Response.Cookies.Delete("spotify_access_token");
                HttpContext.Response.Cookies.Append("spotify_access_token", postResponse.access_token);
                
                return RedirectToAction("Index", "Home");
            }
            else {
                var responseString = await response.Content.ReadAsStringAsync();
                return BadRequest(responseString);
            }

//             var refresh_token = req.query.refresh_token;
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//       form: {
//         grant_type: 'refresh_token',
//         refresh_token: refresh_token
//       },
//       json: true
//     };
  
//     request.post(authOptions, function(error, response, body) {
//       if (!error && response.statusCode === 200) {
//         var access_token = body.access_token;
//         res.send({
//           'access_token': access_token
//         });
//       }
//     });
//   });
        }

        private class PostTokensBody {
            public string access_token {get; set;}
            public string refresh_token {get; set;}
            
        }
    

        private static string RandomString(int length) {
            const string chars = "QWERTZUIOPASDFGHJKLYXCVBNMqwertzuiopasdfghjklyxcvbnm1234567890";
            return new string(Enumerable.Repeat(chars, length).Select(s => s[new Random().Next(s.Length)]).ToArray());
        }

        private static string GetQueryString(object obj) {
            var props = from p in obj.GetType().GetProperties() where p.GetValue(obj, null) != null select p.Name + "=" + System.Web.HttpUtility.UrlEncode(p.GetValue(obj, null).ToString());

            return String.Join("&", props.ToArray());
        }
    }
}