.PHONY: clean all dev

all: dist
dev: node_modules
	npm start
dist:  $(wildcard src/**/* webpack.config.js) node_modules
	npm run build
node_modules:
	npm install
clean:
	rm -rf dist
