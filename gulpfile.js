const gulp = require('gulp');//вызываем gulp
const del = require('del');//плагин, который удаляет все ненужное
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');//Prevent pipe breaking caused by errors from gulp plugins

// styles 
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const normalize = require('node-normalize-scss');

// scripts
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const gulpEslint = require('gulp-eslint');
const autoprefixer = require('gulp-autoprefixer');
// не используется
//const eslint = require('eslint');

// img
const imageMin = require('gulp-imagemin');//Minify PNG, JPEG, GIF and SVG images

// оповещения
const notify = require('gulp-notify');

// fonts
const ttf2woff = require('gulp-ttf2woff');//Create a WOFF font from a TTF one

// sprite
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const svgSprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');

// для удобства все пути в одном месте
const paths = {
    root: './build',//папка куда будет все собираться - в нее будет смотреть browsersync
    styles: {
        src: 'src/styles/**/*.scss',//где лежат все стили
        dest: 'build/assets/styles/'//куда мне нужно положить после сборки
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts/'
    },
    templates: {
        src: 'src/templates/**/*.pug',//исходники
        dest: 'build/assets/'//путь куда нужго будет положить результирующие/ скомпилированные html файлы положить
    },
    images: {
        favicon: 'src/images/favicon.*',
        src: ['src/images/**/*.+(jpg|png|gif|svg)', '!src/img/favicon.*'],//пути исходников
        dest: 'build/assets/images/'//пути местоположения
    },
    sprite: {
        src: 'src/sprite/**/*.svg',
        dest: 'src/images/'
      },
    fonts:{
        src: 'src/fonts/**/*.ttf',
        dest: 'build/fonts/'
      },
};

// Fonts Conversion and Copying
function fontsConvert() {
    return gulp.src(paths.fonts.src)
        .pipe(plumber())
        .pipe(ttf2woff())
        .pipe(notify('Fonts convert successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.fonts.dest))
}

// svg спрайт
function toSvg() {
    return gulp
        .src(paths.sprite.src)
        .pipe(plumber())
        .pipe(
            svgmin({
                js2svg: {
                    pretty: true
                }
            })
        )
        .pipe(
            cheerio({
                run: function($) {
                    $('[fill]').removeAttr('fill');
                    $('[stroke]').removeAttr('stroke');
                    $('[style]').removeAttr('style');
                },
                parserOptions: {
                    xmlMode: true
                }
            })
        )
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg",
                    example: {
                        dest: '../tmp/spriteSvgDemo.html' // демо html
                    }
                }
            }
        }))
        .pipe(notify('Sprite created successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.sprite.dest))
}

// переносим картинки favicon
function images() {
    return gulp.src(paths.images.favicon)
        .pipe(gulp.dest(paths.images.dest));
}

// переносим картинки sprite
function img() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

// image compression
function imageMinify() {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(imageMin())
        .pipe(notify('Images compressed successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.images.dest))
}

// pug - функция описывающая что мы будем делать с исходниками; return - указываем что мы Возвращаем в поток
function templates() {
    return gulp.src('./src/templates/pages/*.pug')//взяли исходники (на выходе должны получить просто 4-е страницы html)
        .pipe(plumber())    
        .pipe(pug({ pretty: true }))//запустили в Трубу, и внутри нее мы запускаем компиляцию из pug > html файлы. pretty: true - что бы html файл был красивый(с отступами), а не в одну строку
        .pipe(notify('Pug convert successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.root));//указываем куда нам нужно положить файлы из трубы - paths.root = папка ./build
}

// scss
function styles() {
    return gulp.src('./src/styles/app.scss')//указываем наш главный файл стилей 
        .pipe(plumber())
        .pipe(sourcemaps.init())//инициализируем сорсмапы - взяв все исходники
        .pipe(sass({outputStyle: 'compressed', includePaths: require('node-normalize-scss').includePaths}))//сжимаем/ минификацию производим
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))//добавляем префиксы для поддержки старых браузеров
        .pipe(sourcemaps.write())//записываем сорсмап
        .pipe(rename({suffix: '.min'}))//и пепеименовываем наш файл добавив префикс min
        .pipe(notify('Sass convert successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.styles.dest))//и кладем его/ выкидываем из Трубы в папку назначения paths.styles.dest = build/assets/styles
}

// webpack - минифицируем файл js и добавляем сорсмапу...
function scripts() {
    return gulp.src('src/scripts/app.js')//берем исходник (точку входа/ главный js файл)
        .pipe(plumber())
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpWebpack(webpackConfig, webpack))//вызываем функцию gulpWebpack и передаем в нее два аргумента: webpackConfig - где будет описано то как будет работать сам webpack, и webpack - так как я хочу именно 3-й версии. Если там идет 2-й версии и мне подходит, то второй аргумент можно не писать.
        .pipe(notify('Scripts convert successfully'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.scripts.dest));//и в результате кладем в папку paths.scripts.dest = build/assets/scripts/
}

// очистка папки build
function clean() {
    return del(paths.root);//производим очистку/ удаляем paths.root = ./build --- папку с нашим итоговым продуктом
}

// следим за src и запускаем нужные таски (компиляция и пр.)
function watch() {
    gulp.watch(paths.scripts.src, scripts);//мы следим за исходниками папки scripts и когда их изменяем - запускаем функцию scripts
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, imageMinify);
    gulp.watch(paths.fonts.src, fontsConvert);
    gulp.watch(paths.sprite.src, toSvg);
}

// следим за build и релоадим браузер
function server() {
    browserSync.init({
        server: paths.root   //следим за папкой paths.root = ./build
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);//следим за всеми файлами в этой папке {paths.root = ./build} (можно дописывать исключения) и когда что-то изменяется - то перегружаем страницу
}

// экспортируем функции для доступа из терминала (gulp clean)
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.templates = templates;
exports.images = images;
exports.img = img;
exports.watch = watch;
exports.server = server;
exports.toSvg = toSvg;
exports.imageMinify = imageMinify;
exports.fontsConvert = fontsConvert;

// сборка и слежка
//создаем Таск, series - означает последовательно выполни чистку/ parallel - параллельно ...
gulp.task('default', gulp.series(
    clean,
    gulp.parallel(fontsConvert, imageMinify, toSvg),
    gulp.parallel(styles, templates, scripts, images, img),
    gulp.parallel(watch, server)
));