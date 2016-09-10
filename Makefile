.PHONY: clean all dev

all: dist

dist:  $(wildcard src/**/* webpack.config.js)
	npm run build
#dist/%.html: src/%.html dist
#	cp $< $@
#dist:
#	mkdir $@
clean:
	rm -rf dist
dev:
	npm start