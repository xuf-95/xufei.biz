import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"
import { classNames } from "../util/lang"

function siteRootPrefix(cfg: GlobalConfiguration | undefined): string {
  if (!cfg?.baseUrl) return ""
  try {
    const pathname = new URL(cfg.baseUrl).pathname.replace(/\/$/, "")
    return pathname === "/" ? "" : pathname
  } catch {
    return ""
  }
}

function absSitePath(cfg: GlobalConfiguration | undefined, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${siteRootPrefix(cfg)}${p}`
}

interface MegaChild {
  label: string
  desc: string
  path: string
  abbr: string
}

interface NavItem {
  label: string
  path: string
  children?: MegaChild[]
}

const navItems: NavItem[] = [
  {
    label: "Index",
    path: "/index/",
    children: [
      { label: "Map",        desc: "Map of Content",   path: "/index/00-Map/",  abbr: "MP" },
      { label: "AI",           desc: "AI tools & agents",   path: "/index/ai/",            abbr: "AI" },
      { label: "OpenBigData",      desc: "Data engineering",    path: "/index/Open-BigData/",       abbr: "BD" },
      { label: "Posts",        desc: "Notes & writings",    path: "/index/posts/",         abbr: "P"  },
    ],
  },
  { label: "Tags",  path: "/tags/"         },
  // { label: "Map",   path: "/map/"          },
  { label: "Goods", path: "/hobby/goods/"  },
  { label: "Data Engineer Tools", path: "/tools/data-engineer-tools/" },
]

const ChevronDown = () => (
  <svg
    class="nav-chevron"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 4l4 4 4-4"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const TopNav: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const iconPath = absSitePath(cfg, "/static/icon.png")

  function isActive(path: string): boolean {
    const key = path.replace(/^\//, "").replace(/\/$/, "")
    return slug === key || slug.startsWith(`${key}/`)
  }

  return (
    <nav class={classNames(displayClass, "top-nav")} aria-label="Primary">
      {/* ── Brand ── */}
      <a href={absSitePath(cfg, "/")} class="nav-brand">
        <img src={iconPath} alt={cfg?.pageTitle ?? "home"} class="nav-brand-logo" />
        <span class="nav-brand-name">{cfg?.pageTitle ?? "xufei.biz"}</span>
      </a>

      {/* ── Links ── */}
      <div class="nav-links">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div
                class={`nav-group${isActive(item.path) ? " active" : ""}`}
                data-group={item.label.toLowerCase()}
              >
                <button class="nav-item nav-trigger" type="button" aria-expanded="false">
                  {item.label}
                  <ChevronDown />
                </button>
                <div class="nav-mega" role="region">
                  <div class="mega-grid">
                    {item.children.map((child) => (
                      <a href={absSitePath(cfg, child.path)} class="mega-row">
                        <div class="mega-icon" aria-hidden="true">
                          {child.abbr}
                        </div>
                        <div class="mega-text">
                          <span class="mega-title">{child.label}</span>
                          <span class="mega-desc">{child.desc}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <a href={absSitePath(cfg, item.path)} class="mega-footer">
                    Browse all {item.label} →
                  </a>
                </div>
              </div>
            )
          }
          return (
            <a
              href={absSitePath(cfg, item.path)}
              class={`nav-item${isActive(item.path) ? " active" : ""}`}
            >
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

TopNav.css = `
/* ════════════════════════════════════════════
   HEADER  —  full-width sticky bar
   (TopNav is flex:1; Search/Darkmode/ReaderMode
    appear as siblings on the right)
   ════════════════════════════════════════════ */
header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 200 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: clamp(0.45rem, 1.4vw, 1rem) !important;
  margin: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
  height: 56px !important;
  min-height: 56px !important;
  background: var(--light) !important;
  border-bottom: 0 !important;
  box-shadow: none !important;
  transition: transform 0.24s ease, background-color 0.18s ease !important;
  will-change: transform;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: clamp(1rem, 2vw, 2rem) !important;
  padding-right: clamp(1rem, 2vw, 2rem) !important;
}

header.header-hidden {
  transform: translateY(calc(-100% + 8px)) !important;
}

header.header-hidden:hover,
header.header-hidden:focus-within {
  transform: translateY(0) !important;
}

header > .search,
header > .darkmode,
header > .readermode {
  flex: 0 0 auto !important;
}

header > .search {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

header > .search .search-button {
  height: 34px !important;
  border-radius: 6px !important;
}

header > .darkmode,
header > .readermode {
  margin-left: 0 !important;
}

/* ── TopNav takes all remaining width ── */
.top-nav {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.75rem, 2vw, 2rem);
  height: 100%;
}

/* ── Brand ── */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 0;
  transition: opacity 0.15s ease;
}
.nav-brand:hover { opacity: 0.75; }

.nav-brand-logo {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
  display: block;
}

.nav-brand-name {
  font-family: var(--titleFont);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--dark);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

/* ── Nav links row ── */
.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(0.12rem, 0.7vw, 0.55rem);
  height: 100%;
  min-width: 0;
  margin-left: auto;
}

/* ── Shared item style ── */
.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px clamp(8px, 1vw, 12px);
  border-radius: 6px;
  font-family: var(--titleFont);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gray);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s ease, background 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  height: 32px;
}
.nav-item:hover,
.nav-group.open > .nav-item  { color: var(--dark); background: var(--highlight); }
.nav-item.active,
.nav-group.active > .nav-item { color: var(--dark); font-weight: 600; }

/* ── Chevron ── */
.nav-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.nav-group.open > .nav-trigger .nav-chevron {
  transform: rotate(180deg);
}

/* ── Group wrapper (trigger + dropdown) ── */
.nav-group {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

/* ── Mega dropdown panel ── */
.nav-mega {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  width: 400px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 300;
}
.nav-group.open .nav-mega {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

html[saved-theme="dark"] .nav-mega {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.50), 0 2px 8px rgba(0, 0, 0, 0.30);
  border-color: rgba(255, 255, 255, 0.10);
}

/* ── Mega grid ── */
.mega-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

/* ── Mega row (each item) ── */
.mega-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s ease;
}
.mega-row:hover { background: var(--highlight); }

.mega-icon {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: var(--lightgray);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--codeFont);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--darkgray);
  flex-shrink: 0;
  letter-spacing: 0;
}

.mega-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mega-title {
  font-family: var(--titleFont);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--dark);
  white-space: nowrap;
}

.mega-desc {
  font-size: 0.72rem;
  color: var(--gray);
  white-space: nowrap;
}

/* ── "Browse all" footer ── */
.mega-footer {
  display: block;
  margin-top: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--lightgray);
  font-size: 0.75rem;
  color: var(--gray);
  text-decoration: none;
  border-radius: 0 0 6px 6px;
  transition: color 0.15s ease;
}
.mega-footer:hover { color: var(--dark); }

/* ── Make the in-flow page header gap sensible ── */
.page-header {
  margin-top: 0 !important;
  padding-top: 56px !important;
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .nav-brand-name { display: none; }
  .nav-links {
    overflow-x: auto;
    scrollbar-width: none;
    justify-content: flex-start;
  }
  .nav-links::-webkit-scrollbar { display: none; }
  .nav-item { padding: 5px 9px; font-size: 0.76rem; }
  .nav-mega { width: 320px; }
  .mega-grid { grid-template-columns: 1fr; }
}
`

TopNav.afterDOMLoaded = `
(function () {
  function initTopNav() {
    var header = document.querySelector("header");

    // ── close all groups ──
    function closeAll() {
      document.querySelectorAll(".nav-group.open").forEach(function (g) {
        g.classList.remove("open");
        var btn = g.querySelector(".nav-trigger");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    // ── toggle a group ──
    document.querySelectorAll(".nav-group").forEach(function (group) {
      var trigger = group.querySelector(".nav-trigger");
      if (!trigger) return;

      var handler = function (e) {
        e.stopPropagation();
        var isOpen = group.classList.contains("open");
        closeAll();
        if (!isOpen) {
          group.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
        }
      };
      trigger.addEventListener("click", handler);
      window.addCleanup(function () { trigger.removeEventListener("click", handler); });
    });

    // ── close on outside click / nav event ──
    var docHandler = function () { closeAll(); };
    document.addEventListener("click", docHandler);
    window.addCleanup(function () { document.removeEventListener("click", docHandler); });

    if (header) {
      var lastY = window.scrollY || 0;
      var ticking = false;

      function thresholdY() {
        var content = document.querySelector("article.popover-hint") || document.querySelector("article");
        if (!content) return header.offsetHeight * 2;
        return Math.max(0, content.getBoundingClientRect().top + window.scrollY - header.offsetHeight);
      }

      function hasOpenOverlay() {
        return Boolean(
          document.querySelector(".nav-group.open") ||
          document.querySelector(".search-container.active") ||
          header.matches(":hover") ||
          header.matches(":focus-within"),
        );
      }

      function updateHeader() {
        ticking = false;
        var currentY = window.scrollY || 0;
        var delta = currentY - lastY;
        var beyondContentTop = currentY >= thresholdY();

        if (currentY <= 4 || delta < -4 || hasOpenOverlay()) {
          header.classList.remove("header-hidden");
        } else if (delta > 4 && beyondContentTop) {
          header.classList.add("header-hidden");
        }

        lastY = currentY;
      }

      function requestHeaderUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      }

      function revealNearTop(event) {
        if (event.clientY <= 12) {
          header.classList.remove("header-hidden");
        }
      }

      header.classList.remove("header-hidden");
      window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
      window.addEventListener("resize", requestHeaderUpdate);
      document.addEventListener("mousemove", revealNearTop);
      header.addEventListener("mouseenter", requestHeaderUpdate);
      header.addEventListener("mouseleave", requestHeaderUpdate);
      window.addCleanup(function () {
        window.removeEventListener("scroll", requestHeaderUpdate);
        window.removeEventListener("resize", requestHeaderUpdate);
        document.removeEventListener("mousemove", revealNearTop);
        header.removeEventListener("mouseenter", requestHeaderUpdate);
        header.removeEventListener("mouseleave", requestHeaderUpdate);
        header.classList.remove("header-hidden");
      });
    }
  }

  document.addEventListener("nav", initTopNav);
})();
`

export default (() => TopNav) satisfies QuartzComponentConstructor
