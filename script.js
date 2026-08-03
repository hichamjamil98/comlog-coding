/* ========================================================================== 
   COMLOG — INTERACTIONS & ANIMATIONS
   Requires GSAP + ScrollTrigger
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") {
      console.warn("Comlog: GSAP is missing.");
      return;
    }

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const EASE = "power4.out";
    const MOBILE_BREAKPOINT = window.matchMedia("(max-width: 991px)");

    initButtonHover();
    initLoadAnimations(EASE);
    initScrollAnimations(EASE);
    initImageParallax();
    initDropdowns(MOBILE_BREAKPOINT);
    initMobileNavbar(MOBILE_BREAKPOINT, EASE);
  });

  /* ========================================================================
     1. BUTTON HOVER
     Uses .btn-animate-chars__text and .btn--arrow
  ======================================================================== */

  function initButtonHover() {
    const textElements = document.querySelectorAll(".btn-animate-chars__text");
    const delayStep = 0.012;

    textElements.forEach((element) => {
      if (element.dataset.charsReady === "true") return;

      const text = element.textContent || "";
      element.textContent = "";
      element.setAttribute("aria-label", text.trim());

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set('[animation^="load"]', { clearProps: "all" });
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease },
      delay: 0.08,
    });

    addLoadTween(timeline, '[animation="load"]', {
      opacity: 0,
      y: "1rem",
    }, 0);

    addLoadTween(timeline, '[animation="load-up"]', {
      opacity: 0,
      y: "2rem",
    }, 0.04);

    addLoadTween(timeline, '[animation="load-left"]', {
      opacity: 0,
      x: "2rem",
    }, 0.04);

    addLoadTween(timeline, '[animation="load-right"]', {
      opacity: 0,
      x: "-2rem",
    }, 0.04);

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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set('[animation^="fade"]', { clearProps: "all" });
      return;
    }

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
     Add image="parallax" directly to the image.
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

     .btn--drop
     .trigger
     .drop--menu
     .drop--arrow
  ======================================================================== */

  function initDropdowns(breakpoint) {
    const dropdowns = [...document.querySelectorAll(".btn--drop")];
    if (!dropdowns.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getParts(dropdown) {
      return {
        trigger: dropdown.querySelector(".trigger"),
        triggerLink: dropdown.querySelector(".trigger .button.is--drop"),
        menu: dropdown.querySelector(".drop--menu"),
        arrow: dropdown.querySelector(".drop--arrow"),
        links: [...dropdown.querySelectorAll(".drop--menu > a")],
      };
    }

    function closeDropdown(dropdown, immediate = false) {
      const { trigger, triggerLink, menu, arrow } = getParts(dropdown);
      if (!menu) return;

      dropdown.classList.remove("is--open");
      trigger?.setAttribute("aria-expanded", "false");
      triggerLink?.setAttribute("aria-expanded", "false");

      gsap.killTweensOf([menu, arrow]);

      if (immediate || reducedMotion.matches) {
        gsap.set(arrow, { rotate: 0 });
        gsap.set(menu, {
          display: "none",
          opacity: 0,
          height: breakpoint.matches ? 0 : "auto",
          y: breakpoint.matches ? 0 : "0.5rem",
          pointerEvents: "none",
        });
        return;
      }

      gsap.to(arrow, { rotate: 0, duration: 0.25, ease: "power2.out" });

      if (breakpoint.matches) {
        gsap.to(menu, {
          height: 0,
          opacity: 0,
          duration: 0.32,
          ease: "power2.inOut",
          onComplete: () => gsap.set(menu, { display: "none", pointerEvents: "none" }),
        });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: "0.5rem",
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => gsap.set(menu, { display: "none", pointerEvents: "none" }),
        });
      }
    }

    function openDropdown(dropdown) {
      const { trigger, triggerLink, menu, arrow, links } = getParts(dropdown);
      if (!menu) return;

      dropdowns.forEach((other) => {
        if (other !== dropdown) closeDropdown(other);
      });

      dropdown.classList.add("is--open");
      trigger?.setAttribute("aria-expanded", "true");
      triggerLink?.setAttribute("aria-expanded", "true");

      gsap.killTweensOf([menu, arrow, ...links]);
      gsap.set(menu, { display: "flex", pointerEvents: "auto" });
      gsap.to(arrow, { rotate: 180, duration: 0.3, ease: "power2.out" });

      if (reducedMotion.matches) {
        gsap.set(menu, { opacity: 1, height: "auto", y: 0 });
        return;
      }

      if (breakpoint.matches) {
        gsap.fromTo(
          menu,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.38, ease: "power2.out" },
        );

        gsap.fromTo(
          links,
          { opacity: 0, y: "0.5rem" },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.045, ease: "power3.out" },
        );
      } else {
        gsap.fromTo(
          menu,
          { opacity: 0, y: "0.5rem" },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
        );

        gsap.fromTo(
          links,
          { opacity: 0, y: "0.35rem" },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power3.out" },
        );
      }
    }

    function toggleDropdown(dropdown) {
      dropdown.classList.contains("is--open")
        ? closeDropdown(dropdown)
        : openDropdown(dropdown);
    }

    dropdowns.forEach((dropdown, index) => {
      const { trigger, triggerLink, menu } = getParts(dropdown);
      if (!trigger || !triggerLink || !menu) return;

      const menuId = menu.id || `comlog-dropdown-${index + 1}`;
      menu.id = menuId;

      trigger.setAttribute("aria-expanded", "false");
      triggerLink.setAttribute("aria-expanded", "false");
      triggerLink.setAttribute("aria-controls", menuId);
      triggerLink.setAttribute("aria-haspopup", "true");

      closeDropdown(dropdown, true);

      triggerLink.addEventListener("click", (event) => {
        // Dropdown triggers only control their submenu.
        event.preventDefault();
        event.stopPropagation();
        toggleDropdown(dropdown);
      });

      triggerLink.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openDropdown(dropdown);
          menu.querySelector("a")?.focus();
        }
      });

      dropdown.addEventListener("mouseenter", () => {
        if (!breakpoint.matches) openDropdown(dropdown);
      });

      dropdown.addEventListener("mouseleave", () => {
        if (!breakpoint.matches) closeDropdown(dropdown);
      });

      dropdown.addEventListener("focusin", () => {
        if (!breakpoint.matches) openDropdown(dropdown);
      });

      dropdown.addEventListener("focusout", (event) => {
        if (!breakpoint.matches && !dropdown.contains(event.relatedTarget)) {
          closeDropdown(dropdown);
        }
      });
    });

    document.addEventListener("click", (event) => {
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) closeDropdown(dropdown);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      dropdowns.forEach((dropdown) => closeDropdown(dropdown));
    });

    breakpoint.addEventListener("change", () => {
      dropdowns.forEach((dropdown) => closeDropdown(dropdown, true));
    });
  }

  /* ========================================================================
     6. TABLET / MOBILE NAVBAR

     .navbar
     .nav--menu
     .menu--trigger
     .menu--to-open
     .menu--to-close
  ======================================================================== */

  function initMobileNavbar(breakpoint, ease) {
    const navbar = document.querySelector(".navbar");
    const menu = document.querySelector(".nav--menu");
    const trigger = document.querySelector(".menu--trigger");
    const iconOpen = trigger?.querySelector(".menu--to-open");
    const iconClose = trigger?.querySelector(".menu--to-close");

    if (!navbar || !menu || !trigger) return;

    const menuItems = [...menu.children];
    let isOpen = false;
    let timeline = null;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Ouvrir le menu");

    function lockScroll() {
      document.documentElement.classList.add("is--locked");
      document.body.classList.add("is--locked");
    }

    function unlockScroll() {
      document.documentElement.classList.remove("is--locked");
      document.body.classList.remove("is--locked");
    }

    function setClosedState() {
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
    }

    function openMenu() {
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
        timeline.to(iconOpen, {
          opacity: 0,
          scale: 0.75,
          rotate: 90,
          duration: 0.3,
          ease,
        }, 0);
      }

      if (iconClose) {
        timeline.to(iconClose, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.4,
          ease,
        }, 0.06);
      }
    }

    function closeMenu({ immediate = false } = {}) {
      if (!isOpen && !immediate) return;
      isOpen = false;

      timeline?.kill();
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Ouvrir le menu");
      unlockScroll();

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
        timeline.to(iconClose, {
          opacity: 0,
          scale: 0.75,
          rotate: -90,
          duration: 0.3,
          ease,
        }, 0);
      }

      if (iconOpen) {
        timeline.to(iconOpen, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.4,
          ease,
        }, 0.05);
      }
    }

    function toggleMenu() {
      isOpen ? closeMenu() : openMenu();
    }

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