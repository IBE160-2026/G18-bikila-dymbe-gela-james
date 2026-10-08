import type { MouseEvent, ReactNode } from 'react'
import { href, navigate, reachedInApp, type Route } from '../lib/router'

type Props = {
  to: Route
  className?: string
  current?: boolean
  /** Go back in history when the page was reached in-app (so map or list is kept); else go to `to`. */
  tilbake?: boolean
  children: ReactNode
}

/** An ordinary link that navigates in-app, but still opens in a new tab with Ctrl/Cmd/middle click. */
export default function Lenke({ to, className, current, tilbake, children }: Props) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (tilbake && reachedInApp()) window.history.back()
    else navigate(to)
  }
  return (
    <a
      href={href(to, import.meta.env.BASE_URL)}
      className={className}
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  )
}
