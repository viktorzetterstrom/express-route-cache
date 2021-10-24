#!/bin/bash

rm -rf dist \
&& ./node_modules/.bin/esbuild src/index.ts \
  --format=esm --outdir=dist/esm --bundle --platform=node \
&& ./node_modules/.bin/esbuild src/index.ts \
  --format=cjs --outdir=dist/cjs --bundle --platform=node \
&& ./node_modules/.bin/tsc
