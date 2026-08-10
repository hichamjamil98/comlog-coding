/* ==========================================================================
   COMLOG — KARRIERE
   Requires Swiper
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof Swiper === "undefined") {
      console.warn("Comlog Karriere: Swiper is missing.");
      return;
    }

    initKarriereSlider();
  });

  function remToPx(value) {
    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    return value * rootFontSize;
  }

  function getKarriereSpacing() {
    const width = window.innerWidth;

    if (width >= 992) return remToPx(1.5);
    if (width >= 768) return remToPx(1);

    return 0;
  }

  function getNavigation(slider) {
    const section = slider.closest(".section") || slider.parentElement;

    return {
      previous:
        section?.querySelector(
          ".swiper--button-wrap.is--karriere .swiper--button.is--previous",
        ) || null,
      next:
        section?.querySelector(
          ".swiper--button-wrap.is--karriere .swiper--button.is--next",
        ) || null,
    };
  }

  function bindResponsiveSpacing(swiper) {
    let resizeFrame = null;

    const update = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(() => {
        const spacing = getKarriereSpacing();

        if (swiper.params.spaceBetween !== spacing) {
          swiper.params.spaceBetween = spacing;
          swiper.update();
        }
      });
    };

    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
  }

  function initKarriereSlider() {
    const sliders = document.querySelectorAll(".swiper.is--karriere-slider");

    sliders.forEach((slider) => {
      if (slider.swiper) return;

      const slides = slider.querySelectorAll(".swiper-slide");
      if (!slides.length) return;

      const navigation = getNavigation(slider);

      const swiper = new Swiper(slider, {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: getKarriereSpacing(),
        speed: 750,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        resistanceRatio: 0.75,

        breakpoints: {
          992: {
            slidesPerView: 3,
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
      });

      [navigation.previous, navigation.next].filter(Boolean).forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
        });
      });

      bindResponsiveSpacing(swiper);
    });
  }
})();
