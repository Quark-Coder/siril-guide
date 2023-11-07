$(document).ready(function() {

    $("input.slider").on("input change", function(event) {
        var element = $(this).parents("div.slider_container");
        var pos = event.target.value;

        element.find("div.before").css({width: pos + "%"});
        element.find("div.slider-button").css({left: "calc(" + pos + "% - 18px)"});
    });

});