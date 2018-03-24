.PHONY: clean all dev

all: dist
dev: node_modules
	yarn start
dist:  $(wildcard src/**/* webpack.config.js) node_modules
	yarn run build
deploy.beta: 
	cp -v dist/* ../geomap.beta/
	$(eval VER := $(shell git describe --tags))
	(cd ../geomap.beta && git commit -am "$(VER)" && git push)
deploy: 
	cp -v dist/* ../geomap.next/
	$(eval VER := $(shell git describe --tags))
	(cd ../geomap.next && git commit -am "$(VER)" && git push)
node_modules:
	yarn install
clean:
	rm -rf dist
