"strict mode";

var fs = require("fs");
var geo = require("geodesy").LatLonEllipsoidal;
var Promise = require("promise");

var	YEAR = 0,
	MONTH = 1,
	DAY = 2;
  
var FILES_SORTED = fs.readdirSync(process.argv[3]).sort();

function computeTotalDistance(trajectoryPath) {
	return new Promise((resolve, reject) => {
		fs.readFile(trajectoryPath, (err, data) => {
			if(err) {
				reject(err);
				return;
			}
			
			var trajectory = JSON.parse(data);
			
      var totalDistance = 0.0;
      var minLat = Number.MAX_VALUE,
          maxLat = -Number.MAX_VALUE,
          minLon = Number.MAX_VALUE,
          maxLon = -Number.MAX_VALUE;
          
      var features = trajectory.features;
      
      var lastGeo = {};
      
      for(var j = 0; j < features.length; ++j) {
        var feature = features[j];
        
        var points = feature.geometry.coordinates[0];
			
        var point = points[0];
        firstGeo = new geo(point[1], point[0]);
        if(j > 0) {
          if(lastGeo.distanceTo(firstGeo) > 2) {
            console.log("distance between " + FILES_SORTED[j-1] + " and " + FILES_SORTED[j] + " too large");
          }
        }
        lastGeo = firstGeo;
        
        for(var i = 1; i < points.length; ++i) {
          point = points[i];
          
          minLon = Math.min(minLon, point[0]);
          maxLon = Math.max(maxLon, point[0]);
          minLat = Math.min(minLat, point[1]);
          maxLat = Math.max(maxLat, point[1]);
          
          var currentGeo = new geo(point[1], point[0]);
          
          totalDistance += lastGeo.distanceTo(currentGeo);
          
          lastGeo = currentGeo;
        }
      }
			
			resolve({totalDistance: totalDistance, topLeft: [minLat, minLon], bottomRight: [maxLat, maxLon]});
		});
	});
}

function determineLastUpdated() {			
  var newestFile = FILES_SORTED[FILES_SORTED.length - 1];
  
  var date = [];
  
  date[YEAR] = Number(newestFile.substring(0,4));
  date[MONTH] = Number(newestFile.substring(5, 7));
  date[DAY] = Number(newestFile.substring(8, 10));
  
  return date;
}

function writeStatistics() {
  var distanceByFerry = 80,
      distanceByCar = 10;
      
	var statistics = {};
	
	computeTotalDistance(process.argv[2]).then( (result) => {
		statistics.totalDistanceKm = result.totalDistance * 1e-3 - distanceByFerry - distanceByCar;
    statistics.topLeft = result.topLeft;
    statistics.bottomRight = result.bottomRight;
		statistics.lastUpdated = determineLastUpdated();
		
		fs.writeFile(process.argv[4], JSON.stringify(statistics));
	}, (reason) => {
    console.log(reason);
  });
}

writeStatistics();
