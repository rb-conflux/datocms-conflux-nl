
/*
| ==========================================================
| Scroll To Top
| ========================================================== */

$(document).ready(function() {
    'use strict';
    // Scroll To Top
    $('body').prepend('<div class="go-top"><span id="top"><img src="/assets/img/scroll-to-top.svg" alt="top" /></span></div>');

    $(window).scroll(function() {
        if ($(window).scrollTop() > 500) {
            $('.go-top').fadeIn(600);
        } else {
            $('.go-top').fadeOut(600);
        }
    });

    $('#top').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

});