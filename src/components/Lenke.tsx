import type { MouseEvent, ReactNode } from 'react'
import { href, navigate, type Route } from '../lib/router'

/** An ordinary link that navigates in-app, but still opens in a new tab with Ctrl/Cmd/middle click. */
export default function Lenke({ to, className, children }: { to: Route; className?: string; children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return (
    <a href={href(to, import.meta.env.BASE_URL)} className={className} onClick={onClick}>
      {children}
    </a>
  )
}
