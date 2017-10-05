let scrollMenu = (function() {
    const $news = document.querySelector('.blog-post__item');
    const $item = document.querySelector('.blog-menu__item');
    const $wrapMenu = document.querySelector('.blog-menu');
    let positionArticle = [];
    let offsetHeight = 0; // смещение реагирования на сменю меню
  
    let _setPositionArticle = function(element) {
        const len = element.length;
        element.each(function(i) {
            positionArticle[i] = {};
            positionArticle[i].top = $(this).offset().top - offsetHeight;
            positionArticle[i].bottom = positionArticle[i].top + $(this).innerHeight();
        });
    };
  
    let _scrollPageFixMenu = function(e) {
        let scroll = window.pageYOffset;
        if (scroll < $news.offset().top) {
            $wrapMenu.removeClass('fixed');
        } else {
            $wrapMenu.addClass('fixed');
        }
    };
  
    let _scrollPage = function(e) {
        let scroll = window.pageYOffset;
        positionArticle.forEach( (element, index) => {
            if (
                scroll >= element.top &&
                scroll <= element.bottom
            ) {
                $item
                    .eq(index)
                    .addClass('blog-menu__item--active')
                    .siblings()
                    .removeClass('blog-menu__item--active');
            }
        });
    };
  
    let clickMenu = function(e) {
        let $element = document.querySelector(e.target);
        let index = $element.index();
        let sectionOffset = positionArticle[index].top;

        $(document).off('scroll', _scrollPage);
        $element.siblings().removeClass('blog-menu__item--active');
        $('body, html').animate(
            {
                scrollTop: sectionOffset,
            },
            1000,
            () => {
                $element.addClass('blog-menu__item--active');
                $(document).on('scroll', _scrollPage);
            }
        );
    };
  
    let addListener = function() {
        $('.blog-menu__list').on('click', clickMenu);
        $(document).on('scroll', _scrollPage);
        $(document).on('scroll', _scrollPageFixMenu);

        $(window).on('load', function(e) {
            _setPositionArticle($news);
        });
        $(window).on('resize', function(e) {
            _setPositionArticle($news);
        });
    };
  
    return {
        init: addListener,
    };
})();
  
// scrollMenu.init();

module.exports = scrollMenu;
  