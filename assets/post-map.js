function getKeySvg(color) {
  var width = 25;
  
  var svg = '<svg width="' + width + '" height="4"><line x1="0" y1="1" x2="' + width +
            '" y2="1" style="stroke:' + color + ';stroke-width:4" /></svg>';
  return svg;
}

var map = L.map('map');

$.getJSON('/recorded-trajectory/means/bicycle/statistics.json', function(statistics) {
  map.fitBounds(L.latLngBounds(statistics.topLeft, statistics.bottomRight));
  $("#totalDistance").text("Total distance cycled: " + statistics.totalDistanceKm.toFixed(0) + " km");
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors '
}).addTo(map);

$.getJSON('recorded-trajectory/means/means.json', function(allMeans) {
  allMeans.forEach(function(means) {
    $.getJSON('recorded-trajectory/means/' + means.name + '/downsampled-trajectory.json', function(track) {
      L.geoJson(track, {style: {color: means.color}}).addTo(map);
    });
    
    $("#mapKey").append("<div><p>" + getKeySvg(means.color) + ' ' + means.name + "</p></div>");
  });
});
