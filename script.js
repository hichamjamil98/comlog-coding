/* ========================================================================== 
   B4CARS — INTERACTIONS & ANIMATIONS
   Requires GSAP + ScrollTrigger
========================================================================== */

(() => {
  "use strict";

  const DESKTOP_BREAKPOINT = 992;
  const EASE = "power4.out";

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") {
      console.warn("B4Cars: GSAP is missing.");
      return;
    }

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    initButtonCharacterHover();
    initLoadAnimations(EASE);
    initScrollAnimations(EASE);
    initImageParallax();
    initNavbarDropdowns(EASE);
    initMobileNavbar(EASE);
  });

  /* ========================================================================
     1. BUTTON CHARACTER HOVER

     Supported markup:
     - data-button-animate-chars
     - .btn-animate-chars__text
  ======================================================================== */

  function initButtonCharacterHover() {
    const elements = document.querySelectorAll(
      "[data-button-animate-chars], .btn-animate-chars__text",
    );
    const delayStep = 0.012;

    elements.forEach((element) => {
      if (element.dataset.charsReady === "true") return;

      const text = element.textContent || "";
      const accessibleLabel = text.replace(/\s+/g, " ").trim();

      if (!accessibleLabel) return;

      element.textContent = "";
      element.setAttribute("aria-label", accessibleLabel);

      [...text].forEach((character, index) => {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.textContent = character === " " ? "\u00A0" : character;
        span.style.transitionDelay = `${index * delayStep}s`;
        element.appendChild(span);
      });

      element.dataset.charsReady = "true";
    });
  }

  /* ========================================================================
     2. PAGE LOAD ANIMATIONS

     animation="load"
     animation="load-up"
     animation="load-left"
     animation="load-right"
     animation="load-stagger"
     animation="load-split"
  ======================================================================== */

  function initLoadAnimations(ease) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeline = gsap.timeline({
      defaults: { ease },
      delay: 0.08,
    });

    addLoadTween(
      timeline,
      '[animation="load"]',
      { opacity: 0, y: "1rem" },
      0,
    );

    addLoadTween(
      timeline,
      '[animation="load-up"]',
      { opacity: 0, y: "2rem" },
      0.04,
    );

    addLoadTween(
      timeline,
      '[animation="load-left"]',
      { opacity: 0, x: "2rem" },
      0.04,
    );

    addLoadTween(
      timeline,
      '[animation="load-right"]',
      { opacity: 0, x: "-2rem" },
      0.04,
    );

    document.querySelectorAll('[animation="load-stagger"]').forEach((parent) => {
      const children = [...parent.children];
      if (!children.length) return;

      timeline.fromTo(
        children,
        { opacity: 0, y: "1.5rem" },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          clearProps: "transform,opacity",
        },
        0.12,
      );
    });

    document.querySelectorAll('[animation="load-split"]').forEach((element) => {
      const line = prepareSplitLine(element, "load-split");
      if (!line) return;

      timeline.fromTo(
        line,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          clearProps: "transform,opacity",
        },
        0.14,
      );
    });
  }

  function addLoadTween(timeline, selector, fromVars, position) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      position,
    );
  }

  /* ========================================================================
     3. SCROLL ANIMATIONS

     animation="fade"
     animation="fade-up"
     animation="fade-left"
     animation="fade-right"
     animation="fade-stagger"
     animation="fade-split"
  ======================================================================== */

  function initScrollAnimations(ease) {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    initFade('[animation="fade"]', { opacity: 0, y: "1rem" }, ease);
    initFade('[animation="fade-up"]', { opacity: 0, y: "2rem" }, ease);
    initFade('[animation="fade-left"]', { opacity: 0, x: "2rem" }, ease);
    initFade('[animation="fade-right"]', { opacity: 0, x: "-2rem" }, ease);
    initFadeStagger(ease);
    initFadeSplit(ease);
  }

  function initFade(selector, fromVars, ease) {
    document.querySelectorAll(selector).forEach((element) => {
      gsap.fromTo(
        element,
        fromVars,
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.85,
          ease,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        },
      );
    });
  }

  function initFadeStagger(ease) {
    document.querySelectorAll('[animation="fade-stagger"]').forEach((parent) => {
      const children = [...parent.children];
      if (!children.length) return;

      gsap.fromTo(
        children,
        { opacity: 0, y: "1.5rem" },
        {
          opacity: 1,
          y: 0,
          duration: 0.78,
          stagger: 0.08,
          ease,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: parent,
            start: "top 86%",
            once: true,
          },
        },
      );
    });
  }

  function initFadeSplit(ease) {
    document.querySelectorAll('[animation="fade-split"]').forEach((element) => {
      const line = prepareSplitLine(element, "fade-split");
      if (!line) return;

      gsap.fromTo(
        line,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        },
      );
    });
  }

  function prepareSplitLine(element, prefix) {
    const readyAttribute = `${prefix.replace(/-/g, "")}Ready`;

    if (element.dataset[readyAttribute] === "true") {
      return element.querySelector(`.${prefix}__line`);
    }

    const content = element.innerHTML.trim();
    if (!content) return null;

    element.innerHTML = `
      <span class="${prefix}__line-mask">
        <span class="${prefix}__line">${content}</span>
      </span>
    `;

    element.dataset[readyAttribute] = "true";
    return element.querySelector(`.${prefix}__line`);
  }

  /* ========================================================================
     4. IMAGE PARALLAX

     Add image="parallax" directly to an image.
     The parent wrapper should have overflow: hidden.
  ======================================================================== */

  function initImageParallax() {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll('[image="parallax"]').forEach((image) => {
      if (image.dataset.parallaxReady === "true") return;
      image.dataset.parallaxReady = "true";

      gsap.fromTo(
        image,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: image.parentElement || image,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }

  /* ========================================================================
     5. NAVBAR DROPDOWNS

     Expected structure:
     .btn--drop
       .trigger
         .button.is--drop
         .drop--arrow
       .drop--menu
  ======================================================================== */

  function initNavbarDropdowns(ease) {
    const dropdowns = [...document.querySelectorAll(".btn--drop")];
    if (!dropdowns.length) return;

    const isDesktop = () => window.innerWidth >= DESKTOP_BREAKPOINT;

    const closeDropdown = (dropdown, immediate = false) => {
      const trigger = dropdown.querySelector(":scope > .trigger");
      const triggerButton = trigger?.querySelector("a, button, [role='button']");
      const menu = dropdown.querySelector(":scope > .drop--menu");
      if (!menu) return;

      dropdown.classList.remove("is--open");
      triggerButton?.setAttribute("aria-expanded", "false");

      gsap.killTweensOf(menu);
      gsap.killTweensOf(menu.children);

      if (immediate) {
        gsap.set(menu, {
          autoAlpha: 0,
          y: isDesktop() ? "0.75rem" : 0,
          height: isDesktop() ? "auto" : 0,
          display: isDesktop() ? "block" : "none",
          pointerEvents: "none",
        });
        return;
      }

      if (isDesktop()) {
        gsap.to(menu, {
          autoAlpha: 0,
          y: "0.75rem",
          duration: 0.28,
          ease: "power2.inOut",
          pointerEvents: "none",
        });
      } else {
        gsap.to(menu, {
          height: 0,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.inOut",
          pointerEvents: "none",
          onComplete: () => gsap.set(menu, { display: "none" }),
        });
      }
    };

    const closeOthers = (current) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== current) closeDropdown(dropdown);
      });
    };

    const openDropdown = (dropdown) => {
      const trigger = dropdown.querySelector(":scope > .trigger");
      const triggerButton = trigger?.querySelector("a, button, [role='button']");
      const menu = dropdown.querySelector(":scope > .drop--menu");
      if (!menu) return;

      closeOthers(dropdown);
      dropdown.classList.add("is--open");
      triggerButton?.setAttribute("aria-expanded", "true");

      gsap.killTweensOf(menu);
      gsap.killTweensOf(menu.children);

      if (isDesktop()) {
        gsap.set(menu, {
          display: "block",
          height: "auto",
          pointerEvents: "auto",
        });

        gsap.fromTo(
          menu,
          { autoAlpha: 0, y: "0.75rem" },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            ease,
            pointerEvents: "auto",
          },
        );

        gsap.fromTo(
          menu.children,
          { opacity: 0, y: "0.5rem" },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.045,
            ease,
            clearProps: "transform,opacity",
          },
        );
      } else {
        gsap.set(menu, {
          display: "flex",
          height: "auto",
          autoAlpha: 1,
          pointerEvents: "auto",
        });

        const fullHeight = menu.offsetHeight;
        gsap.fromTo(
          menu,
          { height: 0, autoAlpha: 0 },
          {
            height: fullHeight,
            autoAlpha: 1,
            duration: 0.45,
            ease,
            pointerEvents: "auto",
            onComplete: () => gsap.set(menu, { height: "auto" }),
          },
        );
      }
    };

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector(":scope > .trigger");
      const triggerButton = trigger?.querySelector("a, button, [role='button']");
      const menu = dropdown.querySelector(":scope > .drop--menu");
      if (!trigger || !triggerButton || !menu) return;

      triggerButton.setAttribute("aria-haspopup", "true");
      triggerButton.setAttribute("aria-expanded", "false");

      closeDropdown(dropdown, true);

      triggerButton.addEventListener("click", (event) => {
        event.preventDefault();
        dropdown.classList.contains("is--open")
          ? closeDropdown(dropdown)
          : openDropdown(dropdown);
      });

      dropdown.addEventListener("mouseenter", () => {
        if (isDesktop()) openDropdown(dropdown);
      });

      dropdown.addEventListener("mouseleave", () => {
        if (isDesktop()) closeDropdown(dropdown);
      });

      dropdown.addEventListener("focusin", () => {
        if (isDesktop()) openDropdown(dropdown);
      });

      dropdown.addEventListener("focusout", (event) => {
        if (!isDesktop()) return;
        if (!dropdown.contains(event.relatedTarget)) closeDropdown(dropdown);
      });

      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closeDropdown(dropdown));
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!event.target.closest(".btn--drop")) {
        dropdowns.forEach((dropdown) => closeDropdown(dropdown));
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      dropdowns.forEach((dropdown) => closeDropdown(dropdown));
    });

    window.addEventListener("resize", () => {
      dropdowns.forEach((dropdown) => closeDropdown(dropdown, true));
    });
  }

  /* ========================================================================
     6. TABLET / MOBILE NAVBAR

     Existing classes:
     .navbar
     .nav--menu
     .menu--trigger
     .menu--to-open
     .menu--to-close
  ======================================================================== */

  function initMobileNavbar(ease) {
    const navbar = document.querySelector(".navbar");
    const menu = document.querySelector(".nav--menu");
    const trigger = document.querySelector(".menu--trigger");
    const iconOpen = trigger?.querySelector(".menu--to-open");
    const iconClose = trigger?.querySelector(".menu--to-close");
    const breakpoint = window.matchMedia("(max-width: 991px)");

    if (!navbar || !menu || !trigger) return;

    const menuItems = [...menu.children];
    let isOpen = false;
    let timeline = null;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Ouvrir le menu");

    const lockScroll = () => {
      document.documentElement.classList.add("is--locked");
      document.body.classList.add("is--locked");
    };

    const unlockScroll = () => {
      document.documentElement.classList.remove("is--locked");
      document.body.classList.remove("is--locked");
    };

    const closeAllDropdowns = () => {
      menu.querySelectorAll(".btn--drop.is--open").forEach((dropdown) => {
        dropdown.classList.remove("is--open");
        dropdown
          .querySelector(":scope > .trigger a, :scope > .trigger button")
          ?.setAttribute("aria-expanded", "false");

        const dropdownMenu = dropdown.querySelector(":scope > .drop--menu");
        if (dropdownMenu) {
          gsap.set(dropdownMenu, {
            display: "none",
            height: 0,
            autoAlpha: 0,
            pointerEvents: "none",
          });
        }
      });
    };

    const setClosedState = () => {
      gsap.set(menu, {
        display: "none",
        opacity: 0,
        pointerEvents: "none",
      });

      gsap.set(menuItems, {
        opacity: 0,
        y: "1.5rem",
        filter: "blur(6px)",
      });

      if (iconOpen) gsap.set(iconOpen, { opacity: 1, scale: 1, rotate: 0 });
      if (iconClose) gsap.set(iconClose, { opacity: 0, scale: 0.75, rotate: -90 });
    };

    const openMenu = () => {
      if (isOpen || !breakpoint.matches) return;
      isOpen = true;

      timeline?.kill();
      navbar.classList.add("is--menu-open");
      menu.classList.add("is--open");
      trigger.classList.add("is--open");
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "Fermer le menu");
      lockScroll();

      timeline = gsap.timeline();
      timeline
        .set(menu, { display: "flex", pointerEvents: "auto" })
        .to(menu, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
        .to(
          menuItems,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            stagger: 0.055,
            ease,
          },
          0.16,
        );

      if (iconOpen) {
        timeline.to(
          iconOpen,
          { opacity: 0, scale: 0.75, rotate: 90, duration: 0.3, ease },
          0,
        );
      }

      if (iconClose) {
        timeline.to(
          iconClose,
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease },
          0.06,
        );
      }
    };

    const closeMenu = ({ immediate = false } = {}) => {
      if (!isOpen && !immediate) return;
      isOpen = false;

      timeline?.kill();
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Ouvrir le menu");
      unlockScroll();
      closeAllDropdowns();

      if (immediate) {
        navbar.classList.remove("is--menu-open");
        menu.classList.remove("is--open");
        trigger.classList.remove("is--open");
        setClosedState();
        return;
      }

      timeline = gsap.timeline({
        onComplete: () => {
          navbar.classList.remove("is--menu-open");
          menu.classList.remove("is--open");
          trigger.classList.remove("is--open");
        },
      });

      timeline
        .to(
          menuItems,
          {
            opacity: 0,
            y: "1rem",
            filter: "blur(6px)",
            duration: 0.28,
            stagger: { each: 0.025, from: "end" },
            ease: "power2.inOut",
          },
          0,
        )
        .to(menu, { opacity: 0, duration: 0.42, ease: "power2.inOut" }, 0.1)
        .set(menu, { display: "none", pointerEvents: "none" });

      if (iconClose) {
        timeline.to(
          iconClose,
          { opacity: 0, scale: 0.75, rotate: -90, duration: 0.3, ease },
          0,
        );
      }

      if (iconOpen) {
        timeline.to(
          iconOpen,
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease },
          0.05,
        );
      }
    };

    const toggleMenu = () => {
      isOpen ? closeMenu() : openMenu();
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMenu();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMenu();
      }
    });

    menu.querySelectorAll(":scope > a, .drop--menu a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) closeMenu();
    });

    breakpoint.addEventListener("change", (event) => {
      if (!event.matches) {
        closeMenu({ immediate: true });
        gsap.set(menu, { clearProps: "all" });
        gsap.set(menuItems, { clearProps: "all" });
        gsap.set([iconOpen, iconClose].filter(Boolean), { clearProps: "all" });
      } else {
        closeMenu({ immediate: true });
      }
    });

    if (breakpoint.matches) setClosedState();
  }
})();