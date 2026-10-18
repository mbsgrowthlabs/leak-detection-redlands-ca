(function () {
  "use strict";

  var mobileQuery = window.matchMedia("(max-width: 980px)");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function focusableWithin(element) {
    return Array.prototype.filter.call(
      element.querySelectorAll(".nav-focusable"),
      function (node) {
        return !node.hidden && node.offsetParent !== null;
      },
    );
  }

  function setDropdown(dropdown, open) {
    var button = dropdown.querySelector(".nav-dropdown-toggle");
    var panel = dropdown.querySelector(".nav-dropdown-panel");
    var state = dropdown.querySelector(".nav-dropdown-state");
    var icon = dropdown.querySelector(".nav-dropdown-icon");
    if (!button || !panel) return;
    button.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.hidden = !open;
    dropdown.classList.toggle("is-open", open);
    panel.classList.toggle("nav-dropdown-panel-open", open);
    if (icon) icon.classList.toggle("nav-dropdown-icon-open", open);
    if (state) state.textContent = open ? "Close menu" : "Open menu";
  }

  function closeDropdowns(except) {
    Array.prototype.forEach.call(document.querySelectorAll(".nav-dropdown"), function (dropdown) {
      if (dropdown !== except) setDropdown(dropdown, false);
    });
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-links");
    var backdrop = document.querySelector(".nav-backdrop");
    var closeButton = document.querySelector(".nav-sidebar-close");
    var sidebarHeader = document.querySelector(".nav-sidebar-header");
    var sidebarFooter = document.querySelector(".nav-sidebar-footer");
    var openIcon = document.querySelector(".nav-open-icon");
    var closeIcon = document.querySelector(".nav-close-icon");
    if (!toggle || !menu) return;
    var initialLabel = toggle.getAttribute("aria-label") || "Open navigation";
    var closeLabel = toggle.getAttribute("data-close-label") || "Close navigation";

    function setSidebarChrome(mobile) {
      if (sidebarHeader) sidebarHeader.hidden = !mobile;
      if (sidebarFooter) sidebarFooter.hidden = !mobile;
    }

    function setMenuOpen(open, restoreFocus) {
      var shouldOpen = mobileQuery.matches && open;
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      toggle.setAttribute("aria-label", shouldOpen ? closeLabel : initialLabel);
      menu.classList.toggle("nav-links-open", shouldOpen);
      menu.classList.toggle("open", shouldOpen);
      if (backdrop) backdrop.classList.toggle("nav-backdrop-open", shouldOpen);
      if (openIcon) openIcon.classList.toggle("nav-open-icon-hidden", shouldOpen);
      if (closeIcon) closeIcon.classList.toggle("nav-close-icon-visible", shouldOpen);
      document.body.classList.toggle("canopy-nav-lock", shouldOpen);
      document.body.classList.toggle("menu-open", shouldOpen);
      menu.setAttribute("aria-hidden", String(!shouldOpen));
      if ("inert" in menu) menu.inert = !shouldOpen;
      if (shouldOpen && closeButton) closeButton.focus();
      if (!shouldOpen) {
        closeDropdowns();
        if (restoreFocus) toggle.focus();
      }
    }

    function syncMode() {
      setSidebarChrome(mobileQuery.matches);
      if (mobileQuery.matches) {
        setMenuOpen(false, false);
      } else {
        menu.classList.remove("nav-links-open");
        menu.classList.remove("open");
        if (backdrop) backdrop.classList.remove("nav-backdrop-open");
        if (openIcon) openIcon.classList.remove("nav-open-icon-hidden");
        if (closeIcon) closeIcon.classList.remove("nav-close-icon-visible");
        document.body.classList.remove("canopy-nav-lock");
        document.body.classList.remove("menu-open");
        menu.removeAttribute("aria-hidden");
        if ("inert" in menu) menu.inert = false;
        toggle.setAttribute("aria-expanded", "false");
        closeDropdowns();
      }
    }

    toggle.addEventListener("click", function () {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });
    if (backdrop) backdrop.addEventListener("click", function () {
      setMenuOpen(false, false);
    });
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        setMenuOpen(false, true);
      });
    }
    menu.addEventListener("click", function (event) {
      var link = event.target.closest(".nav-closing-link");
      if (link) {
        setMenuOpen(false, false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenuOpen(false, true);
      if (event.key !== "Tab" || toggle.getAttribute("aria-expanded") !== "true") return;
      var nodes = focusableWithin(menu);
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", syncMode);
    else mobileQuery.addListener(syncMode);
    syncMode();
  }

  function initDropdowns() {
    Array.prototype.forEach.call(document.querySelectorAll(".nav-dropdown"), function (dropdown) {
      var button = dropdown.querySelector(".nav-dropdown-toggle");
      if (!button) return;
      var hoverTimer;
      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") !== "true";
        closeDropdowns(dropdown);
        setDropdown(dropdown, open);
      });
      dropdown.addEventListener("mouseenter", function () {
        if (mobileQuery.matches) return;
        window.clearTimeout(hoverTimer);
        closeDropdowns(dropdown);
        setDropdown(dropdown, true);
      });
      dropdown.addEventListener("mouseleave", function () {
        if (mobileQuery.matches) return;
        hoverTimer = window.setTimeout(function () {
          setDropdown(dropdown, false);
        }, 140);
      });
      dropdown.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        setDropdown(dropdown, false);
        button.focus();
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav-dropdown")) closeDropdowns();
    });
  }

  function bindHighlight(selector, className) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
      function turnOn() {
        element.classList.add(className);
      }
      function turnOff() {
        element.classList.remove(className);
      }
      element.addEventListener("mouseenter", turnOn);
      element.addEventListener("mouseleave", turnOff);
      element.addEventListener("focus", turnOn);
      element.addEventListener("blur", turnOff);
    });
  }

  function initNavHighlights() {
    bindHighlight(".utility-link", "utility-link-highlight");
    bindHighlight(".nav-link", "nav-link-highlight");
    bindHighlight(".nav-dropdown-overview", "nav-dropdown-overview-highlight");
    bindHighlight(".nav-dropdown-item", "nav-dropdown-item-highlight");
    bindHighlight(".nav-dropdown-all", "nav-dropdown-item-highlight");
    bindHighlight(".nav-control", "nav-control-highlight");
  }

  function markCurrentNavigation() {
    var current = window.location.pathname.replace(/\/+$/, "") || "/";
    var matched = false;
    Array.prototype.forEach.call(document.querySelectorAll(".nav-track-link"), function (link) {
      if (matched) return;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      try {
        var target = new URL(href, window.location.href).pathname.replace(/\/+$/, "") || "/";
        if (target !== current) return;
        matched = true;
        link.setAttribute("aria-current", "page");
        if (link.classList.contains("nav-link")) {
          link.classList.add("nav-link-current");
        } else if (link.classList.contains("nav-dropdown-overview")) {
          link.classList.add("nav-dropdown-overview-current");
        } else {
          link.classList.add("nav-dropdown-item-current");
        }
      } catch (_error) {
        return;
      }
    });
  }

  function initAccordions() {
    Array.prototype.forEach.call(document.querySelectorAll(".accordion"), function (accordion, accordionIndex) {
      Array.prototype.forEach.call(accordion.querySelectorAll("article"), function (item, itemIndex) {
        var button = item.querySelector("button");
        var panel = item.querySelector(":scope > div");
        if (!button || !panel) return;
        var panelId = "accordion-" + accordionIndex + "-" + itemIndex;
        panel.id = panelId;
        button.setAttribute("aria-controls", panelId);
        panel.setAttribute("aria-hidden", String(!item.classList.contains("open")));
        button.addEventListener("click", function () {
          var willOpen = !item.classList.contains("open");
          Array.prototype.forEach.call(accordion.querySelectorAll("article"), function (other) {
            other.classList.remove("open");
            var otherButton = other.querySelector("button");
            var otherPanel = other.querySelector(":scope > div");
            if (otherButton) otherButton.setAttribute("aria-expanded", "false");
            if (otherPanel) otherPanel.setAttribute("aria-hidden", "true");
          });
          if (willOpen) {
            item.classList.add("open");
            button.setAttribute("aria-expanded", "true");
            panel.setAttribute("aria-hidden", "false");
          }
        });
      });
    });
  }

  function initProcess() {
    var buttons = document.querySelectorAll("[data-process]");
    if (!buttons.length) return;
    var label = document.getElementById("process-step");
    var title = document.getElementById("process-title");
    var description = document.getElementById("process-description");
    var meter = document.querySelector(".process-progress i");
    Array.prototype.forEach.call(buttons, function (button, index) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (other) {
          var active = other === button;
          other.setAttribute("aria-pressed", String(active));
          var article = other.closest("article");
          if (article) article.classList.toggle("active", active);
        });
        if (label) label.textContent = button.getAttribute("data-process-label") || "";
        if (title) title.textContent = button.getAttribute("data-process-title") || "";
        if (description) description.textContent = button.getAttribute("data-process-description") || "";
        if (meter) meter.style.width = (((index + 1) / buttons.length) * 100) + "%";
      });
      button.setAttribute("aria-pressed", String(index === 0));
    });
  }

  function leadConfig() {
    var config = window.__RL_LEADS || {};
    var base = String(config.apiBase || "");
    var siteId = String(config.siteId || "");
    if (!/^https?:\/\//.test(base) || !siteId || siteId.indexOf("{{") !== -1) return null;
    return { apiBase: base.replace(/\/+$/, ""), siteId: siteId };
  }

  function setFormState(form, state) {
    form.setAttribute("data-status", state);
    var button = form.querySelector('button[type="submit"]');
    var success = form.querySelector(".form-success");
    var error = form.querySelector(".form-error");
    if (button) {
      button.disabled = state === "pending" || state === "success";
      if (state === "pending") button.setAttribute("aria-busy", "true");
      else button.removeAttribute("aria-busy");
    }
    if (success) success.classList.toggle("visible", state === "success");
    if (error) error.classList.toggle("visible", state === "error");
    if (state === "error" && error) error.focus({ preventScroll: true });
  }

  function initLeadForms() {
    document.addEventListener("submit", function (event) {
      var form = event.target && event.target.matches && event.target.matches("form[data-rl-lead]") ? event.target : null;
      if (!form) return;
      event.preventDefault();
      if (form.getAttribute("data-status") === "pending" || form.getAttribute("data-status") === "success") return;
      var honeypot = form.querySelector('[name="_hp"]');
      if (honeypot && honeypot.value) {
        setFormState(form, "success");
        return;
      }
      var config = leadConfig();
      if (!config) {
        setFormState(form, "error");
        return;
      }
      var payload = {};
      new FormData(form).forEach(function (value, key) {
        if (key !== "_hp" && key !== "cf-turnstile-response") payload[key] = String(value);
        if (key === "cf-turnstile-response" && value) payload.turnstileToken = String(value);
      });
      payload.pageUrl = window.location.href;
      setFormState(form, "pending");
      fetch(config.apiBase + "/api/leads/" + encodeURIComponent(config.siteId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).then(function (response) {
        if (!response.ok) throw new Error("Lead request failed");
        setFormState(form, "success");
      }).catch(function () {
        setFormState(form, "error");
      });
    });
    document.addEventListener("rl:lead-success", function (event) {
      if (event.detail && event.detail.form) setFormState(event.detail.form, "success");
    });
    document.addEventListener("rl:lead-error", function (event) {
      if (event.detail && event.detail.form) setFormState(event.detail.form, "error");
    });
  }

  function initReveals() {
    var elements = document.querySelectorAll("[data-sal]");
    if (!elements.length) return;
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(elements, function (element) { element.classList.add("sal-animate"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("sal-animate");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(elements, function (element) { observer.observe(element); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initDropdowns();
    initNavHighlights();
    initAccordions();
    initProcess();
    initLeadForms();
    initReveals();
    markCurrentNavigation();
  });
})();
