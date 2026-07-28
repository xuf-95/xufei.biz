# Header Design QA

Source visual truth: `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-41c4ab02-4ccb-4f67-8fb7-fbcdf2bd8373.png`

Implementation screenshot: `.omx/state/header-openai-layout/implementation-1200.png`

Combined comparison: `.omx/state/header-openai-layout/comparison.png`

Viewport and normalization:

- Source image: 3072 × 1792 pixels. The inspected reference header reports a 1059 × 64 CSS-pixel frame with 32px horizontal padding.
- Implementation: 1200 × 300 pixels at a 1200 × 300 CSS viewport and 1× browser capture density.
- The focused comparison normalizes both visible header regions to 1200 × 64 pixels.
- State: dark theme, page at top, desktop navigation visible.

## Full-view comparison evidence

The implementation preserves the existing xufei.biz identity while matching the reference header's 64px frame, vertical centering, symmetric horizontal padding, and max-width centered-shell behavior. The page content begins below the fixed header with the matching 64px offset.

Primary interaction tested: the Search button opened the search field, and Escape closed it successfully. The current `/browse/` page produced no browser console errors during verification.

## Focused header comparison evidence

The combined comparison shows the reference and implementation header bands together. Both use the same 64px height and horizontal composition. Browser measurements confirm 32px padding from 768px upward, 24px below 768px, zero horizontal overflow from 390px through 1800px, and a centered 1536px shell at 1800px.

## Required fidelity surfaces

- Fonts and typography: existing site typography is intentionally preserved; navigation remains legible and vertically centered at every tested width.
- Spacing and layout rhythm: matches the reference's 64px height and 24px/32px responsive horizontal padding logic.
- Colors and visual tokens: existing site dark/light tokens are preserved; no reference colors were copied.
- Image quality and asset fidelity: the existing vector brand asset and component icons remain unchanged and sharp.
- Copy and content: existing navigation labels and actions remain unchanged.

## Findings

No actionable P0, P1, or P2 differences remain for the requested header spacing and responsive behavior.

## Comparison history

- Iteration 1: replaced the previous 56px header and 88px desktop inset with a 64px frame, 32px desktop/tablet padding, 24px mobile padding, and a centered wide-screen shell. Added a compact mobile state that removes secondary GitHub/RSS actions while preserving core navigation, theme, and search controls.
- Post-fix evidence: `.omx/state/header-openai-layout/comparison.png`; responsive browser measurements at 390, 600, 767, 768, 1200, 1512, and 1800 pixels.

## Follow-up polish

No blocking polish remains. A future dedicated mobile-navigation project could replace the compact inline links with a menu drawer, but that is outside this spacing-focused change.

## Responsive proportional gutters QA

Source visual truth:

- `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-828094db-a31b-40a7-9633-0a211eb36c58.png`
- `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-33a4b78a-d95c-4fb0-a544-4a513258766b.png`

Implementation screenshots:

- `.omx/state/responsive-percent-gutters/browse-1450.png`
- `.omx/state/responsive-percent-gutters/browse-1000.png`

The supplied screenshots expose the previous breakpoint jump rather than a new
pixel-perfect target. The implementation keeps the existing visual language and
replaces the discontinuous fixed-width rails with a shared proportional grid:
22% left gutter, 56% content, and 22% right gutter for every viewport above the
mobile breakpoint.

Browser measurements confirm symmetric gutters with no horizontal overflow at
1450, 1200, 1151, 1150, 1149, 1000, and 801 pixels. At the former desktop
breakpoint, the gutter changes continuously from 256.02px at 1151px to 255.80px
at 1150px and 255.58px at 1149px. The 800px mobile layout intentionally switches
to a single content column with 16px safe padding.

Required fidelity surfaces:

- Layout rhythm: proportional gutters remain balanced while the viewport changes.
- Typography and content: unchanged.
- Header and footer behavior: preserved.
- Responsive safety: no content clipping or horizontal overflow at tested widths.

No actionable P0, P1, or P2 differences remain for the requested proportional
margin behavior.

## Hover preview stability QA

Source evidence:

- `/Users/xpf/Desktop/Screen Recording 2026-07-28 at 11.17.31.mov`
- `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-0c6748cc-49af-4dd0-9a90-7cd2b38901b2.png`
- `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-3c25b77f-82df-4e8f-a3d5-3981496dcd26.png`
- `/var/folders/c7/nbdl4jdx6zq4wfvlk8ycg_qm0000gn/T/codex-clipboard-27f5118a-7891-4b60-b371-ad8c3df0a3b6.png`

Implementation screenshots:

- `.omx/state/popover-stability/browse-1450.png`
- `.omx/state/popover-stability/browse-1100.png`

The video confirms two failure modes: the preview enters the tablet grid's
article column during resize, and late responses from previously hovered links
can replace the current preview. The updated interaction only enables the
right-rail preview when the dedicated desktop rail exists (1150px and wider).
Below that width the page remains stable without an overlapping preview.

Every hover request now owns an incrementing request identifier. Results are
rendered only while they are still the latest request; closing the preview or
resizing below the desktop threshold invalidates pending work.

No P0, P1, or P2 visual differences remain for the requested preview placement
and stability behavior.

final result: passed
