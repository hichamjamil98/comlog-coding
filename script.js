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
    window.initHeroCheckLists?.();
    window.initServiceRichtextEmphasis?.();
  });

  /* =========================================================================
     HELPERS
  ========================================================================= */

  function animElements(name) {
    return gsap.utils.toArray(`[${name}], [animation="${name}"]`);
  }

  /* =========================================================================
     GERMAN RESPONSIVE TEXT
     Each word is an inline-block so it wraps whole. Hyphenate only when
     that word is wider than the real column (cannot fit on the next line).
  ========================================================================= */

  function isGermanLocale(html) {
    const lang = html.getAttribute("lang") || html.lang || "";
    return /^de(-|$)/i.test(lang);
  }

  function initGermanResponsiveText() {
    const html = document.documentElement;

    if (!isGermanLocale(html)) return;
    if (html.classList.contains("w-editor")) return;

    const headings = [
      ...document.querySelectorAll('[class*="heading-style-"]'),
    ];

    if (!headings.length) return;

    headings.forEach(wrapGermanWords);

    const apply = () => {
      headings.forEach(markOverflowingGermanWords);

      if (typeof window.ScrollTrigger !== "undefined") {
        window.ScrollTrigger.refresh();
      }
    };

    const schedule = () => {
      requestAnimationFrame(() => requestAnimationFrame(apply));
    };

    apply();
    schedule();

    if (document.fonts?.ready) {
      document.fonts.ready.then(schedule).catch(() => {});
    }

    window.addEventListener("load", schedule, { once: true });

    let resizeFrame = null;
    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(apply);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(onResize);
      headings.forEach((heading) => observer.observe(heading));
      if (headings[0]?.parentElement) {
        observer.observe(headings[0].parentElement);
      }
    }
  }

  function wrapGermanWords(element) {
    if (element.dataset.deWords === "true") return;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/\S/.test(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (node.parentElement?.closest(".de-word")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      parts.forEach((part) => {
        if (!part) return;

        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const span = document.createElement("span");
        span.className = "de-word";
        span.textContent = part;
        span.dataset.deOriginal = part;
        fragment.appendChild(span);
      });

      node.parentNode.replaceChild(fragment, node);
    });

    element.dataset.deWords = "true";
  }

  /*
    General German compounding pieces, not a page-by-page word list.
    Longest match first. Fugenlaut (-s-, -n-, -en-, -es-) is handled
    separately so "Sicherheit" + s + "logistik" still splits.
  */
  const GERMAN_COMPOUND_STEMS = [
    "infrastruktur",
    "ansprechpartner",
    "kommissionierung",
    "koordination",
    "genehmigung",
    "sicherheit",
    "spedition",
    "transporte",
    "transport",
    "management",
    "logistik",
    "anfragen",
    "anfrage",
    "sicherung",
    "abwicklung",
    "kontrolle",
    "technische",
    "lieferung",
    "industrie",
    "botschaften",
    "botschaft",
    "anstalten",
    "anstalt",
    "behörden",
    "behörde",
    "vollzug",
    "montage",
    "wartung",
    "flughafen",
    "vorfeld",
    "service",
    "airport",
    "partner",
    "netzwerk",
    "express",
    "standard",
    "versand",
    "terminal",
    "technik",
    "dienste",
    "dienst",
    "spezial",
    "aviation",
    "kritische",
    "projekt",
    "ladung",
    "justiz",
    "leistung",
    "bereiche",
    "bereich",
    "spuren",
    "sonder",
    "haupt",
    "neben",
    "innen",
    "außen",
    "gesamt",
    "selbst",
    "zwischen",
    "hinter",
    "unter",
    "über",
    "gegen",
    "durch",
    "kontroll",
    "planung",
    "lösung",
    "system",
    "anlagen",
    "anlage",
    "betrieb",
    "prozess",
    "qualität",
    "personal",
    "fahrzeug",
    "fahrzeuge",
    "fahrer",
    "maschine",
    "maschinen",
    "bauteil",
    "bauteile",
    "sendung",
    "sendungen",
    "konzept",
    "konzepte",
    "anforderung",
    "anforderungen",
    "auflage",
    "auflagen",
    "inbetrieb",
    "dienstleister",
    "techniker",
    "forderungen",
    "forderung",
    "zeitkritisch",
    "luftfracht",
    "zusammenhalt",
    "projekte",
    "geschäft",
    "tages",
    "anspruch",
    "heraus",
    "fracht",
    "nahme",
    "mittel",
    "platz",
    "beruf",
    "kraft",
    "arbeit",
    "kritisch",
    "volle",
    "voll",
    "gross",
    "groß",
    "hoch",
    "luft",
    "zeit",
  ]
    .filter((stem, index, stems) => stems.indexOf(stem) === index)
    .sort((left, right) => right.length - left.length);

  const GERMAN_FUGEN = ["ens", "en", "es", "n", "s"];

  function findGermanStemAt(lower, index) {
    for (const candidate of GERMAN_COMPOUND_STEMS) {
      if (lower.startsWith(candidate, index)) return candidate;
    }
    return "";
  }

  function findGermanFugenAt(lower, index) {
    if (index <= 0 || index >= lower.length) return "";

    for (const fugen of GERMAN_FUGEN) {
      if (!lower.startsWith(fugen, index)) continue;
      if (findGermanStemAt(lower, index + fugen.length)) return fugen;
    }

    return "";
  }

  function splitGermanCompoundPlain(word) {
    const lower = word.toLocaleLowerCase("de-DE");

    if (lower.length < 10) return [word];

    const parts = [];
    let index = 0;

    while (index < word.length) {
      const stem = findGermanStemAt(lower, index);

      if (!stem) {
        if (!parts.length) return [word];
        parts[parts.length - 1] += word.slice(index);
        break;
      }

      const remaining = word.length - (index + stem.length);

      if (index === 0 && remaining === 0) return [word];

      parts.push(word.slice(index, index + stem.length));
      index += stem.length;

      const fugen = findGermanFugenAt(lower, index);
      if (fugen) {
        parts[parts.length - 1] += word.slice(index, index + fugen.length);
        index += fugen.length;
      }
    }

    return parts.length > 1 ? parts : [word];
  }

  function splitGermanCompound(word) {
    if (word.includes("-")) {
      const chunks = word.split("-").map((chunk) => chunk.trim()).filter(Boolean);

      if (chunks.length > 1) {
        return chunks.flatMap((chunk) => splitGermanCompoundPlain(chunk));
      }
    }

    return splitGermanCompoundPlain(word);
  }

  function hyphenateGermanCompound(text) {
    const parsed = text.match(/^([^\p{L}\p{M}]*)(.*?)([^\p{L}\p{M}]*)$/su);

    if (!parsed || !parsed[2]) {
      return { lead: "", parts: [text], trail: "" };
    }

    const parts = splitGermanCompound(parsed[2]);

    return { lead: parsed[1], parts, trail: parsed[3] };
  }

  function restoreGermanWord(word) {
    if (word.dataset.deOriginal) {
      word.textContent = word.dataset.deOriginal;
    }
    word.classList.remove("is--hyphenate");
  }

  function renderGermanCompound(word, lead, parts, trail) {
    // Keep soft hyphens in one text node. Soft hyphens between
    // inline-block .de-part spans can paint as visible dashes even
    // when the word is not wrapping (Comlog feedback #10 / #12).
    word.textContent = `${lead}${parts.join("\u00AD")}${trail}`;
    word.classList.add("is--hyphenate");
  }

  function paddedClientWidth(element) {
    const styles = getComputedStyle(element);

    return (
      element.clientWidth -
      (parseFloat(styles.paddingLeft) || 0) -
      (parseFloat(styles.paddingRight) || 0)
    );
  }

  function getGermanLineWidth(element) {
    const viewport = document.documentElement.clientWidth;
    let width = viewport;
    let node = element;

    while (node && node !== document.documentElement) {
      const next = paddedClientWidth(node);

      if (next > 0 && next <= viewport + 1) {
        width = Math.min(width, next);
      }

      node = node.parentElement;
    }

    return width;
  }

  function measureGermanText(heading, text) {
    const probe = document.createElement("span");
    probe.className = "de-word";
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;pointer-events:none;";
    probe.textContent = text;
    heading.appendChild(probe);

    const width = Math.max(probe.scrollWidth, probe.getBoundingClientRect().width);
    probe.remove();
    return width;
  }

  function packGermanStems(stems, lineWidth, measure) {
    if (stems.length <= 1) return stems;

    const leftStems = stems.slice(0, -1);
    const right = stems[stems.length - 1];
    const left = leftStems.join("");

    if (measure(left) <= lineWidth + 1) {
      return [left, right];
    }

    return [...packGermanStems(leftStems, lineWidth, measure), right];
  }

  function markOverflowingGermanWords(element) {
    const words = element.querySelectorAll(".de-word");
    if (!words.length) return;

    words.forEach(restoreGermanWord);

    const lineWidth = getGermanLineWidth(element);
    if (lineWidth <= 0) return;

    const measure = (text) => measureGermanText(element, text);

    words.forEach((word) => {
      const wordWidth = Math.max(
        word.scrollWidth,
        word.getBoundingClientRect().width,
      );

      if (wordWidth <= lineWidth + 1) return;

      const original = word.dataset.deOriginal || word.textContent;
      const { lead, parts, trail } = hyphenateGermanCompound(original);

      if (parts.length < 2) return;

      renderGermanCompound(
        word,
        lead,
        packGermanStems(parts, lineWidth, measure),
        trail,
      );
    });
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

function prepareHomePartnersDualMarquee() {
  // Mobile only: second logo row scrolling the opposite direction
  if (!window.matchMedia("(max-width: 767px)").matches) return;

  const section = document.querySelector(".section.is--home-partners");
  if (!section) return;

  const original = section.querySelector(
    "[data-marquee-scroll-direction-target]",
  );
  if (
    !original ||
    section.querySelector(".marquee-advanced.is--partners-row-2")
  ) {
    return;
  }

  original.classList.add("is--partners-row-1");

  const row2 = original.cloneNode(true);
  row2.classList.add("is--partners-row-2");
  row2.classList.remove("is--partners-row-1");

  const topDirection = (
    original.getAttribute("data-marquee-direction") || "right"
  ).toLowerCase();
  row2.setAttribute(
    "data-marquee-direction",
    topDirection === "right" ? "left" : "right",
  );

  original.after(row2);
}

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
  prepareHomePartnersDualMarquee();
  initMarqueeScrollDirection();
});

/* ==========================================================================
   HERO CHECKLISTS + SERVICE BODY EMPHASIS
   Webflow rich-text props only accept plain innerText via MCP, so lists
   and <strong> spans are restored on the published page to match Figma.
========================================================================== */

(() => {
  "use strict";

  const SERVICE_EMPHASIS = [
    // Vorfeldservice
    "Anlieferung und den Abtransport von Materialien, Ersatzteilen und Anlagenkomponenten",
    "Versorgung der Infrastruktur und Anlagen am Vorfeld",
    "Luftsicherheitsschulungsverordnung geschult und zertifiziert",
    "Flughafenausweise sowie Vorfeldgenehmigungen",
    "großen deutschen Bundesflughäfen",
    // Spedition
    "vollständige Planung, Organisation und Durchführung",
    "Standardlieferung über Expressversand bis zu komplexen Sondertransporten",
    "individuelle Konzepte, die exakt auf Ihre Ladung, Route und Anforderungen abgestimmt sind",
    "Zollabwicklung und Ladungssicherung",
    "Koordination aller notwendigen Behördengenehmigungen",
    "bewährten Partnernetzwerk",
    // Projektlogistik
    "präzise Planung und reibungslose Umsetzung",
    "Realisierung kritischer Infrastrukturprojekte",
    "Flughäfen und hochspezialisierten Anlagen für Behörden",
    "detaillierten Bedarfsanalyse",
    "Beschaffung und Lagerung sensibler Komponenten",
    "just-in-time-Lieferung",
    // Technische Dienste
    "ersten Konzeptidee über die Montage bis zum laufenden technischen Betrieb",
    "Installation, Aufbau und Inbetriebnahme von Sicherheitstechnik",
    "Flughäfen, Behörden und Hochsicherheitsbereichen",
    "regelmäßige Wartung und technischen Service",
    "zertifizierten Mitarbeitern",
    "höchste Qualität und Termintreue",
  ].sort((a, b) => b.length - a.length);

  function initHeroCheckLists() {
    document.querySelectorAll(".richtext.w-richtext").forEach((richtext) => {
      richtext.querySelectorAll("p").forEach((paragraph) => {
        if (!paragraph.querySelector("br")) return;
        if (paragraph.closest("li")) return;

        const html = paragraph.innerHTML;
        const parts = html
          .split(/<br\s*\/?>/i)
          .map((part) => part.trim())
          .filter(Boolean);

        if (parts.length < 2) return;

        // Only convert short bullet-like lines, not long prose with accidental brs.
        if (parts.some((part) => part.replace(/<[^>]+>/g, "").length > 120)) {
          return;
        }

        const list = document.createElement("ul");
        list.setAttribute("role", "list");

        parts.forEach((part) => {
          const item = document.createElement("li");
          item.innerHTML = part;
          list.appendChild(item);
        });

        paragraph.replaceWith(list);
      });
    });
  }

  function emphasizeTextNode(node, phrases) {
    const text = node.nodeValue;
    if (!text || !/\S/.test(text)) return;

    let match = null;
    let phrase = null;

    for (const candidate of phrases) {
      const index = text.indexOf(candidate);
      if (index === -1) continue;
      if (!match || index < match.index) {
        match = { index, length: candidate.length };
        phrase = candidate;
      }
    }

    if (!match || !phrase) return;

    const fragment = document.createDocumentFragment();
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match.length);

    if (before) fragment.appendChild(document.createTextNode(before));

    const strong = document.createElement("strong");
    strong.textContent = phrase;
    fragment.appendChild(strong);

    if (after) {
      const afterNode = document.createTextNode(after);
      fragment.appendChild(afterNode);
      node.parentNode.replaceChild(fragment, node);
      emphasizeTextNode(afterNode, phrases);
      return;
    }

    node.parentNode.replaceChild(fragment, node);
  }

  function initServiceRichtextEmphasis() {
    document.querySelectorAll(".richtext-services").forEach((richtext) => {
      const walker = document.createTreeWalker(richtext, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !/\S/.test(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.parentElement?.closest("strong")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => emphasizeTextNode(node, SERVICE_EMPHASIS));
    });
  }

  window.initHeroCheckLists = initHeroCheckLists;
  window.initServiceRichtextEmphasis = initServiceRichtextEmphasis;
})();
