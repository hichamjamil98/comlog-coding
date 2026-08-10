/* ==========================================================================
   COMLOG — KARRIERE
   Requires GSAP + Swiper
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initKarrierePopups();

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

  /* =========================================================================
     CAREER POPUPS
  ========================================================================= */

  function initKarrierePopups() {
    const gsap = window.gsap || null;
    const ease = "power4.out";
    const duration = 0.5;
    const html = document.documentElement;
    const body = document.body;

    if (!gsap) {
      console.warn("Comlog Karriere: GSAP is missing. Popups will open without animation.");
    }

    let activePopup = null;
    let closing = false;

    const lock = () => {
      html.classList.add("is--locked");
      body.classList.add("is--locked");
    };

    const unlock = () => {
      html.classList.remove("is--locked");
      body.classList.remove("is--locked");
    };

    const getPopupParts = (popup) => ({
      content: popup.querySelector(".career--popup-content"),
      bg: popup.querySelector(".career--popup-bg"),
    });

    const resetPopup = (popup) => {
      const { content, bg } = getPopupParts(popup);

      popup.classList.remove("is--open");
      popup.style.display = "none";

      if (gsap) {
        if (content) gsap.set(content, { opacity: 0, y: "2rem" });
        if (bg) gsap.set(bg, { opacity: 0 });
      } else {
        if (content) {
          content.style.opacity = "0";
          content.style.transform = "translateY(2rem)";
        }
        if (bg) bg.style.opacity = "0";
      }
    };

    const closePopup = (popup) => {
      if (!popup || closing) return;
      if (!popup.classList.contains("is--open") && activePopup !== popup) return;

      closing = true;
      const { content, bg } = getPopupParts(popup);

      const finish = () => {
        resetPopup(popup);
        closing = false;

        if (activePopup === popup) {
          activePopup = null;
          unlock();
        }
      };

      if (!gsap) {
        finish();
        return;
      }

      const targets = [content, bg].filter(Boolean);
      gsap.killTweensOf(targets);

      if (!targets.length) {
        finish();
        return;
      }

      let remaining = targets.length;
      const onComplete = () => {
        remaining -= 1;
        if (remaining <= 0) finish();
      };

      if (content) {
        gsap.to(content, {
          opacity: 0,
          y: "2rem",
          duration,
          ease,
          onComplete,
        });
      }

      if (bg) {
        gsap.to(bg, {
          opacity: 0,
          duration,
          ease,
          onComplete,
        });
      }
    };

    const openPopup = (popup) => {
      if (!popup || closing) return;

      if (activePopup && activePopup !== popup) {
        resetPopup(activePopup);
        if (gsap) {
          gsap.killTweensOf(
            activePopup.querySelectorAll(".career--popup-content, .career--popup-bg"),
          );
        }
      }

      const { content, bg } = getPopupParts(popup);

      activePopup = popup;
      popup.classList.add("is--open");
      popup.style.display = "flex";
      lock();

      if (!gsap) {
        if (content) {
          content.style.opacity = "1";
          content.style.transform = "translateY(0)";
        }
        if (bg) bg.style.opacity = "1";
        return;
      }

      gsap.killTweensOf([content, bg].filter(Boolean));

      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0, y: "2rem" },
          { opacity: 1, y: 0, duration, ease },
        );
      }

      if (bg) {
        gsap.fromTo(
          bg,
          { opacity: 0 },
          { opacity: 1, duration, ease },
        );
      }
    };

    document.querySelectorAll(".career--popup").forEach((popup) => {
      resetPopup(popup);
    });

    document.addEventListener("click", (event) => {
      const openTrigger = event.target.closest(
        'a[aria-label="zur stellenausschreibung"]',
      );

      if (openTrigger && !openTrigger.closest(".career--popup")) {
        event.preventDefault();
        event.stopPropagation();

        const card =
          openTrigger.closest(".career--item-slide") ||
          openTrigger.closest(".swiper-slide");
        const popup = card?.querySelector(".career--popup");

        if (popup) openPopup(popup);
        return;
      }

      const closeButton = event.target.closest(
        ".karriere--popup-close, .career--popup-close",
      );

      if (closeButton) {
        const popup = closeButton.closest(".career--popup");
        if (!popup) return;

        event.preventDefault();
        event.stopPropagation();
        closePopup(popup);
        return;
      }

      if (event.target.closest(".career--popup-bg")) {
        const popup = event.target.closest(".career--popup");
        if (!popup) return;

        event.preventDefault();
        event.stopPropagation();
        closePopup(popup);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePopup) {
        closePopup(activePopup);
      }
    });
  }

  /* =========================================================================
     KARRIERE SLIDER
  ========================================================================= */

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
