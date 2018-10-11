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

if (!access_token || access_token === "") {
    window.location.replace("/Spotify/Login");
}

if (token_expires === "" || Date.parse(token_expires) <= Date.now()) {
    window.location.replace("/Spotify/RefreshToken");
}


