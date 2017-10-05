let menu = (function(options) {

    let button = document.querySelector(options.button);
    let menu = document.querySelector(options.menu);
    let body = document.querySelector('body');
    
    let _toggleMenu = function(e) {
        button.classList.toggle('button_container--active');
        menu.classList.toggle('overlay--open');
        body.classList.toggle('body-active-menu');
    };
    
    let addListeners = function() {
        button.addEventListener('click', _toggleMenu);
    };
    
    return {
        init: addListeners,
    };
})({
    button: '#toggle',
    menu: '#overlay',
});
    
// menu.init();

module.exports = menu;

