var	YEAR = 0,
    MONTH = 1,
    DAY = 2;
    
function getMonthName(monthNumber) {
  var monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return monthName[monthNumber - 1];
}

function getDateString(date) {
  return getMonthName(date[MONTH]) + " " + date[DAY] + ", " + date[YEAR];
}

var map = L.map('map');

$.getJSON('/recorded-trajectory/means/bicycle/statistics.json', function(statistics) {
  map.fitBounds(L.latLngBounds(statistics.topLeft, statistics.bottomRight));
  $("#totalDistance").text("Total distance cycled: " + statistics.totalDistanceKm.toFixed(0) + " km (" + getDateString(statistics.lastUpdated) + ")");
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors '
}).addTo(map);

$.getJSON('/recorded-trajectory/means/bicycle/downsampled-trajectory.json', function(track) {
  L.geoJson(track, { style: {color: "#f38148"}}).addTo(map);
});
