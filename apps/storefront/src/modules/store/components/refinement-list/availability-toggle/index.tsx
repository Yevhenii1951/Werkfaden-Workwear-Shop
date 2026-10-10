"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { DEMO_COPY } from "@lib/content/demo-copy"
import { IN_STOCK_QUERY_KEY } from "@lib/util/listing-filters"

type AvailabilityToggleProps = {
  setParams: (updates: Record<string, string | null>) => void
}

const AvailabilityToggle = ({ setParams }: AvailabilityToggleProps) => {
  const searchParams = useSearchParams()
  const isChecked = searchParams.get(IN_STOCK_QUERY_KEY) === "1"
  const [checked, setChecked] = useState(isChecked)

  useEffect(() => {
    setChecked(isChecked)
  }, [isChecked])

  const toggle = (next: boolean) => {
    setChecked(next)
    setParams({ [IN_STOCK_QUERY_KEY]: next ? "1" : null })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="flex items-center justify-between px-1 txt-compact-small-plus text-ui-fg-subtle">
        {DEMO_COPY.catalog.filterAvailability}
      </span>
      <label className="flex cursor-pointer items-center gap-x-2 pr-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => toggle(event.target.checked)}
          className="h-4 w-4 rounded border-ui-border-base accent-ui-fg-base"
        />
        <span className="text-small-regular text-ui-fg-base">
          {DEMO_COPY.catalog.availabilityOnly}
        </span>
      </label>
    </div>
  )
}

export default AvailabilityToggle
