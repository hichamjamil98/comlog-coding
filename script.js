/* ==========================================================================
   COMLOG — INTERACTIONS
   Requires GSAP + ScrollTrigger
========================================================================== */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initGermanResponsiveText();

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

  /* =========================================================================
     GERMAN RESPONSIVE TEXT
     Keep words whole. Wrap + hyphenate a word only if it cannot fit
     on the next line (wider than the heading).
  ========================================================================= */

  function initGermanResponsiveText() {
    const html = document.documentElement;

    if (html.lang !== "de-DE") return;
    if (html.classList.contains("w-editor")) return;

    const headings = [
      ...document.querySelectorAll('[class*="heading-style-"]'),
    ];

    if (!headings.length) return;

    const apply = () => {
      headings.forEach(wrapOverflowingGermanWords);
    };

    apply();

    if (document.fonts?.ready) {
      document.fonts.ready.then(apply).catch(() => {});
    }

    let resizeFrame = null;

    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(apply);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
  }

  function unwrapGermanWords(element) {
    element.querySelectorAll(".de-word").forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    element.normalize();
  }

  function getGermanLineWidth(element) {
    const styles = getComputedStyle(element);

    return (
      element.clientWidth -
      (parseFloat(styles.paddingLeft) || 0) -
      (parseFloat(styles.paddingRight) || 0)
    );
  }

  function collectGermanTextNodes(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/\S/.test(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    return textNodes;
  }

  function wrapOverflowingGermanWords(element) {
    unwrapGermanWords(element);

    const lineWidth = getGermanLineWidth(element);
    if (lineWidth <= 0) return;

    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;pointer-events:none;";
    element.appendChild(probe);

    collectGermanTextNodes(element).forEach((node) => {
      if (node.parentElement === probe) return;

      const parts = node.nodeValue.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      let wrapped = false;

      parts.forEach((part) => {
        if (!part) return;

        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        probe.textContent = part;

        if (probe.getBoundingClientRect().width > lineWidth + 0.5) {
          const span = document.createElement("span");
          span.className = "de-word";
          span.textContent = part;
          fragment.appendChild(span);
          wrapped = true;
          return;
        }

        fragment.appendChild(document.createTextNode(part));
      });

      if (wrapped) {
        node.parentNode.replaceChild(fragment, node);
      }
    });

    probe.remove();
  }

  function prepareSplitLines(element, prefix) {
    const readyKey = `${prefix.replace(/-/g, "")}Ready`;

    if (element.dataset[readyKey] === "true") {
      return gsap.utils.toArray(element.querySelectorAll(`.${prefix}__line`));
    }

    const content = element.innerHTML.trim();
    if (!content) return [];

    const segments = content
      .split(/<br\s*\/?>/i)
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (!segments.length) return [];

    element.innerHTML = segments
      .map(
        (segment) => `
          <span class="${prefix}__line-mask">
            <span class="${prefix}__line">${segment}</span>
          </span>
        `,
      )
      .join("");

    element.dataset[readyKey] = "true";
    return gsap.utils.toArray(element.querySelectorAll(`.${prefix}__line`));
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

    const navbars = elements.filter((el) => el.classList.contains("navbar"));
    const others = elements.filter((el) => !el.classList.contains("navbar"));

    if (navbars.length) {
      timeline.fromTo(
        navbars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.85,
          clearProps: "opacity",
        },
        0,
      );
    }

    if (!others.length) return;

    timeline.fromTo(
      others,
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
    const lines = animElements("load-split").flatMap((element) =>
      prepareSplitLines(element, "load-split"),
    );

    if (!lines.length) return;

    timeline.fromTo(
      lines,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.08,
        clearProps: "transform,opacity",
      },
      0.14,
    );
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
      const lines = prepareSplitLines(element, "fade-split");
      if (!lines.length) return;

      gsap.fromTo(
        lines,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
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
        desktopTimeline.pause();
        gsap.set(list, { display: "none", clearProps: "opacity,x,transform" });
        if (arrow) gsap.set(arrow, { clearProps: "transform" });
      }

      gsap.killTweensOf([list, arrow].filter(Boolean));

      if (!mobileQuery.matches || immediate) {
        gsap.set(list, { clearProps: "all" });
        if (arrow) gsap.set(arrow, { clearProps: "all" });
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

    const openDropdown = (
      dropdown,
      { exclusive = false, animate = true } = {},
    ) => {
      const { trigger, list, arrow } = getDropdownParts(dropdown);
      if (!list) return;

      if (exclusive) {
        dropdowns.forEach((item) => {
          if (item !== dropdown) closeDropdown(item, true);
        });
      }

      dropdown.classList.add("is--open");
      trigger?.setAttribute("aria-expanded", "true");
      list.setAttribute("aria-hidden", "false");

      if (!mobileQuery.matches) return;

      const desktopTimeline = desktopTimelines.get(dropdown);
      desktopTimeline?.pause();

      gsap.killTweensOf([list, arrow].filter(Boolean));

      if (!animate) {
        gsap.set(list, {
          display: "flex",
          opacity: 1,
          x: 0,
          clearProps: "height,overflow",
        });
        if (arrow) gsap.set(arrow, { rotate: 180 });
        return;
      }

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

    const openAllMobileDropdowns = () => {
      dropdowns.forEach((dropdown) => {
        const { list, arrow } = getDropdownParts(dropdown);
        const desktopTimeline = desktopTimelines.get(dropdown);

        // Never seek desktop timelines to 0 on mobile — that applies
        // opacity:0 / x:1.5rem from the desktop hover intro.
        desktopTimeline?.pause();
        gsap.killTweensOf([list, arrow].filter(Boolean));

        if (list) {
          gsap.set(list, {
            display: "flex",
            opacity: 1,
            x: 0,
            clearProps: "height,overflow",
          });
        }

        openDropdown(dropdown, { exclusive: false, animate: false });
      });
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
          immediateRender: false,
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
    });

    if (mobileQuery.matches) {
      openAllMobileDropdowns();
    }

    mobileQuery.addEventListener("change", (event) => {
      if (event.matches) {
        openAllMobileDropdowns();
        return;
      }

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

    const resetIcons = () => {
      if (openIcon) gsap.set(openIcon, { opacity: 1, clearProps: "transform" });
      if (closeIcon) gsap.set(closeIcon, { opacity: 0, clearProps: "transform" });
    };

    const prepareMobileDropdowns = () => {
      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        const list = dropdown.querySelector(":scope > .dropdown--list");
        const arrow = dropdown.querySelector(
          ":scope > .dropdown--trigger .drop--arrow",
        );
        const dropTrigger = dropdown.querySelector(
          ":scope > .dropdown--trigger",
        );

        dropdown.classList.add("is--open");
        dropTrigger?.setAttribute("aria-expanded", "true");
        list?.setAttribute("aria-hidden", "false");

        if (list) {
          gsap.set(list, {
            display: "flex",
            opacity: 1,
            x: 0,
            clearProps: "height,overflow",
          });
        }
        if (arrow) gsap.set(arrow, { rotate: 180 });
      });
    };

    const closeMenu = (immediate = false) => {
      open = false;
      timeline?.kill();

      trigger.classList.remove("is--open");
      trigger.setAttribute("aria-expanded", "false");

      if (immediate || !mobileQuery.matches) {
        navbar.classList.remove("is--menu-open");
        menu.classList.remove("is--open");
        gsap.set(menu, { clearProps: "all" });
        resetIcons();
        return;
      }

      timeline = gsap.timeline({
        onComplete: () => {
          menu.classList.remove("is--open");
          navbar.classList.remove("is--menu-open");
          gsap.set(menu, {
            display: "none",
            clearProps: "opacity,x,xPercent,transform,pointerEvents",
          });
        },
      });

      timeline.to(
        menu,
        {
          xPercent: 100,
          opacity: 0,
          duration: 0.35,
          ease: "power2.inOut",
        },
        0,
      );

      if (openIcon) {
        timeline.to(openIcon, { opacity: 1, duration: 0.3 }, 0);
      }

      if (closeIcon) {
        timeline.to(closeIcon, { opacity: 0, duration: 0.25 }, 0);
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
      prepareMobileDropdowns();

      timeline = gsap.timeline();

      timeline
        .set(menu, {
          display: "flex",
          xPercent: 100,
          opacity: 0,
          pointerEvents: "auto",
        })
        .to(menu, {
          xPercent: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });

      if (openIcon) {
        timeline.to(openIcon, { opacity: 0, duration: 0.25 }, 0);
      }

      if (closeIcon) {
        timeline.to(closeIcon, { opacity: 1, duration: 0.3 }, 0);
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

/* ==========================================================================
   MARQUEE SCROLL DIRECTION
========================================================================== */

function initMarqueeScrollDirection() {
  document
    .querySelectorAll("[data-marquee-scroll-direction-target]")
    .forEach((marquee) => {
      // Query marquee elements
      const marqueeContent = marquee.querySelector(
        "[data-marquee-collection-target]",
      );
      const marqueeScroll = marquee.querySelector(
        "[data-marquee-scroll-target]",
      );
      if (!marqueeContent || !marqueeScroll) return;

      // Get data attributes
      const {
        marqueeSpeed: speed,
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset;

      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed);
      const marqueeDirectionAttr = direction === "right" ? 1 : -1; // 1 for right, -1 for left
      const duplicateAmount = parseInt(duplicate || 0);
      const scrollSpeedAttr = parseFloat(scrollSpeed);
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

      let marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier;

      // Precompute styles for the scroll container
      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
      marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

      // Duplicate marquee content
      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }

      // GSAP animation for marquee content
      const marqueeItems = marquee.querySelectorAll(
        "[data-marquee-collection-target]",
      );
      const animation = gsap
        .to(marqueeItems, {
          xPercent: -100, // Move completely out of view
          repeat: -1,
          duration: marqueeSpeed,
          ease: "linear",
        })
        .totalProgress(0.5);

      // Initialize marquee in the correct direction
      gsap.set(marqueeItems, {
        xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
      });
      animation.timeScale(marqueeDirectionAttr); // Set correct direction
      animation.play(); // Start animation immediately

      // Set initial marquee status
      marquee.setAttribute("data-marquee-status", "normal");

      // ScrollTrigger logic for direction inversion
      ScrollTrigger.create({
        trigger: marquee,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const isInverted = self.direction === 1; // Scrolling down
          const currentDirection = isInverted
            ? -marqueeDirectionAttr
            : marqueeDirectionAttr;

          // Update animation direction and marquee status
          animation.timeScale(currentDirection);
          marquee.setAttribute(
            "data-marquee-status",
            isInverted ? "normal" : "inverted",
          );
        },
      });

      // Extra speed effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marquee,
          start: "0% 100%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      const scrollStart =
        marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
      const scrollEnd = -scrollStart;

      tl.fromTo(
        marqueeScroll,
        { x: `${scrollStart}vw` },
        { x: `${scrollEnd}vw`, ease: "none" },
      );
    });
}

// Initialize Marquee with Scroll Direction
document.addEventListener("DOMContentLoaded", () => {
  initMarqueeScrollDirection();
});
