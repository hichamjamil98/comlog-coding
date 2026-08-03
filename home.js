/* ==========================================================================
   COMLOG — HOME
   Requires Swiper
========================================================================== */

(() => {
    "use strict";
  
    document.addEventListener("DOMContentLoaded", () => {
      if (typeof Swiper === "undefined") {
        console.warn("Comlog Home: Swiper is missing.");
        return;
      }
  
      initServicesSlider();
      initProjectsSlider();
    });
  
    /* =========================================================================
       HELPERS
    ========================================================================= */
  
    /**
     * Converts a rem value to pixels using the current root font size.
     *
     * @param {number} value
     * @returns {number}
     */
    function remToPx(value) {
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  
      return value * rootFontSize;
    }
  
    /**
     * Returns the navigation buttons located in the same section as the slider.
     *
     * @param {Element} slider
     * @param {string} previousSelector
     * @param {string} nextSelector
     * @returns {{previous: Element|null, next: Element|null}}
     */
    function getSectionNavigation(slider, previousSelector, nextSelector) {
      const section = slider.closest(".section") || slider.parentElement;
  
      return {
        previous: section?.querySelector(previousSelector) || null,
        next: section?.querySelector(nextSelector) || null,
      };
    }
  
    /**
     * Recalculates Swiper spacing when the root rem value changes responsively.
     *
     * @param {Swiper} swiper
     * @param {() => number} getSpacing
     */
    function bindResponsiveSpacing(swiper, getSpacing) {
      let resizeFrame = null;
  
      const updateSpacing = () => {
        if (resizeFrame) {
          cancelAnimationFrame(resizeFrame);
        }
  
        resizeFrame = requestAnimationFrame(() => {
          const spacing = getSpacing();
  
          if (swiper.params.spaceBetween !== spacing) {
            swiper.params.spaceBetween = spacing;
            swiper.update();
          }
        });
      };
  
      window.addEventListener("resize", updateSpacing, { passive: true });
      window.addEventListener("orientationchange", updateSpacing, {
        passive: true,
      });
    }
  
    /* =========================================================================
       SERVICES SLIDER
    ========================================================================= */
  
    function initServicesSlider() {
      const sliders = document.querySelectorAll(".swiper.is--services");
  
      sliders.forEach((slider) => {
        if (slider.swiper) return;
  
        const navigation = getSectionNavigation(
          slider,
          ".swiper--button.is--previous.is--red",
          ".swiper--button.is--next.is--red",
        );
  
        const getSpacing = () => {
          const width = window.innerWidth;
  
          if (width >= 992) return 0;
          if (width >= 768) return remToPx(1);
  
          return 0;
        };
  
        const swiper = new Swiper(slider, {
          slidesPerView: "auto",
          spaceBetween: getSpacing(),
          speed: 750,
          grabCursor: true,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          resistanceRatio: 0.75,
          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },
          navigation: {
            prevEl: navigation.previous,
            nextEl: navigation.next,
          },
        });
  
        bindResponsiveSpacing(swiper, getSpacing);
      });
    }
  
    /* =========================================================================
       PROJECTS SLIDER
    ========================================================================= */
  
    function initProjectsSlider() {
      const sliders = document.querySelectorAll(".swiper.is--projects");
  
      sliders.forEach((slider) => {
        if (slider.swiper) return;
  
        const navigation = getSectionNavigation(
          slider,
          ".swiper--button.is--previous:not(.is--red)",
          ".swiper--button.is--next:not(.is--red)",
        );
  
        const getSpacing = () => {
          const width = window.innerWidth;
  
          if (width >= 992) return remToPx(1.5);
          if (width >= 768) return remToPx(1);
  
          return 0;
        };
  
        const swiper = new Swiper(slider, {
          slidesPerView: "auto",
          spaceBetween: getSpacing(),
          speed: 750,
          grabCursor: true,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          resistanceRatio: 0.75,
          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },
          navigation: {
            prevEl: navigation.previous,
            nextEl: navigation.next,
          },
        });
  
        bindResponsiveSpacing(swiper, getSpacing);
      });
    }
  })();