"use strict";

/**
 * Initialize the application when the DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  console.log("App initialized");
}

/**
 * Utility: query a single element.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element|null}
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Utility: query multiple elements.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element[]}
 */
function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Create an element with optional attributes and children.
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {(Node|string)[]} [children]
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") {
      el.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    el.append(child instanceof Node ? child : document.createTextNode(child));
  }

  return el;
}
