.PHONY: all clean full

all: full $(patsubst full/%.jpg,%.jpg,$(wildcard full/*.jpg)) $(patsubst full/%.jpg,preview/%.jpg,$(wildcard full/*.jpg))

clean:
	rm -rf full *.jpg preview
	
preview:
	mkdir -p preview

full:
	mkdir -p full && for file in orig/*; do ln -sfr $$file full/$$(basename $$file | tr '[:upper:]' '[:lower:]'); done
	 
%.jpg: full/%.jpg
	convert $< -auto-orient -scale 800 $@

preview/%.jpg: full/%.jpg preview
	convert $< -auto-orient -scale 200 $@
