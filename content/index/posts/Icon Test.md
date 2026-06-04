---
title: Icon Test
date: 2026-06-04
tags:
  - quartz
  - test
  - icons
publish: true
description: Manual visual regression page for the shared Quartz Icon component.
---

This page is used to verify the shared `Icon.tsx` component across light and dark themes.

Expected behavior:

- every icon uses a `24 × 24` view box, `currentColor`, rounded line caps, and a `2px` stroke
- icons remain centered and readable at small, default, and large sizes
- icon color follows the surrounding text color
- Search, theme toggle, reader mode, menu, and chevron icons match the icons used by the site UI

## Digital Garden Icons

<div class="icon-test-grid">
  <figure class="icon-test-card">
    <svg aria-label="Search" role="img" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
    <figcaption><code>search</code><span>Search</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Note" role="img" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M13 2v7h7M8 13h8M8 17h5"></path></svg>
    <figcaption><code>note</code><span>Note</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Talks" role="img" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3v-7a4 4 0 0 1-1-2.6V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4z"></path></svg>
    <figcaption><code>talks</code><span>Talks</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Library" role="img" viewBox="0 0 24 24"><path d="m16 6 4 14M12 6v14M8 8v12M4 4v16"></path><path d="M2 20h20"></path></svg>
    <figcaption><code>library</code><span>Library</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Movies" role="img" viewBox="0 0 24 24"><path d="m16 3-2 4M8 3 6 7M2 7h20M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2"></path><path d="m10 12 5 3-5 3z"></path></svg>
    <figcaption><code>movies</code><span>Movies</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Files" role="img" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v12"></path><path d="M14 2v4h4"></path><path d="M8 8a2 2 0 0 1 2-2h5l5 5v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z"></path></svg>
    <figcaption><code>files</code><span>Files</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Folder" role="img" viewBox="0 0 24 24"><path d="M3 5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
    <figcaption><code>folder</code><span>Folder</span></figcaption>
  </figure>
</div>

## Sports Icons

<div class="icon-test-grid">
  <figure class="icon-test-card">
    <svg aria-label="Sport" role="img" viewBox="0 0 24 24"><path d="M3 12h4l2-7 4 14 2-7h6"></path></svg>
    <figcaption><code>sport</code><span>Activity</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Bike" role="img" viewBox="0 0 24 24"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="m12 17.5-3-6 4-3 2 3h3.5M9 11.5l-3.5 6M12 17.5h6.5M13 8.5l-2-3H8"></path></svg>
    <figcaption><code>bike</code><span>Bike</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Dumbbell" role="img" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1m-3.5-6.5 3-3M3 3l1 1m3.5 6.5 3-3"></path><path d="m6 8-2 2-2-2 6-6 2 2-2 2m8 10-2 2 2 2 6-6-2-2-2 2"></path></svg>
    <figcaption><code>dumbbell</code><span>Dumbbell</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Trophy" role="img" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"></path><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"></path></svg>
    <figcaption><code>trophy</code><span>Trophy</span></figcaption>
  </figure>
</div>

## Interface Icons

<div class="icon-test-grid">
  <figure class="icon-test-card">
    <svg aria-label="Book open" role="img" viewBox="0 0 24 24"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22.5z"></path><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5a2.5 2.5 0 0 1 2.5 2.5z"></path></svg>
    <figcaption><code>book-open</code><span>Reader mode</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Menu" role="img" viewBox="0 0 24 24"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>
    <figcaption><code>menu</code><span>Menu</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Chevron down" role="img" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>
    <figcaption><code>chevron-down</code><span>Disclosure</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Sun" role="img" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
    <figcaption><code>sun</code><span>Light theme</span></figcaption>
  </figure>
  <figure class="icon-test-card">
    <svg aria-label="Moon" role="img" viewBox="0 0 24 24"><path d="M20.5 14.1A8.4 8.4 0 0 1 9.9 3.5 9 9 0 1 0 20.5 14.1"></path></svg>
    <figcaption><code>moon</code><span>Dark theme</span></figcaption>
  </figure>
</div>

## Size And Color Checks

<div class="icon-test-sizes">
  <div><svg class="icon-test-small" aria-label="Small search" role="img" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><code>16px</code></div>
  <div><svg aria-label="Default search" role="img" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><code>24px</code></div>
  <div><svg class="icon-test-large" aria-label="Large search" role="img" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><code>40px</code></div>
  <div class="icon-test-accent"><svg aria-label="Accent search" role="img" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><code>currentColor</code></div>
</div>

## Component Usage

```tsx
import { Icon } from "./quartz/components"

<Icon name="library" />
<Icon name="sport" title="Sport" class="nav-icon" />
```
