"strict mode";

var fs = require("fs");
var geo = require("geodesy").LatLonEllipsoidal;

var statistics = {};

fs.readFile(process.argv[2], (err, data) => {
	if(err) {
		console.log(err);
		return;
	}
	
	var trajectory = JSON.parse(data);
	
	var points = trajectory.features[0].geometry.coordinates[0];
	
	var totalDistance = 0.0;
	var point = points[0];
	var lastGeo = new geo(point[1], point[0]);
	
	for(var i = 1; i < points.length; ++i) {
		point = points[i];
		
		var currentGeo = new geo(point[1], point[0]);
		
		totalDistance += lastGeo.distanceTo(currentGeo);
		
		lastGeo = currentGeo;
	}
	
	statistics.totalDistanceKm = totalDistance * 1e-3;
	
	fs.writeFile(process.argv[3], JSON.stringify(statistics));
});
