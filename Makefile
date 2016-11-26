.PHONY: clean all dev

all: dist
dev: node_modules
	yarn start
dist:  $(wildcard src/**/* webpack.config.js) node_modules
	yarn run build
node_modules:
	yarn install
clean:
	rm -rf dist
