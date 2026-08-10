/* ==========================================================================
   COMLOG — ABOUT
   Requires Swiper
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      if (typeof Swiper === "undefined") {
        console.warn("Comlog About: Swiper is missing.");
        return;
      }
  
      initQuotesSlider();
    });
  
    function remToPx(value) {
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  
      return value * rootFontSize;
    }
  
    function getQuotesSpacing() {
      return window.innerWidth >= 992 ? remToPx(1.5) : remToPx(1);
    }
  
    function getNavigation(slider) {
      const section = slider.closest(".section") || slider.parentElement;
  
      return {
        previous:
          section?.querySelector(
            ".swiper--button-wrap.is--quotes .swiper--button.is--previous",
          ) ||
          section?.querySelector(".swiper--button.is--previous") ||
          null,
  
        next:
          section?.querySelector(
            ".swiper--button-wrap.is--quotes .swiper--button.is--next",
          ) ||
          section?.querySelector(".swiper--button.is--next") ||
          null,
      };
    }
  
    function bindResponsiveSpacing(swiper) {
      let resizeFrame = null;
  
      const update = () => {
        if (resizeFrame) {
          cancelAnimationFrame(resizeFrame);
        }
  
        resizeFrame = requestAnimationFrame(() => {
          const spacing = getQuotesSpacing();
  
          if (swiper.params.spaceBetween !== spacing) {
            swiper.params.spaceBetween = spacing;
            swiper.update();
  
            if (typeof swiper.loopFix === "function") {
              swiper.loopFix();
            }
          }
        });
      };
  
      window.addEventListener("resize", update, { passive: true });
      window.addEventListener("orientationchange", update, { passive: true });
    }
  
    function initQuotesSlider() {
      const sliders = document.querySelectorAll(".swiper.is--quotes");
  
      sliders.forEach((slider) => {
        if (slider.swiper) return;
  
        const navigation = getNavigation(slider);
        const slides = slider.querySelectorAll(".swiper-slide.is--quotes");
  
        if (!slides.length) return;
  
        const swiper = new Swiper(slider, {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: getQuotesSpacing(),
          speed: 700,

          loop: slides.length > 2,
          loopAdditionalSlides: Math.min(slides.length, 4),
          loopPreventsSliding: false,

          centeredSlides: false,
          centerInsufficientSlides: false,

          grabCursor: true,
          watchOverflow: false,

          observer: true,
          observeParents: true,
          observeSlideChildren: true,

          resistanceRatio: 0.75,
          roundLengths: false,

          breakpoints: {
            992: {
              slidesPerView: 2,
              slidesPerGroup: 1,
            },
          },

          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },

          navigation: {
            prevEl: navigation.previous,
            nextEl: navigation.next,
          },

          on: {
            init(instance) {
              instance.el.classList.add("is--ready");
            },

            resize(instance) {
              instance.params.spaceBetween = getQuotesSpacing();
              instance.update();
            },
          },
        });
  
        bindResponsiveSpacing(swiper);
      });
    }
  })();