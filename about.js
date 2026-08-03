/* ==========================================================================
   COMLOG — ABOUT
   Requires Swiper
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      if (typeof Swiper === "undefined") return;
  
      initQuotesSlider();
    });
  
    function rem(value) {
      return (
        value *
        parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    }
  
    function spacing() {
      if (window.innerWidth >= 992) return rem(1.5);
      return rem(1);
    }
  
    function initQuotesSlider() {
      const slider = document.querySelector(".swiper.is--quotes");
      if (!slider || slider.swiper) return;
  
      const section = slider.closest(".section");
  
      const swiper = new Swiper(slider, {
        slidesPerView: "auto",
        spaceBetween: spacing(),
        speed: 700,
        grabCursor: true,
        observer: true,
        observeParents: true,
        watchOverflow: false,
  
        navigation: {
          prevEl: section.querySelector(".swiper--button.is--previous"),
          nextEl: section.querySelector(".swiper--button.is--next"),
        },
      });
  
      window.addEventListener("resize", () => {
        swiper.params.spaceBetween = spacing();
        swiper.update();
      });
    }
  })();