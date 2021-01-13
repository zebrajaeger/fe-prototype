# Frontend prototype

## Usage

### Initialize / install dependencies

```bash
yarn install <- recommended
npm install
```

### Build

```bash
yarn run fe:build
```

### Develop

```bash
yarn run fe:serve
```

### Other tasks

Show other tasks

```bash
yarn run gulp --tasks
```

Execute another task. Example:

```bash
yarn run gulp clean-all
```
## Config
- default-config.json <- always used
- local-config.json <- overwrite default values (for user specific stuff)

### CSS

#### SASS

- https://de.wikipedia.org/wiki/Sass_(Stylesheet-Sprache)
- https://sass-lang.com/

#### Autoprefixer

- https://github.com/postcss/autoprefixer

#### Minifizieren

- https://github.com/cssnano/cssnano

#### Zusammenfügen

- https://www.npmjs.com/package/gulp-concat

#### Sourcemaps

- https://developer.mozilla.org/de/docs/Tools/Debugger/How_to/Use_a_source_map
- https://www.npmjs.com/package/gulp-sourcemaps

## JS

### Babel

Die Konfiguration ist in der '.babelrc' und der '.browserslistrc' -Datei

- https://babeljs.io/
- https://babeljs.io/docs/en/babel-preset-env
- https://joshwcomeau.com/operator-lookup

### Minifizieren

- https://www.npmjs.com/package/gulp-uglify-es
- https://www.npmjs.com/package/terser

#### Zusammenfügen

- https://www.npmjs.com/package/gulp-concat

#### Sourcemaps

- https://developer.mozilla.org/de/docs/Tools/Debugger/How_to/Use_a_source_map
- https://www.npmjs.com/package/gulp-sourcemaps

## Develop

- https://www.npmjs.com/package/browser-sync
