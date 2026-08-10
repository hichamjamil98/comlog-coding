/* ==========================================================================
   COMLOG — INTERACTIONS
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

    const mobileQuery = window.matchMedia("(max-width: 991px)");
    const ease = "power4.out";

    resetNavigationState(mobileQuery);

    const loadTimeline = gsap.timeline({
      defaults: { ease },
      delay: 0.08,
    });

    initLoad(loadTimeline);
    initLoadUp(loadTimeline);
    initLoadLeft(loadTimeline);
    initLoadRight(loadTimeline);
    initLoadStagger(loadTimeline);
    initLoadSplit(loadTimeline);

    initFade(ease);
    initFadeUp(ease);
    initFadeLeft(ease);
    initFadeRight(ease);
    initFadeStagger(ease);
    initFadeSplit(ease);

    initRod();
    initParallax();
    initDropdowns(mobileQuery);
    initMobileMenu(mobileQuery);
  });

  /* =========================================================================
     HELPERS
  ========================================================================= */

  function animElements(name) {
    return gsap.utils.toArray(`[${name}], [animation="${name}"]`);
  }

  function prepareSplitLine(element, prefix) {
    const readyKey = `${prefix.replace(/-/g, "")}Ready`;

    if (element.dataset[readyKey] === "true") {
      return element.querySelector(`.${prefix}__line`);
    }

    const content = element.innerHTML.trim();
    if (!content) return null;

    element.innerHTML = `
      <span class="${prefix}__line-mask">
        <span class="${prefix}__line">${content}</span>
      </span>
    `;

    element.dataset[readyKey] = "true";
    return element.querySelector(`.${prefix}__line`);
  }

  /* =========================================================================
     NAVIGATION RESET
  ========================================================================= */

  function resetNavigationState(mobileQuery) {
    const navbar = document.querySelector(".navbar");
    const menu = document.querySelector(".nav--menu");

    document.documentElement.classList.remove("is--locked");
    document.body.classList.remove("is--locked");

    if (!navbar || !menu) return;

    navbar.classList.remove("is--scrolled", "is--menu-open");
    navbar.style.removeProperty("background-color");

    if (!mobileQuery.matches) {
      menu.classList.remove("is--open");
      gsap.set(menu, { clearProps: "all" });

      menu.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.classList.remove("is--open");
      });

      menu.querySelectorAll(".dropdown--list").forEach((dropList) => {
        gsap.set(dropList, { clearProps: "all" });
        dropList.setAttribute("aria-hidden", "true");
      });
    }
  }

  /* =========================================================================
     LOAD ANIMATIONS
     Supports: load  OR  animation="load"
  ========================================================================= */

  function initLoad(timeline) {
    const elements = animElements("load");
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      { opacity: 0, y: "1rem" },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      0,
    );
  }

  function initLoadUp(timeline) {
    const elements = animElements("load-up");
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      { opacity: 0, y: "2rem" },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      0.04,
    );
  }

  function initLoadLeft(timeline) {
    const elements = animElements("load-left");
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      { opacity: 0, x: "2rem" },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      0.04,
    );
  }

  function initLoadRight(timeline) {
    const elements = animElements("load-right");
    if (!elements.length) return;

    timeline.fromTo(
      elements,
      { opacity: 0, x: "-2rem" },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      0.04,
    );
  }

  function initLoadStagger(timeline) {
    animElements("load-stagger").forEach((parent) => {
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
  }

  function initLoadSplit(timeline) {
    animElements("load-split").forEach((element) => {
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

  /* =========================================================================
     SCROLL ANIMATIONS
     Supports: fade  OR  animation="fade"
  ========================================================================= */

  function initFade(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: "1rem" },
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

  function initFadeUp(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade-up").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: "2rem" },
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

  function initFadeLeft(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade-left").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, x: "2rem" },
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

  function initFadeRight(ease) {
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade-right").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, x: "-2rem" },
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
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade-stagger").forEach((parent) => {
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
    if (typeof ScrollTrigger === "undefined") return;

    animElements("fade-split").forEach((element) => {
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

  /* =========================================================================
     ROD / LINE ANIMATION
     Supports: rod  OR  animation="rod"
  ========================================================================= */

  function initRod() {
    const elements = animElements("rod");
    if (!elements.length) return;

    if (
      typeof ScrollTrigger === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.set(elements, { scaleX: 1 });
      return;
    }

    elements.forEach((element) => {
      gsap.fromTo(
        element,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    });
  }

  /* =========================================================================
     PARALLAX
  ========================================================================= */

  function initParallax() {
    if (typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll('[image="parallax"]').forEach((image) => {
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

  /* =========================================================================
     DROPDOWNS
  ========================================================================= */

  function getDropdownParts(dropdown) {
    return {
      trigger: dropdown.querySelector(":scope > .dropdown--trigger"),
      list: dropdown.querySelector(":scope > .dropdown--list"),
      arrow: dropdown.querySelector(":scope > .dropdown--trigger .drop--arrow"),
    };
  }

  function initDropdowns(mobileQuery) {
    const dropdowns = [...document.querySelectorAll(".dropdown")];
    const desktopTimelines = new WeakMap();

    const closeDropdown = (dropdown, immediate = false) => {
      const { trigger, list, arrow } = getDropdownParts(dropdown);
      if (!list) return;

      dropdown.classList.remove("is--open");
      trigger?.setAttribute("aria-expanded", "false");
      list.setAttribute("aria-hidden", "true");

      const desktopTimeline = desktopTimelines.get(dropdown);
      if (desktopTimeline) {
        desktopTimeline.pause(0);
        gsap.set(list, { display: "none", clearProps: "opacity,transform" });
        if (arrow) gsap.set(arrow, { clearProps: "transform" });
      }

      gsap.killTweensOf([list, arrow].filter(Boolean));

      if (!mobileQuery.matches || immediate) {
        gsap.set(list, { clearProps: "all" });
        if (arrow) gsap.set(arrow, { clearProps: "transform" });
        return;
      }

      if (arrow) {
        gsap.to(arrow, {
          rotate: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      }

      gsap.to(list, {
        height: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(list, {
            display: "none",
            clearProps: "height,overflow",
          });
        },
      });
    };

    const openDropdown = (dropdown) => {
      const { trigger, list, arrow } = getDropdownParts(dropdown);
      if (!list) return;

      dropdowns.forEach((item) => {
        if (item !== dropdown) closeDropdown(item, true);
      });

      dropdown.classList.add("is--open");
      trigger?.setAttribute("aria-expanded", "true");
      list.setAttribute("aria-hidden", "false");

      if (!mobileQuery.matches) return;

      gsap.killTweensOf([list, arrow].filter(Boolean));
      gsap.set(list, {
        display: "flex",
        height: 0,
        overflow: "hidden",
      });

      if (arrow) {
        gsap.to(arrow, {
          rotate: 180,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      gsap.to(list, {
        height: "auto",
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(list, { clearProps: "height,overflow" });
        },
      });
    };

    const toggleDropdown = (dropdown) => {
      dropdown.classList.contains("is--open")
        ? closeDropdown(dropdown)
        : openDropdown(dropdown);
    };

    const createDesktopTimeline = (dropdown) => {
      const { trigger, list, arrow } = getDropdownParts(dropdown);
      if (!list) return null;

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
        onReverseComplete: () => {
          gsap.set(list, { display: "none" });
          trigger?.setAttribute("aria-expanded", "false");
          list.setAttribute("aria-hidden", "true");
        },
      });

      timeline.set(list, { display: "flex" });

      timeline.fromTo(
        list,
        { opacity: 0, x: "1.5rem" },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
        },
        0,
      );

      if (arrow) {
        timeline.fromTo(
          arrow,
          { rotate: 0 },
          {
            rotate: 180,
            duration: 0.5,
          },
          0,
        );
      }

      desktopTimelines.set(dropdown, timeline);
      return timeline;
    };

    dropdowns.forEach((dropdown, index) => {
      const { trigger, list } = getDropdownParts(dropdown);
      if (!trigger || !list) return;

      if (!list.id) list.id = `comlog-dropdown-${index + 1}`;

      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", list.id);
      list.setAttribute("aria-hidden", "true");

      const desktopTimeline = createDesktopTimeline(dropdown);

      dropdown.addEventListener("pointerenter", () => {
        if (mobileQuery.matches || !desktopTimeline) return;

        trigger.setAttribute("aria-expanded", "true");
        list.setAttribute("aria-hidden", "false");
        desktopTimeline.play();
      });

      dropdown.addEventListener("pointerleave", () => {
        if (mobileQuery.matches || !desktopTimeline) return;
        desktopTimeline.reverse();
      });

      trigger.addEventListener("click", (event) => {
        if (!mobileQuery.matches) return;

        event.preventDefault();
        toggleDropdown(dropdown);
      });

      trigger.addEventListener("keydown", (event) => {
        if (!mobileQuery.matches) return;
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        toggleDropdown(dropdown);
      });
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches) return;

      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
          closeDropdown(dropdown);
        }
      });
    });

    mobileQuery.addEventListener("change", () => {
      dropdowns.forEach((dropdown) => closeDropdown(dropdown, true));
    });
  }

  /* =========================================================================
     TABLET / MOBILE MENU
  ========================================================================= */

  function initMobileMenu(mobileQuery) {
    const navbar = document.querySelector(".navbar");
    const menu = document.querySelector(".nav--menu");
    const trigger = document.querySelector(".menu--trigger");
    const openIcon = trigger?.querySelector(".menu--to-open");
    const closeIcon = trigger?.querySelector(".menu--to-close");

    if (!navbar || !menu || !trigger) return;

    let open = false;
    let timeline = null;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");

    const lock = () => {
      document.documentElement.classList.add("is--locked");
      document.body.classList.add("is--locked");
    };

    const unlock = () => {
      document.documentElement.classList.remove("is--locked");
      document.body.classList.remove("is--locked");
    };

    const closeMenu = (immediate = false) => {
      open = false;
      timeline?.kill();

      trigger.classList.remove("is--open");
      trigger.setAttribute("aria-expanded", "false");
      navbar.classList.remove("is--menu-open");
      unlock();

      document.querySelectorAll(".dropdown.is--open").forEach((dropdown) => {
        dropdown.classList.remove("is--open");
      });

      if (immediate || !mobileQuery.matches) {
        menu.classList.remove("is--open");
        gsap.set(menu, { clearProps: "all" });
        gsap.set([openIcon, closeIcon].filter(Boolean), { clearProps: "all" });
        return;
      }

      timeline = gsap.timeline({
        onComplete: () => {
          menu.classList.remove("is--open");
          gsap.set(menu, { display: "none", clearProps: "opacity" });
        },
      });

      timeline.to(menu, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });

      if (openIcon) {
        timeline.to(openIcon, {
          opacity: 1,
          rotate: 0,
          scale: 1,
          duration: 0.3,
        }, 0);
      }

      if (closeIcon) {
        timeline.to(closeIcon, {
          opacity: 0,
          rotate: -90,
          scale: 0.75,
          duration: 0.25,
        }, 0);
      }
    };

    const openMenu = () => {
      if (!mobileQuery.matches || open) return;

      open = true;
      timeline?.kill();

      trigger.classList.add("is--open");
      trigger.setAttribute("aria-expanded", "true");
      navbar.classList.add("is--menu-open");
      menu.classList.add("is--open");
      lock();

      timeline = gsap.timeline();

      timeline
        .set(menu, {
          display: "flex",
          pointerEvents: "auto",
        })
        .fromTo(
          menu,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          },
        );

      if (openIcon) {
        timeline.to(openIcon, {
          opacity: 0,
          rotate: 90,
          scale: 0.75,
          duration: 0.25,
        }, 0);
      }

      if (closeIcon) {
        timeline.to(closeIcon, {
          opacity: 1,
          rotate: 0,
          scale: 1,
          duration: 0.3,
        }, 0);
      }
    };

    const toggle = () => {
      open ? closeMenu() : openMenu();
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggle();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) closeMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) closeMenu();
      });
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) closeMenu(true);
    });

    if (!mobileQuery.matches) closeMenu(true);
  }
})(); 