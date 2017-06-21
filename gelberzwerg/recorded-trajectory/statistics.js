"strict mode";

var fs = require("fs");
var geo = require("geodesy").LatLonEllipsoidal;
var Promise = require("promise");

var	YEAR = 0,
	MONTH = 1,
	DAY = 2;

function computeTotalDistance(trajectoryPath) {
	return new Promise((resolve, reject) => {
		fs.readFile(trajectoryPath, (err, data) => {
			if(err) {
				reject(err);
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
			
			resolve(totalDistance);
		});
	});
}

function determineLastUpdated(rawPath) {
	return new Promise((resolve, reject) => {
		fs.readdir(rawPath, (err, files) => {
			if(err) {
				reject(err);
				return;
			}
			
			var newestFile = files.sort()[files.length - 1];
			
			var date = [];
			
			date[YEAR] = Number(newestFile.substring(0,4));
			date[MONTH] = Number(newestFile.substring(5, 7));
			date[DAY] = Number(newestFile.substring(8, 10));
			
			resolve(date);
		});
	});
}

function writeStatistics() {
	var statistics = {};
	
	Promise.all([computeTotalDistance(process.argv[2]),
						determineLastUpdated(process.argv[3]) ])
	.then((results) => {
		statistics.totalDistanceKm = results[0] * 1e-3 - 80;
		statistics.lastUpdated = results[1];
		
		fs.writeFile(process.argv[4], JSON.stringify(statistics));
	});
}

writeStatistics();
