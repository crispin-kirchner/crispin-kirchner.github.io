.PHONY: clean

clean:
	rm -rf simplified

simplified:
	mkdir simplified

simplified/%.gpx: raw/%.gpx simplified
	gpsbabel -i gpx -f $< -x position,distance=10m -o gpx -F $@
