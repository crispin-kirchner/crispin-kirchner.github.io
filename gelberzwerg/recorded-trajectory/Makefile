.PHONY: clean all

all: trajectory.json simplified-trajectory.gpx statistics.json 

clean:
	rm -rf simplified downsampled trajectory.gpx simplified-trajectory.gpx

simplified:
	mkdir -p simplified
	
downsampled:
	mkdir -p downsampled

simplified/%.gpx: raw/%.gpx simplified
	gpsbabel -i gpx -f $< -x position,distance=10m -o gpx -F $@
	
simplified-trajectory.gpx: $(patsubst raw/%.gpx,simplified/%.gpx,$(wildcard raw/*.gpx))
	gpsbabel $(^:%.gpx=-i gpx -f %.gpx) -x track,pack -o gpx -F $@
	
downsampled/%.gpx: simplified/%.gpx downsampled
	gpsbabel -i gpx -f $< -x simplify,count=50 -o gpx -F $@
	
trajectory.gpx: $(patsubst raw/%.gpx,downsampled/%.gpx,$(wildcard raw/*.gpx))
	gpsbabel $(^:%.gpx=-i gpx -f %.gpx) -x track,pack -o gpx -F $@

%.json: %.gpx
	ogr2ogr -f GeoJSON $@ $< tracks
	
statistics.json: simplified-trajectory.json
	nodejs statistics.js $< $@
