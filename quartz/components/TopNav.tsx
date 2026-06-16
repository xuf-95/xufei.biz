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
  position: sticky !important;
  top: 0 !important;
  z-index: 200 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 0.5rem !important;
  margin: 0 !important;
  padding: 0 1.5rem !important;
  height: 54px !important;
  min-height: 54px !important;
  background: var(--light) !important;
  border-bottom: 1px solid var(--lightgray) !important;
  box-shadow: 0 1px 0 var(--lightgray) !important;
  /* negative horizontal margins so it bleeds full-width within .center */
  margin-left: calc(-1 * var(--gap, 2rem)) !important;
  margin-right: calc(-1 * var(--gap, 2rem)) !important;
  padding-left: var(--gap, 2rem) !important;
  padding-right: var(--gap, 2rem) !important;
}

/* ── TopNav takes all remaining width ── */
.top-nav {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 100%;
}

/* ── Brand ── */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 1rem;
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
  gap: 2px;
  height: 100%;
  min-width: 0;
}

/* ── Shared item style ── */
.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
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
.page-header { margin-top: 0 !important; }

/* ── Mobile ── */
@media (max-width: 600px) {
  .nav-brand-name { display: none; }
  .nav-links {
    overflow-x: auto;
    scrollbar-width: none;
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
  }

  document.addEventListener("nav", initTopNav);
})();
`

export default (() => TopNav) satisfies QuartzComponentConstructor
