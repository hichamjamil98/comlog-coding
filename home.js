/* ==========================================================================
   COMLOG — HOME
   Requires GSAP + ScrollTrigger + Swiper
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();

    if (typeof Swiper === "undefined") {
      console.warn("Comlog Home: Swiper is missing.");
      return;
    }

    initServicesSlider();
    initProjectsSlider();
  });

  /* =========================================================================
     HOME LOADING SCREEN
  ========================================================================= */

  function initLoadingScreen() {
    const html = document.documentElement;
    const body = document.body;

    const loader = document.querySelector(".loading--screen");
    const logoWrapper = loader?.querySelector(".brand--loading-wrapper");
    const logo = logoWrapper?.querySelector("img, svg");
    const pageElements = document.querySelectorAll(".main-wrapper, .navbar");

    const revealPageWithoutAnimation = () => {
      pageElements.forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("visibility");
      });

      if (loader) {
        loader.style.display = "none";
        loader.style.pointerEvents = "none";
      }

      html.classList.remove("is-loading");
      body.classList.remove("is-loading");
    };

    if (!loader || typeof window.gsap === "undefined") {
      revealPageWithoutAnimation();
      return;
    }

    const gsap = window.gsap;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      revealPageWithoutAnimation();
      return;
    }

    html.classList.add("is-loading");
    body.classList.add("is-loading");

    gsap.set(loader, {
      display: "flex",
      opacity: 1,
      visibility: "visible",
      clipPath: "inset(0% 0% 0% 0%)",
      pointerEvents: "auto",
    });

    gsap.set(pageElements, {
      opacity: 0,
      visibility: "hidden",
    });

    if (logoWrapper) {
      gsap.set(logoWrapper, {
        opacity: 0,
        scale: 0.88,
        y: "1rem",
      });
    }

    if (logo) {
      gsap.set(logo, {
        opacity: 0,
      });
    }

    const safetyTimeout = window.setTimeout(() => {
      console.warn("Comlog loader safety fallback triggered.");
      revealPageWithoutAnimation();
    }, 6500);

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },

      onComplete: () => {
        window.clearTimeout(safetyTimeout);

        loader.style.display = "none";
        loader.style.pointerEvents = "none";

        html.classList.remove("is-loading");
        body.classList.remove("is-loading");

        gsap.set(pageElements, {
          opacity: 1,
          visibility: "visible",
        });

        gsap.set(pageElements, {
          clearProps: "opacity,visibility",
        });

        if (logoWrapper) {
          gsap.set(logoWrapper, {
            clearProps: "opacity,transform",
          });
        }

        if (logo) {
          gsap.set(logo, {
            clearProps: "opacity,transform",
          });
        }

        window.dispatchEvent(new Event("resize"));

        if (typeof window.ScrollTrigger !== "undefined") {
          window.ScrollTrigger.refresh();
        }
      },
    });

    timeline.addLabel("start", 0);

    if (logoWrapper) {
      timeline.to(
        logoWrapper,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.75,
        },
        "start+=0.1",
      );
    }

    if (logo) {
      timeline.to(
        logo,
        {
          opacity: 1,
          duration: 0.9,
        },
        "start+=0.18",
      );
    }

    timeline.to(
      logoWrapper || logo,
      {
        scale: 1.04,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "start+=1.2",
    );

    timeline.to(
      logoWrapper || logo,
      {
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
      },
      "start+=1.65",
    );

    timeline.addLabel("ready", 2.15);

    if (logoWrapper) {
      timeline.to(
        logoWrapper,
        {
          opacity: 0,
          scale: 0.96,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "ready",
      );
    }

    timeline.to(
      pageElements,
      {
        opacity: 1,
        visibility: "visible",
        duration: 0.7,
        stagger: 0.06,
        ease: "power2.out",
      },
      "ready+=0.15",
    );

    timeline.to(
      loader,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.1,
        ease: "expo.inOut",
        pointerEvents: "none",
      },
      "ready+=0.1",
    );
  }

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
        watchOverflow: false,
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