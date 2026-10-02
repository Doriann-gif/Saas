import type { ConsentCategory } from "@/lib/legal/services";

export type BannerConfig = {
  id: string;
  version: string;
  categories: { id: Exclude<ConsentCategory, "necessary">; label: string; description: string }[];
  policyUrl: string;
  /** Consent-log endpoint, or null when the plan doesn't include logging. */
  log: string | null;
  /** Send Google Consent Mode v2 signals. */
  gcm: boolean;
  badge: { text: string; url: string } | null;
};

/** Small, dependency-free consent banner. All text is set via textContent, never innerHTML. */
const RUNTIME = String.raw`
(function () {
  "use strict";
  var w = window, d = document;
  var KEY = "cly_consent_" + C.id;
  var MAX_AGE = 182 * 24 * 60 * 60 * 1000;
  var root = null, panel = null;

  function gtag() { (w.dataLayer = w.dataLayer || []).push(arguments); }
  function gcm(c) {
    var m = c.marketing ? "granted" : "denied";
    return {
      ad_storage: m, ad_user_data: m, ad_personalization: m,
      analytics_storage: c.analytics ? "granted" : "denied",
      functionality_storage: c.functional ? "granted" : "denied",
      personalization_storage: c.functional ? "granted" : "denied",
      security_storage: "granted"
    };
  }
  function read() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY) || "null");
      if (r && r.v === C.version && Date.now() - r.t < MAX_AGE) return r;
    } catch (e) {}
    return null;
  }
  function uid() {
    try { return crypto.randomUUID(); } catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
  }
  function apply(c) {
    d.querySelectorAll('script[type="text/plain"][data-consent]').forEach(function (s) {
      if (!c[s.getAttribute("data-consent")] || s.hasAttribute("data-cly-done")) return;
      var n = d.createElement("script");
      for (var i = 0; i < s.attributes.length; i++) {
        var a = s.attributes[i];
        if (a.name !== "type" && a.name !== "data-consent") n.setAttribute(a.name, a.value);
      }
      n.text = s.text;
      s.setAttribute("data-cly-done", "");
      s.parentNode.insertBefore(n, s.nextSibling);
    });
    d.querySelectorAll("iframe[data-consent][data-src]").forEach(function (f) {
      if (c[f.getAttribute("data-consent")] && !f.getAttribute("src")) f.setAttribute("src", f.getAttribute("data-src"));
    });
  }
  function save(c) {
    var prev = read();
    var r = { v: C.version, t: Date.now(), c: c, id: (prev && prev.id) || uid() };
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
    if (C.gcm) gtag("consent", "update", gcm(c));
    apply(c);
    if (C.log && navigator.sendBeacon) {
      try { navigator.sendBeacon(C.log, JSON.stringify({ p: C.id, id: r.id, c: c, v: C.version })); } catch (e) {}
    }
    try { w.dispatchEvent(new CustomEvent("clausely:consent", { detail: c })); } catch (e) {}
    hide();
  }
  function all(value) {
    var c = {};
    C.categories.forEach(function (k) { c[k.id] = value; });
    return c;
  }

  function el(tag, cls, text) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function btn(text, onClick) {
    var b = el("button", "cly-btn", text);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  function style() {
    var s = el("style");
    s.textContent = [
      ".cly{position:fixed;z-index:2147483647;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 10px 40px rgba(15,23,42,.18);padding:20px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-sizing:border-box;max-height:calc(100vh - 32px);overflow:auto}",
      ".cly *{box-sizing:border-box}",
      ".cly h2{font-size:16px;font-weight:600;margin:0 0 6px}",
      ".cly p{margin:0 0 14px;color:#334155}",
      ".cly a{color:#4338ca;text-decoration:underline}",
      ".cly-row{display:flex;gap:8px;flex-wrap:wrap}",
      ".cly-btn{flex:1 1 140px;min-height:40px;padding:8px 14px;border-radius:8px;border:1px solid #0f172a;background:#0f172a;color:#fff;font-family:inherit;font-size:14px;font-weight:600;line-height:1.2;cursor:pointer}",
      ".cly-btn:focus-visible{outline:3px solid #6366f1;outline-offset:2px}",
      ".cly-btn.cly-ghost{background:#fff;color:#0f172a}",
      ".cly-cat{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid #f1f5f9}",
      ".cly-cat input{margin-top:3px;width:18px;height:18px;accent-color:#0f172a}",
      ".cly-cat strong{display:block;font-weight:600}",
      ".cly-cat span{color:#475569;font-size:13px}",
      ".cly-badge{display:block;margin-top:12px;font-size:11px;color:#94a3b8 !important;text-decoration:none !important;text-align:right}"
    ].join("");
    d.head.appendChild(s);
  }
  function hide() { if (root) { root.remove(); root = null; } }
  function show(customize) {
    hide();
    var current = (read() || {}).c || {};
    root = el("div", "cly");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Cookie consent");
    root.appendChild(el("h2", null, "We value your privacy"));
    var p = el("p", null, "We use cookies to run this website and, with your consent, for the purposes below. You can accept all, reject all, or choose. Read more in our ");
    var a = el("a", null, "Cookie Policy");
    a.href = C.policyUrl;
    a.target = "_blank";
    a.rel = "noopener";
    p.appendChild(a);
    p.appendChild(d.createTextNode("."));
    root.appendChild(p);

    panel = el("div");
    panel.hidden = !customize;
    var nec = el("label", "cly-cat");
    var nb = el("input"); nb.type = "checkbox"; nb.checked = true; nb.disabled = true;
    var nt = el("div"); nt.appendChild(el("strong", null, "Strictly necessary")); nt.appendChild(el("span", null, "Required for the website to work. Always on."));
    nec.appendChild(nb); nec.appendChild(nt); panel.appendChild(nec);
    var boxes = {};
    C.categories.forEach(function (k) {
      var l = el("label", "cly-cat");
      var i = el("input"); i.type = "checkbox"; i.checked = !!current[k.id];
      var t = el("div"); t.appendChild(el("strong", null, k.label)); t.appendChild(el("span", null, k.description));
      l.appendChild(i); l.appendChild(t); panel.appendChild(l);
      boxes[k.id] = i;
    });
    root.appendChild(panel);

    var row = el("div", "cly-row");
    var reject = btn("Reject all", function () { save(all(false)); });
    var custom = btn("Customize", function () {
      if (panel.hidden) { panel.hidden = false; custom.textContent = "Save choices"; return; }
      var c = {};
      Object.keys(boxes).forEach(function (k) { c[k] = boxes[k].checked; });
      save(c);
    });
    if (customize) custom.textContent = "Save choices";
    var accept = btn("Accept all", function () { save(all(true)); });
    // Reject and accept are given equal prominence, as required by EU regulators.
    custom.className += " cly-ghost";
    row.appendChild(reject); row.appendChild(custom); row.appendChild(accept);
    root.appendChild(row);

    if (C.badge) {
      var b = el("a", "cly-badge", C.badge.text);
      b.href = C.badge.url; b.target = "_blank"; b.rel = "noopener";
      root.appendChild(b);
    }
    d.body.appendChild(root);
  }

  var stored = read();
  if (C.gcm) {
    gtag("consent", "default", Object.assign(gcm({}), { wait_for_update: 500 }));
    if (stored) gtag("consent", "update", gcm(stored.c));
  }

  function init() {
    if (!C.categories.length) return;
    style();
    if (stored) apply(stored.c); else show(false);
    d.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-cly-open],a[href="#cookie-settings"]');
      if (t) { e.preventDefault(); show(true); }
    });
  }

  w.Clausely = {
    open: function () { show(true); },
    get: function () { var r = read(); return r ? r.c : null; }
  };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
`;

export function bannerScript(config: BannerConfig): string {
  // Escape "<" so the config can never close a surrounding <script> tag.
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  return `/* Clausely consent banner */\n(function () {\nvar C = ${json};\n${RUNTIME}})();\n`;
}

export function inactiveScript(reason: string): string {
  return `console.warn(${JSON.stringify(`[Clausely] Consent banner disabled: ${reason}`)});\n`;
}

/** Stable short hash of the consent categories, so visitors are re-asked when they change. */
export function configVersion(categories: string[]): string {
  let h = 5381;
  for (const ch of categories.join(",")) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
  return (h >>> 0).toString(36);
}
