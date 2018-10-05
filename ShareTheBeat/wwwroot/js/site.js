let getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while(c.charAt(0) === " ") {
            c = c.substring(1);
        }

        if(c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
};

let getTime = (milli) => {
    let time = new Date(milli);
    let hours = time.getUTCHours();
    let minutes = time.getUTCMinutes();
    let seconds = time.getUTCSeconds();

    if (hours !== 0)
        return (hours + ":" + minutes + ":" + seconds);
    else
        return (minutes + ":" + seconds);
};

  var access_token = getCookie("spotify_access_token");
var refresh_token = getCookie("spotify_refresh_token");
var token_expires = getCookie("spotify_token_expires");

if (token_expires === "" || Date.parse(token_expires) <= Date.now()) {
    window.location.replace("/Spotify/RefreshToken");
}

  var playback_device_id = undefined;

  var queue = [];
  
  if(access_token === "" || refresh_token === "") {
      window.location.replace("/Spotify/Login");
  }
$.put = function (url, data, callback, type) {

    if ($.isFunction(data)) {
        type = type || callback,
            callback = data,
            data = {}
    }

    return $.ajax({
        url: url,
        type: 'PUT',
        success: callback,
        data: data,
        contentType: type
    });
};

  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: 'Share The Beat',
      getOAuthToken: cb => { cb(access_token); }
    });

    const play = ({
        spotify_uri,
        playerInstance: {
          _options: {
            getOAuthToken,
            id
          }
        }
      }) => {
        getOAuthToken(access_token => {
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [spotify_uri] }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`
            },
          });
        });
      };

$(document).ready(function() {
    $.ajaxSetup({
        headers: { 'Authorization': 'Bearer ' + access_token }
    });

    $(".buttons button").click(function () {
        if ($(this).hasClass("play")) {
            player.resume();
        }
        else if ($(this).hasClass("pause")) {
            player.pause();
        }
    });

    $("input[name=search]").change(function() {
        var searchQuery = $(this).val();

        $(".main-content").html("");

        if(searchQuery !== undefined && searchQuery.trim() !== "") {
            $.get("https://api.spotify.com/v1/search?q=" + searchQuery + "&type=track", function(data) {
                
                data.tracks.items.forEach(element => {
                    var htmlItem = $("#songTemplate").clone();
 
                    htmlItem.removeAttr("id");
                    htmlItem.removeAttr("style");

                    htmlItem.attr("data-track-id", element.id);

                    htmlItem.find(".cover").attr("src", element.album.images[0].url);
                    htmlItem.find(".title").text(element.name);
                    htmlItem.find(".artist").text(element.artists[0].name);
                    htmlItem.find(".duration").text(getTime(element.duration_ms));

                    htmlItem.click(function() {
                        var trackId = $(this).attr("data-track-id");

                        if(playback_device_id !== undefined) {
                            player.getCurrentState().then(state => {
                            if(!state || state.paused === true) {
                                play({spotify_uri: "spotify:track:" + trackId, playerInstance: player});
                            }
                            else {
                                queue.push({spotify_uri: "spotify:track:" + trackId, playerInstance: player});
                            }
                        });
                        }
                    });

                    $(".main-content").append(htmlItem);
                });
            });
        }
    });

});

  
    // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => {/*window.location.replace("/Spotify/Login")*/ console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => {
        if (state.paused === true) {
            $(".pause").addClass("play");
            $(".pause").removeClass("pause");

            if (queue.length > 0) {
                play(queue[0]);
                queue.splice(-1, 1);
            }
        }
        else if (state.paused === false) {
            $(".play").addClass("pause");
            $(".play").removeClass("play");
        }
     });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
        playback_device_id = device_id;
      console.log('Ready with Device ID', device_id);
    });
  
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        playback_device_id = undefined;
      console.log('Device ID has gone offline', device_id);
    });
  
    // Connect to the player!
    player.connect();
  };
  
