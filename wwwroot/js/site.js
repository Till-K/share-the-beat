let getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while(c.charAt(0) == " ") {
            c = c.substring(1);
        }

        if(c.indexOf(name) == 0) {
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

    if(hours !== 0)
        return (hours + ":" + minutes + ":" + seconds);
    else 
        return (minutes + ":" + seconds);
  }

  var access_token = getCookie("spotify_access_token");
  var refresh_token = getCookie("spotify_refresh_token");
  
  if(access_token === "" || refresh_token === "") {
      window.location.replace("/Spotify/Login");
  }


$(document).ready(function() {
    $.ajaxSetup({
        headers: { 'Authorization': 'Bearer ' + access_token }
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

                    htmlItem.find(".cover").attr("src", element.album.images[0].url);
                    htmlItem.find(".title").text(element.name);
                    htmlItem.find(".artist").text(element.artists[0].name);
                    htmlItem.find(".duration").text(getTime(element.duration_ms));

                    $(".main-content").append(htmlItem);
                });
            });
        }
    });

});
