/* ==========================================================================
   COMLOG — HOME
   Requires GSAP + ScrollTrigger + Swiper
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();
    initServicesHover();

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
    const sessionKey = "comlog-loader-seen";

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

    const markLoaderSeen = () => {
      try {
        sessionStorage.setItem(sessionKey, "1");
      } catch (_) {
        /* private mode / blocked storage */
      }
    };

    const hasSeenLoader = () => {
      try {
        return sessionStorage.getItem(sessionKey) === "1";
      } catch (_) {
        return false;
      }
    };

    if (!loader || typeof window.gsap === "undefined") {
      revealPageWithoutAnimation();
      return;
    }

    const gsap = window.gsap;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || hasSeenLoader()) {
      revealPageWithoutAnimation();
      return;
    }

    markLoaderSeen();

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
   * Returns the navigation buttons for a slider.
   * Looks in the same section first, then previous sibling blocks
   * (for full-bleed swipers placed outside their header section).
   *
   * @param {Element} slider
   * @param {string} previousSelector
   * @param {string} nextSelector
   * @returns {{previous: Element|null, next: Element|null}}
   */
  function getSectionNavigation(slider, previousSelector, nextSelector) {
    const scopes = [];

    const section = slider.closest(".section");
    if (section) scopes.push(section);

    let sibling = slider.previousElementSibling;
    while (sibling) {
      scopes.push(sibling);
      sibling = sibling.previousElementSibling;
    }

    if (slider.parentElement) scopes.push(slider.parentElement);

    for (const scope of scopes) {
      const previous = scope.querySelector?.(previousSelector) || null;
      const next = scope.querySelector?.(nextSelector) || null;

      if (previous || next) {
        return { previous, next };
      }
    }

    return { previous: null, next: null };
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

  function initServicesHover() {
    if (typeof window.gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gsap = window.gsap;
    const desktopQuery = window.matchMedia(
      "(min-width: 992px) and (hover: hover) and (pointer: fine)",
    );
    const ease = "power4.out";
    const duration = 0.5;
    const tweenVars = { duration, ease, overwrite: "auto" };

    document.querySelectorAll(".swiper-slide.is--services").forEach((slide) => {
      const cardHover = slide.querySelector(".service--card-hover");
      const heading = slide.querySelector(".heading-style-76");
      const content = slide.querySelector(".service--content");
      const cardBg = slide.querySelector(".service--card-bg");
      const image = slide.querySelector(".image--absolute100");
      const targets = [heading, content, cardBg, image, cardHover].filter(Boolean);

      if (!targets.length) return;

      const setDesktopResting = () => {
        if (heading) gsap.set(heading, { opacity: 0, y: "-1rem" });
        if (content) gsap.set(content, { height: 0, overflow: "hidden" });
        if (cardBg) gsap.set(cardBg, { opacity: 0 });
        if (image) gsap.set(image, { scale: 1 });
        if (cardHover) gsap.set(cardHover, { pointerEvents: "none" });
      };

      const clearDesktopState = () => {
        gsap.killTweensOf(targets);
        targets.forEach((element) => {
          gsap.set(element, { clearProps: "all" });
        });
      };

      const openHover = () => {
        if (!desktopQuery.matches) return;

        if (cardHover) gsap.set(cardHover, { pointerEvents: "auto" });
        if (content) gsap.set(content, { overflow: "hidden" });

        if (cardBg) gsap.to(cardBg, { opacity: 1, ...tweenVars });
        if (heading) gsap.to(heading, { opacity: 1, y: 0, ...tweenVars });
        if (content) {
          gsap.to(content, {
            height: "auto",
            ...tweenVars,
            onComplete: () => {
              if (desktopQuery.matches) {
                gsap.set(content, { overflow: "visible" });
              }
            },
          });
        }
        if (image) gsap.to(image, { scale: 1.1, ...tweenVars });
      };

      const closeHover = () => {
        if (!desktopQuery.matches) return;

        if (content) gsap.set(content, { overflow: "hidden" });

        if (cardBg) gsap.to(cardBg, { opacity: 0, ...tweenVars });
        if (heading) {
          gsap.to(heading, {
            opacity: 0,
            y: "-1rem",
            ...tweenVars,
            onComplete: () => {
              if (desktopQuery.matches && cardHover) {
                gsap.set(cardHover, { pointerEvents: "none" });
              }
            },
          });
        } else if (cardHover) {
          gsap.set(cardHover, { pointerEvents: "none" });
        }
        if (content) gsap.to(content, { height: 0, ...tweenVars });
        if (image) gsap.to(image, { scale: 1, ...tweenVars });
      };

      slide.addEventListener("pointerenter", openHover);
      slide.addEventListener("pointerleave", closeHover);
      slide.addEventListener("focusin", openHover);
      slide.addEventListener("focusout", (event) => {
        if (!slide.contains(event.relatedTarget)) closeHover();
      });

      const syncBreakpoint = () => {
        if (desktopQuery.matches) {
          setDesktopResting();
        } else {
          clearDesktopState();
        }
      };

      syncBreakpoint();
      desktopQuery.addEventListener("change", syncBreakpoint);
    });
  }

  function initServicesSlider() {
    const sliders = document.querySelectorAll(".swiper.is--services");

    sliders.forEach((slider) => {
      if (slider.swiper) return;

      const navigation = getSectionNavigation(
        slider,
        ".swiper--button-wrap .swiper--button.is--previous",
        ".swiper--button-wrap .swiper--button.is--next",
      );

      // Fallback: buttons live in the home-services header section
      if (!navigation.previous && !navigation.next) {
        const homeServices = document.querySelector(".section.is--home-services");
        navigation.previous =
          homeServices?.querySelector(".swiper--button.is--previous") || null;
        navigation.next =
          homeServices?.querySelector(".swiper--button.is--next") || null;
      }

      const getSpacing = () => {
        const width = window.innerWidth;

        if (width >= 992) return 0;
        if (width >= 768) return remToPx(1);

        return 0;
      };

      const swiper = new Swiper(slider, {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: getSpacing(),
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