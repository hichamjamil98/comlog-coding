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
    if (typeof window.gsap === "undefined") {
      console.warn("Comlog Karriere: GSAP is missing.");
      return;
    }

    const gsap = window.gsap;
    const ease = "power4.out";
    const duration = 0.5;
    const html = document.documentElement;
    const body = document.body;

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

    const closePopup = (popup) => {
      if (!popup || closing) return;
      if (!popup.classList.contains("is--open") && activePopup !== popup) return;

      closing = true;

      const content = popup.querySelector(".career--popup-content");
      const bg = popup.querySelector(".career--popup-bg");
      const targets = [content, bg].filter(Boolean);

      gsap.killTweensOf(targets);

      const finish = () => {
        gsap.set(popup, { display: "none" });
        popup.classList.remove("is--open");
        closing = false;

        if (activePopup === popup) {
          activePopup = null;
          unlock();
        }
      };

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
        gsap.set(activePopup, { display: "none" });
        activePopup.classList.remove("is--open");
        gsap.killTweensOf(
          activePopup.querySelectorAll(".career--popup-content, .career--popup-bg"),
        );
      }

      const content = popup.querySelector(".career--popup-content");
      const bg = popup.querySelector(".career--popup-bg");

      gsap.killTweensOf([content, bg].filter(Boolean));

      activePopup = popup;
      popup.classList.add("is--open");
      gsap.set(popup, { display: "flex" });
      lock();

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

    document.querySelectorAll(".career--item-slide").forEach((card) => {
      const popup = card.querySelector(".career--popup");
      const openTrigger = [...card.querySelectorAll(
        '[data-wf--slot-item-button--variant="karriere"] a',
      )].find((link) => !link.closest(".career--popup"));

      if (!popup || !openTrigger) return;

      gsap.set(popup, { display: "none" });

      const content = popup.querySelector(".career--popup-content");
      const bg = popup.querySelector(".career--popup-bg");
      if (content) gsap.set(content, { opacity: 0, y: "2rem" });
      if (bg) gsap.set(bg, { opacity: 0 });

      openTrigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPopup(popup);
      });
    });

    document.addEventListener("click", (event) => {
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
