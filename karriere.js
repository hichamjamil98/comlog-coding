/* ==========================================================================
   COMLOG — KARRIERE
   Requires GSAP + Swiper
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initKarriereVertrag();
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

    return remToPx(1);
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
     CMS → VERTRAG TEXT
     Fills [data--karriere-vertrag] from the sibling hidden CMS list.
     Example: "Vollzeit" + "Festanstellung" → "Vollzeit · Festanstellung"
  ========================================================================= */

  function initKarriereVertrag() {
    document.querySelectorAll("[data--karriere-vertrag]").forEach((target) => {
      let list = null;

      if (target.parentElement) {
        list = target.parentElement.querySelector(
          ":scope > .hide.w-dyn-list, :scope > .w-dyn-list",
        );
      }

      if (
        !list &&
        target.nextElementSibling?.matches?.(".hide.w-dyn-list, .w-dyn-list")
      ) {
        list = target.nextElementSibling;
      }

      if (!list) return;

      const values = [...list.querySelectorAll(".w-dyn-item")]
        .map((item) => item.textContent.replace(/\s+/g, " ").trim())
        .filter(Boolean);

      if (!values.length) return;

      target.textContent = values.join(" · ");
    });
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
      console.warn(
        "Comlog Karriere: GSAP is missing. Popups will open without animation.",
      );
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

    const findPopupForTrigger = (trigger) => {
      const id = trigger.dataset.careerPopup;
      if (id) {
        return document.querySelector(`.career--popup[data-career-popup="${id}"]`);
      }

      const slide = trigger.closest(".swiper-slide");
      return (
        slide?.querySelector(".career--popup") ||
        trigger.closest(".career--item-slide")?.parentElement?.querySelector(
          ".career--popup",
        ) ||
        null
      );
    };

    const syncActiveTabs = (activeId) => {
      document.querySelectorAll(".career--popup .career--item").forEach((item) => {
        item.classList.toggle("is--active", item.dataset.careerPopup === activeId);
      });
    };

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

    const showPopupInstant = (popup) => {
      const { content, bg } = getPopupParts(popup);

      activePopup = popup;
      popup.classList.add("is--open");
      popup.style.display = "flex";
      lock();
      syncActiveTabs(popup.dataset.careerPopup);

      if (gsap) {
        if (content) gsap.set(content, { opacity: 1, y: 0 });
        if (bg) gsap.set(bg, { opacity: 1 });
      } else {
        if (content) {
          content.style.opacity = "1";
          content.style.transform = "translateY(0)";
        }
        if (bg) bg.style.opacity = "1";
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

    const openPopup = (popup, { animate = true } = {}) => {
      if (!popup || closing) return;
      if (activePopup === popup) {
        syncActiveTabs(popup.dataset.careerPopup);
        return;
      }

      if (activePopup && activePopup !== popup) {
        if (gsap) {
          gsap.killTweensOf(
            activePopup.querySelectorAll(
              ".career--popup-content, .career--popup-bg",
            ),
          );
        }
        resetPopup(activePopup);
      }

      if (!animate) {
        showPopupInstant(popup);
        return;
      }

      const { content, bg } = getPopupParts(popup);

      activePopup = popup;
      popup.classList.add("is--open");
      popup.style.display = "flex";
      lock();
      syncActiveTabs(popup.dataset.careerPopup);

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
        gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration, ease });
      }
    };

    const jobs = [];

    // Move popups to <body> so position:fixed isn't trapped by Swiper transforms.
    document
      .querySelectorAll(".swiper.is--karriere-slider .swiper-slide")
      .forEach((slide, index) => {
        const popup = slide.querySelector(".career--popup");
        const trigger = slide.querySelector(
          'a[aria-label="zur stellenausschreibung"]',
        );
        const titleEl = slide.querySelector("[karriere-title]");
        const title =
          titleEl?.textContent.replace(/\s+/g, " ").trim() ||
          `Stelle ${index + 1}`;

        if (!popup) return;

        const id = `career-popup-${index + 1}`;
        popup.dataset.careerPopup = id;
        if (trigger) trigger.dataset.careerPopup = id;

        jobs.push({ id, title });

        body.appendChild(popup);
        resetPopup(popup);
      });

    // Build in-popup job tabs from [karriere-title] values.
    document.querySelectorAll(".career--popup").forEach((popup) => {
      const nav = popup.querySelector(".div-block-7");
      if (!nav || !jobs.length) return;

      nav.innerHTML = "";

      jobs.forEach((job) => {
        const item = document.createElement("div");
        item.className = "career--item";
        item.textContent = job.title;
        item.dataset.careerPopup = job.id;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");

        if (job.id === popup.dataset.careerPopup) {
          item.classList.add("is--active");
        }

        nav.appendChild(item);
      });
    });

    document.addEventListener("click", (event) => {
      const tab = event.target.closest(".career--popup .career--item");

      if (tab) {
        event.preventDefault();
        event.stopPropagation();

        const popup = document.querySelector(
          `.career--popup[data-career-popup="${tab.dataset.careerPopup}"]`,
        );

        if (popup) openPopup(popup, { animate: false });
        return;
      }

      const openTrigger = event.target.closest(
        'a[aria-label="zur stellenausschreibung"]',
      );

      if (openTrigger && !openTrigger.closest(".career--popup")) {
        event.preventDefault();
        event.stopPropagation();

        const popup = findPopupForTrigger(openTrigger);
        if (popup) openPopup(popup, { animate: true });
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
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") return;

      const tab = event.target.closest?.(".career--popup .career--item");
      if (!tab) return;

      event.preventDefault();

      const popup = document.querySelector(
        `.career--popup[data-career-popup="${tab.dataset.careerPopup}"]`,
      );

      if (popup) openPopup(popup, { animate: false });
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
