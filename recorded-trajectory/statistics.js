"strict mode";

var fs = require("fs");
var geo = require("geodesy").LatLonEllipsoidal;
var Promise = require("promise");

var	YEAR = 0,
    MONTH = 1,
    DAY = 2;
  
var FILES_SORTED = [];

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
                                
        feature.geometry.coordinates.forEach( (points) => {
          var point = points[0];
          lastGeo = new geo(point[1], point[0]);
          
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
        });
      }

			resolve({totalDistance: totalDistance, topLeft: [minLat, minLon], bottomRight: [maxLat, maxLon]});
		});
	});
}

function writeStatistics() {
  var distanceByCar = 10;
      
	var statistics = {};
	
	computeTotalDistance(process.argv[2]).then( (result) => {
		statistics.totalDistanceKm = result.totalDistance * 1e-3 - distanceByCar;
    statistics.topLeft = result.topLeft;
    statistics.bottomRight = result.bottomRight;
		
		fs.writeFileSync(process.argv[4], JSON.stringify(statistics));
	}, (reason) => {
    console.log(reason);
  });
}

function main() {
  if(process.argv.length != 5) {
    console.log("usage: " + process.argv[0] + ' ' + process.argv[1] + ' <GeoJSON trajectory> <raw GPX directory> <output file>');
    return;
  }
  
  FILES_SORTED = fs.readdirSync(process.argv[3]).sort();

  writeStatistics();
}

main();
