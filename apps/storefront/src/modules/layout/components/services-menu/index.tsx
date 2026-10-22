"use client"

import { Transition } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ServiceHint from "@modules/layout/components/service-hint"
import { SERVICE_LINKS } from "@modules/layout/lib/service-links"
import { Fragment } from "react"

type ServicesMenuProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

const ServicesMenu = ({ open, onOpen, onClose }: ServicesMenuProps) => {
  return (
    <Transition
      as={Fragment}
      show={open}
      // The panel stays in the DOM so that `aria-controls` of the tab always
      // points at an existing element.
      unmount={false}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-1"
    >
      <div
        id="services-menu"
        className="absolute right-0 top-full z-50 w-80 border border-wf-line bg-wf-surface shadow-sm"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        <ul className="flex flex-col">
          {SERVICE_LINKS.map((service) => (
            <li
              key={service.href}
              className="flex items-start gap-3 border-b border-wf-line px-4 py-3.5 transition-colors last:border-b-0 hover:bg-wf-bone"
            >
              <LocalizedClientLink
                href={service.href}
                className="group min-w-0 flex-1"
                onClick={onClose}
              >
                <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-wf-ink transition-colors group-hover:text-wf-accent-strong">
                  {service.label}
                </span>
                <span className="mt-1 block text-[13px] leading-[1.5] text-wf-muted">
                  {service.description}
                </span>
              </LocalizedClientLink>
              <ServiceHint
                id={`service-hint-${service.id}`}
                name={service.label}
                hint={service.hint}
              />
            </li>
          ))}
        </ul>
      </div>
    </Transition>
  )
}

export default ServicesMenu
