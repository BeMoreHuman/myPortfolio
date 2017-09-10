const gulp = require('gulp');//вызываем gulp
const del = require('del');//плагин, который удаляет все ненужное
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');

// styles 
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

// scripts
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js')

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
        src: 'src/images/**/*.*',//пути исходников
        dest: 'build/assets/images/'//пути местоположения
    }
};

// pug - функция описывающая что мы будем делать с исходниками; return - указываем что мы Возвращаем в поток
function templates() {
    return gulp.src('./src/templates/pages/*.pug')//взяли исходники (на выходе должны получить просто 4-е страницы html)
        .pipe(pug({ pretty: true }))//запустили в Трубу, и внутри нее мы запускаем компиляцию из pug > html файлы. pretty: true - что бы html файл был красивый(с отступами), а не в одну строку
        .pipe(gulp.dest(paths.root));//указываем куда нам нужно положить файлы из трубы - paths.root = папка ./build
}

// scss
function styles() {
    return gulp.src('./src/styles/app.scss')//указываем наш главный файл стилей 
        .pipe(sourcemaps.init())//инициализируем сорсмапы - взяв все исходники
        .pipe(sass({outputStyle: 'compressed'}))//сжимаем/ минификацию производим
        .pipe(sourcemaps.write())//записываем сорсмап
        .pipe(rename({suffix: '.min'}))//и пепеименовываем наш файл добавив префикс min
        .pipe(gulp.dest(paths.styles.dest))//и кладем его/ выкидываем из Трубы в папку назначения paths.styles.dest = build/assets/styles
}

// webpack
function scripts() {
    return gulp.src('src/scripts/app.js')//берем исходник (точку входа/ главный js файл)
        .pipe(gulpWebpack(webpackConfig, webpack))//вызываем функцию gulpWebpack и передаем в нее два аргумента: webpackConfig - где будет описано то как будет работать сам webpack, и webpack - так как я хочу именно 3-й версии. Если там идет 2-й версии и мне подходит, то второй аргумент можно не писать.
        .pipe(gulp.dest(paths.scripts.dest));//и в результате кладем в папку paths.scripts.dest = build/assets/scripts/
}

// очистка папки build
function clean() {
    return del(paths.root);//производим очистку/ удаляем paths.root = ./build --- папку с нашим итоговым продуктом
}

// просто переносим картинки
function images() {
    return gulp.src(paths.images.src)
          .pipe(gulp.dest(paths.images.dest));
}

// следим за src и запускаем нужные таски (компиляция и пр.)
function watch() {
    gulp.watch(paths.scripts.src, scripts);//мы следим за исходниками папки scripts и когда их изменяем - запускаем функцию scripts
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
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
exports.watch = watch;
exports.server = server;

// сборка и слежка
//создаем Таск, series - означает последовательно выполни чистку/ parallel - параллельно ...
gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, scripts, templates, images),
    gulp.parallel(watch, server)
));