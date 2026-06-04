import { JSX } from "preact"

export type IconName =
  | "bike"
  | "book-open"
  | "chevron-down"
  | "dumbbell"
  | "files"
  | "folder"
  | "library"
  | "menu"
  | "moon"
  | "movies"
  | "note"
  | "search"
  | "sport"
  | "sun"
  | "talks"
  | "trophy"

type IconProps = JSX.SVGAttributes<SVGSVGElement> & {
  name: IconName
  title?: string
}

const paths: Record<IconName, JSX.Element> = {
  bike: (
    <>
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="m12 17.5-3-6 4-3 2 3h3.5M9 11.5l-3.5 6M12 17.5h6.5M13 8.5l-2-3H8" />
    </>
  ),
  "book-open": (
    <>
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22.5z" />
      <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  dumbbell: (
    <>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1m-3.5-6.5 3-3M3 3l1 1m3.5 6.5 3-3" />
      <path d="m6 8-2 2-2-2 6-6 2 2-2 2m8 10-2 2 2 2 6-6-2-2-2 2" />
    </>
  ),
  files: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v12" />
      <path d="M14 2v4h4" />
      <path d="M8 8a2 2 0 0 1 2-2h5l5 5v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" />
    </>
  ),
  folder: <path d="M3 5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  library: (
    <>
      <path d="m16 6 4 14M12 6v14M8 8v12M4 4v16" />
      <path d="M2 20h20" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  moon: <path d="M20.5 14.1A8.4 8.4 0 0 1 9.9 3.5 9 9 0 1 0 20.5 14.1" />,
  movies: (
    <>
      <path d="m16 3-2 4M8 3 6 7M2 7h20M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2" />
      <path d="m10 12 5 3-5 3z" />
    </>
  ),
  note: (
    <>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M13 2v7h7M8 13h8M8 17h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  sport: <path d="M3 12h4l2-7 4 14 2-7h6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  talks: (
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3v-7a4 4 0 0 1-1-2.6V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4z" />
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
    </>
  ),
}

export function Icon({ name, title, ...props }: IconProps) {
  return (
    <svg
      aria-hidden={title ? undefined : "true"}
      fill="none"
      focusable="false"
      role={title ? "img" : undefined}
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      {...props}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  )
}
