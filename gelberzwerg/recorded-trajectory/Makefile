.DEFAULT_GOAL:= trajectory.json
.PHONY: clean

clean:
	rm -rf simplified trajectory.gpx

simplified:
	mkdir -p simplified

simplified/%.gpx: raw/%.gpx simplified
	gpsbabel -i gpx -f $< -x position,distance=10m -x simplify,count=50 -o gpx -F $@
	
trajectory.gpx: $(patsubst raw/%.gpx,simplified/%.gpx,$(wildcard raw/*.gpx))
	gpsbabel $(^:%.gpx=-i gpx -f %.gpx) -x track,pack -o gpx -F $@

%.json: %.gpx
	ogr2ogr -f GeoJSON $@ $< tracks
