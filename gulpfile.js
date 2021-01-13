// node stuff
const path = require('path');
const fs = require('fs');

// gulp itself
const gulp = require('gulp');
const log = require('gulplog');

// common
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const notifier = require('node-notifier');
const deepmerge = require('deepmerge');
const {copyFiles, deleteFiles, fileNames} = require('./util');

const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const rename = require('gulp-rename');

// css specific
const sass = require('gulp-sass');
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

// js specific
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;

// develop
const browserSync = require('browser-sync').create();
const isPortReachable = require('is-port-reachable');
const portscanner = require('portscanner')

// doc
const markdownPdf = require('gulp-markdown-pdf');

// config
const defaultConfigPath = path.resolve(__dirname, 'default-config.json');
const localConfigPath = path.resolve(__dirname, 'local-config.json');
const config = (fs.existsSync(localConfigPath))
    ? deepmerge(require(defaultConfigPath), require(localConfigPath))
    : require(defaultConfigPath);

const target = {
    fs: {
        app: {
            css: {
                processed: path.resolve(config.css.app.target.dist, config.css.app.target.name.processed),
                processedMap: path.resolve(config.css.app.target.dist, config.css.app.target.name.processed + config.css.app.target.name.mapPostfix),
                minified: path.resolve(config.css.app.target.dist, config.css.app.target.name.minified),
                minifiedMap: path.resolve(config.css.app.target.dist, config.css.app.target.name.minified + config.css.app.target.name.mapPostfix),
            },
            js: {
                processed: path.resolve(config.js.app.target.dist, config.js.app.target.name.processed),
                processedMap: path.resolve(config.js.app.target.dist, config.js.app.target.name.processed + config.js.app.target.name.mapPostfix),
                minified: path.resolve(config.js.app.target.dist, config.js.app.target.name.minified),
                minifiedMap: path.resolve(config.js.app.target.dist, config.js.app.target.name.minified + config.js.app.target.name.mapPostfix),
            }
        },
        vendor: {
            css: {
                processed: path.resolve(config.css.vendor.target.dist, config.css.vendor.target.name.processed),
                processedMap: path.resolve(config.css.vendor.target.dist, config.css.vendor.target.name.processed + config.css.vendor.target.name.mapPostfix),
                minified: path.resolve(config.css.vendor.target.dist, config.css.vendor.target.name.minified),
                minifiedMap: path.resolve(config.css.vendor.target.dist, config.css.vendor.target.name.minified + config.css.vendor.target.name.mapPostfix),
            },
            js: {
                processed: path.resolve(config.js.vendor.target.dist, config.js.vendor.target.name.processed),
                processedMap: path.resolve(config.js.vendor.target.dist, config.js.vendor.target.name.processed + config.js.vendor.target.name.mapPostfix),
                minified: path.resolve(config.js.vendor.target.dist, config.js.vendor.target.name.minified),
                minifiedMap: path.resolve(config.js.vendor.target.dist, config.js.vendor.target.name.minified + config.js.vendor.target.name.mapPostfix),
            }
        }
    },
    web: {
        map: []
    }
}

config.css.app.develop.maskUrl.forEach(maskUrl => {
    target.web.map.push({
        dir: target.fs.app.css.processed,
        route: maskUrl + config.css.app.target.name.processed
    });
    target.web.map.push({
        dir: target.fs.app.css.processedMap,
        route: maskUrl + config.css.app.target.name.processed + config.css.app.target.name.mapPostfix
    });
    target.web.map.push({
        dir: target.fs.app.css.minified,
        route: maskUrl + config.css.app.target.name.minified
    });
    target.web.map.push({
        dir: target.fs.app.css.minifiedMap,
        route: maskUrl + config.css.app.target.name.minified + config.css.app.target.name.mapPostfix
    });
});
config.css.vendor.develop.maskUrl.forEach(maskUrl => {
    target.web.map.push({
        dir: target.fs.vendor.css.processed,
        route: maskUrl + config.css.vendor.target.name.processed
    });
    target.web.map.push({
        dir: target.fs.vendor.css.processedMap,
        route: maskUrl + config.css.vendor.target.name.processed + config.css.vendor.target.name.mapPostfix
    });
    target.web.map.push({
        dir: target.fs.vendor.css.minified,
        route: maskUrl + config.css.vendor.target.name.minified
    });
    target.web.map.push({
        dir: target.fs.vendor.css.minifiedMap,
        route: maskUrl + config.css.vendor.target.name.minified + config.css.vendor.target.name.mapPostfix
    });
});
config.js.app.develop.maskUrl.forEach(maskUrl => {
    target.web.map.push({
        dir: target.fs.app.js.processed,
        route: maskUrl + config.js.app.target.name.processed
    });
    target.web.map.push({
        dir: target.fs.app.js.processedMap,
        route: maskUrl + config.js.app.target.name.processed + config.js.app.target.name.mapPostfix
    });
    target.web.map.push({
        dir: target.fs.app.js.minified,
        route: maskUrl + config.js.app.target.name.minified
    });
    target.web.map.push({
        dir: target.fs.app.js.minifiedMap,
        route: maskUrl + config.js.app.target.name.minified + config.js.app.target.name.mapPostfix
    });
});
config.js.vendor.develop.maskUrl.forEach(maskUrl => {
    target.web.map.push({
        dir: target.fs.vendor.js.processed,
        route: maskUrl + config.js.vendor.target.name.processed
    });
    target.web.map.push({
        dir: target.fs.vendor.js.processedMap,
        route: maskUrl + config.js.vendor.target.name.processed + config.js.vendor.target.name.mapPostfix
    });
    target.web.map.push({
        dir: target.fs.vendor.js.minified,
        route: maskUrl + config.js.vendor.target.name.minified
    });
    target.web.map.push({
        dir: target.fs.vendor.js.minifiedMap,
        route: maskUrl + config.js.vendor.target.name.minified + config.js.vendor.target.name.mapPostfix
    });
});

target.fs.app.css.all = [
    target.fs.app.css.processed,
    target.fs.app.css.processedMap,
    target.fs.app.css.minified,
    target.fs.app.css.minifiedMap,
    target.fs.vendor.css.processed,
    target.fs.vendor.css.processedMap,
    target.fs.vendor.css.minified,
    target.fs.vendor.css.minifiedMap,
]
target.fs.vendor.css.all = [
    target.fs.vendor.css.processed,
    target.fs.vendor.css.processedMap,
    target.fs.vendor.css.minified,
    target.fs.vendor.css.minifiedMap,
]

target.fs.app.js.all = [
    target.fs.app.js.processed,
    target.fs.app.js.processedMap,
    target.fs.app.js.minified,
    target.fs.app.js.minifiedMap,
]
target.fs.vendor.js.all = [
    target.fs.vendor.js.processed,
    target.fs.vendor.js.processedMap,
    target.fs.vendor.js.minified,
    target.fs.vendor.js.minifiedMap,
]

// Variables
let failOnError = true;

function onError(err) {
    notify.onError({
        title: "Gulp Error(<%= error.plugin %>)",
        message: "Error: <%= error.message %>",
        sound: "Bottle",
        timeout: 5
    })(err);

    if (failOnError) {
        process.exit();
    } else {
        this.emit('end');
    }
}

// ==================== APP - CSS ====================
gulp.task('build-app-css-unminified', () => {
    return gulp
        .src(config.css.app.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(concat(config.css.app.target.name.processed))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.css.app.target.dist));
});

gulp.task('build-app-css-minified', () => {
    return gulp
        .src(config.css.app.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat(config.css.app.target.name.minified))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.css.app.target.dist));
});

gulp.task('copy-app-css', (cb) => {
    copyFiles([
        target.fs.app.css.processed,
        target.fs.app.css.processedMap,
        target.fs.app.css.minified,
        target.fs.app.css.minifiedMap
    ], config.css.app.target.path);
    cb();
});

gulp.task('clean-app-css', (cb) => {
    const fn = fileNames([
        target.fs.app.css.processed,
        target.fs.app.css.processedMap,
        target.fs.app.css.minified,
        target.fs.app.css.minifiedMap
    ]);
    deleteFiles([config.css.app.target.dist].concat(config.css.app.target.path), fn);
    cb();
});

// ==================== VENDOR - CSS ====================
gulp.task('build-vendor-css-unminified', () => {
    return gulp
        .src(config.css.vendor.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(concat(config.css.vendor.target.name.processed))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.css.vendor.target.dist));
});

gulp.task('build-vendor-css-minified', () => {
    return gulp
        .src(config.css.vendor.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat(config.css.vendor.target.name.minified))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.css.vendor.target.path));
});


gulp.task('copy-vendor-css', (cb) => {
    copyFiles([
        target.fs.vendor.css.processed,
        target.fs.vendor.css.processedMap,
        target.fs.vendor.css.minified,
        target.fs.vendor.css.minifiedMap
    ], config.css.vendor.target.path);
    cb();
});

gulp.task('clean-vendor-css', (cb) => {
    const fn = fileNames([
        target.fs.vendor.css.processed,
        target.fs.vendor.css.processedMap,
        target.fs.vendor.css.minified,
        target.fs.vendor.css.minifiedMap
    ]);
    deleteFiles([config.css.vendor.target.dist].concat(config.css.vendor.target.path), fn);
    cb();
});


// ==================== APP - JS ====================
gulp.task('build-app-js-unminified', () => {
    return gulp
        .src(config.js.app.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(babel())
        .pipe(concat(config.js.app.target.name.processed))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.app.target.dist))
});

gulp.task('build-app-js-minified', () => {
    return gulp
        .src(config.js.app.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat(config.js.app.target.name.minified))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.app.target.dist))
});

gulp.task('copy-app-js', (cb) => {
    copyFiles([
        target.fs.app.js.processed,
        target.fs.app.js.processedMap,
        target.fs.app.js.minified,
        target.fs.app.js.minifiedMap
    ], config.js.app.target.path);
    cb();
});

gulp.task('clean-app-js', (cb) => {
    const fn = fileNames([
        target.fs.app.js.processed,
        target.fs.app.js.processedMap,
        target.fs.app.js.minified,
        target.fs.app.js.minifiedMap
    ]);
    deleteFiles([config.js.app.target.dist].concat(config.js.app.target.path), fn);
    cb();
});

// ==================== VENDOR - JS ====================
gulp.task('build-vendor-js-unminified', () => {
    return gulp
        .src(config.js.vendor.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(concat(config.js.vendor.target.name.processed))
        .pipe(babel({
            presets: ['@babel/env'],
            sourceType: 'script',
            compact: false,
            minified: false,
        }))

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.vendor.target.dist));
});

gulp.task('build-vendor-js-minified', () => {
    return gulp
        .src(config.js.vendor.src)
        .pipe(plumber(onError))
        .pipe(sourcemaps.init())

        .pipe(concat(config.js.vendor.target.name.minified))
        .pipe(babel({
            presets: ['@babel/env'],
            sourceType: 'script',
            compact: true,
            minified: true,
        }))
        //.pipe(uglify())

        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.vendor.target.dist));
});

gulp.task('copy-vendor-js', (cb) => {
    copyFiles([
        target.fs.vendor.js.processed,
        target.fs.vendor.js.processedMap,
        target.fs.vendor.js.minified,
        target.fs.vendor.js.minifiedMap
    ], config.js.vendor.target.path);
    cb();
});

gulp.task('clean-vendor-js', (cb) => {
    const fn = fileNames([
        target.fs.vendor.js.processed,
        target.fs.vendor.js.processedMap,
        target.fs.vendor.js.minified,
        target.fs.vendor.js.minifiedMap
    ]);
    deleteFiles([config.js.vendor.target.dist].concat(config.js.vendor.target.path), fn);
    cb();
});

// ==================== CLEAN ====================
gulp.task('clean-dist', () => {
    return gulp
        .src(config.clean.src, {read: false, allowEmpty: true})
        .pipe(plumber(onError))
        .pipe(clean());
});

// ==================== DOC ====================
gulp.task('build-doc', cb => {
    return gulp
        .src(config.doc.src)
        .pipe(markdownPdf({cwd: config.doc.workDir}))
        .pipe(gulp.dest(config.doc.target.dist))
});


// ==================== DEVELOP ====================
gulp.task('init-develop', cb => {
    failOnError = false;
    cb();
});

gulp.task('reload', cb => {
    console.log('------- RELOAD -------')
    browserSync.reload();
    cb();
});

async function checkPortInUse(host, port) {
    return new Promise((resolve, reject) => {
        portscanner.checkPortStatus(port, host, function (error, status) {
            if (error) {
                reject(error);
            }
            resolve(status === 'open');
        });
    })
}

gulp.task('watch', async cb => {
    console.log('START SERVER');

    const proxyTarget = `${config.develop.proxy.target.host}:${config.develop.proxy.target.port}`
    const proxyConnector = `${config.develop.proxy.connector.host}:${config.develop.proxy.connector.port}`

    // don't start if port is already in use
    const message = `port '${proxyConnector}' is already in use (is another Browsersync instance running?)`;
    if (await checkPortInUse(config.develop.proxy.connector.host, config.develop.proxy.connector.port)) {
        const err = new Error(message);
        notify.onError({
            title: "Proxy Error",
            message,
            sound: "Bottle",
            timeout: 10
        })(err);
        throw err;
    }

    let bsOptions = {
        serveStatic: target.web.map,
        host: config.develop.proxy.connector.host,
        port: config.develop.proxy.connector.port,
        ui: {
            port: config.develop.ui.port
        },

        open: false,
        online: false,
        ghostMode: {
            clicks: true,
            forms: true,
            scroll: false
        },
        reloadOnRestart: true,

        logLevel: "info",
        logConnections: true,
        logFileChanges: true,

        proxy: {
            target: proxyTarget,
            proxyReq: [
                function (proxyReq) {
                    console.log("REQUEST", proxyReq.path);
                }
            ]
        },
    };
    browserSync.init(bsOptions);
    notifier.notify({title: 'Proxy startet', message: proxyConnector, timeout: 5, open: 'http://' + proxyConnector});

    const watchFiles = config.css.app.develop.watch
        .concat(config.js.vendor.develop.watch)
        .concat(config.js.app.develop.watch)
        .concat(config.js.vendor.develop.watch);

    bsOptions.serveStatic.forEach(v => {
        console.log('PROXY File from FS', `'${v.dir}' -> '${v.route}'`);
    });

    console.log('WATCHING app.css:', config.css.app.develop.watch);
    console.log('WATCHING app.js:', config.js.app.develop.watch);
    console.log('WATCHING vendor.css:', config.css.vendor.develop.watch);
    console.log('WATCHING vendor.js:', config.js.vendor.develop.watch);

    gulp.watch(config.css.app.develop.watch, gulp.series('build-app-css', 'copy-app-css', 'reload'));
    gulp.watch(config.css.vendor.develop.watch, gulp.series('build-vendor-css', 'copy-vendor-css', 'reload'));
    gulp.watch(config.js.app.develop.watch, gulp.series('build-app-js', 'copy-app-js', 'reload'));
    gulp.watch(config.js.vendor.develop.watch, gulp.series('build-vendor-js', 'copy-vendor-js', 'reload'));
    gulp.watch(config.doc.src, gulp.series('build-doc'));

    // check for proxy target available. Auto restart browser sync due to unreachable problems
    let isReachable = 'initial';
    if (config.develop.proxy.reachableCheck.enabled === true) {
        setInterval(async () => {
            const ir = await isPortReachable(config.develop.proxy.target.port, config.develop.proxy.target.port);
            if (ir !== isReachable) {
                console.log(`Proxy target reachable changed to: ${ir}`)
                if (isReachable !== 'initial') {
                    if (ir) {
                        // restart
                        console.log('Proxy target is reachable again. Restart Browsersync.');
                        browserSync.exit();
                        browserSync.init(bsOptions);
                        notifier.notify({title: 'Proxy restartet', message: proxyTarget, timeout: 5, open: 'http://' + proxyTarget});
                    }
                }
                isReachable = ir;
            }
        }, config.develop.proxy.reachableCheck.interval);
    }

});

// build
gulp.task('build-app-css', gulp.parallel('build-app-css-unminified', 'build-app-css-minified'));
gulp.task('build-app-js', gulp.parallel('build-app-js-unminified', 'build-app-js-minified'));
gulp.task('build-app', gulp.parallel('build-app-css', 'build-app-js'));

gulp.task('build-vendor-css', gulp.parallel('build-vendor-css-unminified', 'build-vendor-css-minified'));
gulp.task('build-vendor-js', gulp.parallel('build-vendor-js-unminified', 'build-vendor-js-minified'));
gulp.task('build-vendor', gulp.parallel('build-vendor-css', 'build-vendor-js'));

gulp.task('build-all', gulp.parallel('build-app', 'build-vendor', 'build-doc'));

// copy
gulp.task('copy-all', gulp.parallel('copy-app-css', 'copy-app-js', 'copy-vendor-css', 'copy-vendor-js'));

// clean
gulp.task('clean-all', gulp.parallel('clean-dist'));

// develop
gulp.task('develop', gulp.series('init-develop', 'clean-all', 'build-all', 'copy-all', 'watch'));
gulp.task('serve', gulp.series('develop'));

// test
gulp.task('noop', (cb) => {
    log.info('NOOP');
    cb();
});
gulp.task('pl', (cb) => {
//    const pl = require('@pattern-lab/core');


    const config = require('./patternlab-config.json');
    const     patternlab = require('@pattern-lab/core')(config);
    const buildResult = patternlab.build(() => {});
    return buildResult;
});


// default
exports.default = gulp.series('clean-all', 'build-all', 'copy-all');
