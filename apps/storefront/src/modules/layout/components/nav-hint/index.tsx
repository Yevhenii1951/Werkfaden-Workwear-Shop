type NavHintProps = {
  id: string
  children: React.ReactNode
}

/**
 * Short explanation shown under a navigation tab on hover and on keyboard
 * focus. The parent must carry the `group` class, the tab itself is linked
 * to the hint via `aria-describedby`.
 */
const NavHint = ({ id, children }: NavHintProps) => {
  return (
    <span
      id={id}
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-1 rounded-sm border border-wf-line bg-wf-surface px-3.5 py-3 text-left text-[12px] leading-[1.5] text-wf-ink-soft opacity-0 shadow-sm transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
    >
      {children}
    </span>
  )
}

export default NavHint
