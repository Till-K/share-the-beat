var url_string = window.location.href;
var url = new URL(url_string);
var access_token = url.searchParams.get("access_token");
var refresh_token = url.searchParams.get("refresh_token");

if(access_token === null || refresh_token === null) {
    window.location.replace("/login");
}

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
