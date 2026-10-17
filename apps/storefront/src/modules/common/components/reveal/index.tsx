"use client"

import { clx } from "@modules/common/components/ui"
import { CSSProperties, ElementType, useEffect, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: ElementType
}

export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={clx("wf-reveal", visible && "is-visible", className)}
      style={{ "--wf-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}