"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { DEMO_COPY } from "@lib/content/demo-copy"
import {
  PRICE_MAX_QUERY_KEY,
  PRICE_MIN_QUERY_KEY,
} from "@lib/util/listing-filters"

type PriceRangeProps = {
  setParams: (updates: Record<string, string | null>) => void
  "data-testid"?: string
}

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "")

const PriceRange = ({
  setParams,
  "data-testid": dataTestId,
}: PriceRangeProps) => {
  const searchParams = useSearchParams()
  const currentMin = searchParams.get(PRICE_MIN_QUERY_KEY) ?? ""
  const currentMax = searchParams.get(PRICE_MAX_QUERY_KEY) ?? ""

  const [min, setMin] = useState(currentMin)
  const [max, setMax] = useState(currentMax)

  useEffect(() => {
    setMin(currentMin)
  }, [currentMin])

  useEffect(() => {
    setMax(currentMax)
  }, [currentMax])

  const apply = () =>
    setParams({
      [PRICE_MIN_QUERY_KEY]: min || null,
      [PRICE_MAX_QUERY_KEY]: max || null,
    })

  const reset = () => {
    setMin("")
    setMax("")
    setParams({ [PRICE_MIN_QUERY_KEY]: null, [PRICE_MAX_QUERY_KEY]: null })
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid={dataTestId}>
      <span className="flex items-center justify-between px-1 txt-compact-small-plus text-ui-fg-subtle">
        {DEMO_COPY.catalog.filterPrice}
      </span>
      <div className="flex items-center gap-x-2 pr-6">
        <input
          type="text"
          inputMode="numeric"
          value={min}
          onChange={(event) => setMin(digitsOnly(event.target.value))}
          placeholder={DEMO_COPY.catalog.priceMin}
          className="h-9 w-20 rounded-rounded border border-ui-border-base px-2 text-small-regular text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
        />
        <span className="text-ui-fg-muted">–</span>
        <input
          type="text"
          inputMode="numeric"
          value={max}
          onChange={(event) => setMax(digitsOnly(event.target.value))}
          placeholder={DEMO_COPY.catalog.priceMax}
          className="h-9 w-20 rounded-rounded border border-ui-border-base px-2 text-small-regular text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-x-4 pr-6">
        <button
          type="button"
          onClick={apply}
          className="text-small-regular text-ui-fg-base underline hover:text-ui-fg-subtle"
        >
          {DEMO_COPY.catalog.priceApply}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-small-regular text-ui-fg-muted underline hover:text-ui-fg-base"
        >
          {DEMO_COPY.catalog.priceReset}
        </button>
      </div>
    </div>
  )
}

export default PriceRange
