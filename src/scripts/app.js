const slider = require('./common/slider');
const $ = require('jquery'); // если будет нужен
const burgerMenu = require('./common/burgerMenu');
const parallax = require('./common/parallax');

const scrollOnBlog = require('./common/scrollOnBlog');

slider(); // инициализируем слайдер
$();

burgerMenu.init();

scrollOnBlog.init();
