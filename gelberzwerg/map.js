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

function twoDigitPad(number) {
	var numberString = "" + number;
	
	if(numberString.length < 2) {
		numberString = "0" + numberString;
	}
	
	return numberString;
}

function titleToUrl(title) {
	return title.replace(/[^0-9a-z ]/gi, '')
	            .replace(/  +/g, ' ')
	            .replace(/ /g, '-');
}

function dateToUrl(date) {
	return date[YEAR] + "/" + twoDigitPad(date[MONTH]) + "/" +
		   twoDigitPad(date[DAY]);
}

function getUrl(markerData) {
	
	var urlDate = markerData.publishingDate
	            ? markerData.publishingDate
	            : markerData.date;
	
	var urlTail = dateToUrl(urlDate) + "/" + titleToUrl(markerData.title);
		
	return "https://kcrispin9.wixsite.com/gelberzwerg/single-post/" + urlTail;
}
			
$.getJSON(backendRoot + "blog-entries.json", function(markers) {
	
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
	
	var map = L.map('map').setView(center, 5);
	
	$.getJSON(backendRoot + "recorded-trajectory/trajectory.json", function(track) {
		L.geoJson(track).addTo(map);
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
	for (var i=0; i < markers.length; i++) {
		var markerData = markers[i];
		
		if(markerData.hidden) {
			continue;
		}
		
		L.marker(markerData.coordinate)
		 .addTo(map)
		 .bindPopup(getDateString(markerData.date) +
		 ' <a href="' + getUrl(markerData) +
		 '" target="_blank"><strong>' +
		 markerData.title + '</strong></a><br />' + markerData.desc);
	}
});
