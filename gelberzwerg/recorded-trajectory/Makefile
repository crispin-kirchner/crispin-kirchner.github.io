.PHONY: clean
.DEFAULT_GOAL: trajectory.json

clean:
	rm -rf simplified trajectory.gpx

simplified:
	mkdir simplified

simplified/%.gpx: raw/%.gpx simplified
	gpsbabel -i gpx -f $< -x position,distance=10m -x simplify,count=50 -o gpx -F $@
	
trajectory.gpx: $(patsubst raw/%.gpx,simplified/%.gpx,$(wildcard raw/*.gpx))
	gpsbabel $(^:%.gpx=-i gpx -f %.gpx) -o gpx -F $@

%.json: %.gpx
	ogr2ogr -f GeoJSON $@ $< tracks
