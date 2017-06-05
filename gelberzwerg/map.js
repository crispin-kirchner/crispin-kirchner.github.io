var backend_root = "https://crispin-kirchner.github.io/gelberzwerg/";
			
$.getJSON(backend_root + "blog-entries.json", function(markers) {
	
	var maxLon = 0,
		maxLat = 0,
		minLon = Number.POSITIVE_INFINITY,
		minLat = Number.POSITIVE_INFINITY;
		
	for (var i = 0; i < markers.length; i++) {
		var markerCoordinate = markers[i].coordinate,
			latitude = markerCoordinate[0],
			longitude = markerCoordinate[1];
			
		maxLon = longitude > maxLon ? longitude : maxLon;
		maxLat = latitude > maxLat ? latitude : maxLat;
		minLon = longitude < minLon ? longitude : minLon;
		minLat = latitude < minLat ? latitude : minLat;
	}
	
	var center = [(minLat + maxLat) * 0.5,
				  (minLon + maxLon) * 0.5];
	
	var map = L.map('map').setView(center, 6);
	
	$.getJSON(backend_root + "recorded-trajectory/trajectory.json", function(track) {
		L.geoJson(track).addTo(map);
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
	for (var i=0; i < markers.length; i++) {
		var markerData = markers[i];
		L.marker(markerData.coordinate)
		 .addTo(map)
		 .bindPopup(markerData.date +
		 ' <a href="https://kcrispin9.wixsite.com/gelberzwerg/single-post/' +
		 markerData.url + '" target="_blank"><strong>' +
		 markerData.title + '</strong></a><br />' + markerData.desc);
	}
});
