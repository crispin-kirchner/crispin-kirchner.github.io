.PHONY: all

all: $(patsubst orig/%.JPG,%.JPG,$(wildcard orig/*.JPG)) $(patsubst orig/%.jpg,%.jpg,$(wildcard orig/*.jpg))

%.JPG: orig/%.JPG
	convert $< -auto-orient -scale 800 $@
	
%.jpg: orig/%.jpg
	convert $< -auto-orient -scale 800 $@
