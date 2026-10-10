"use client"

import { DEMO_COPY } from "@lib/content/demo-copy"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
    label: DEMO_COPY.catalog.sortCreatedAt,
  },
  {
    value: "price_asc",
    label: DEMO_COPY.catalog.sortPriceAsc,
  },
  {
    value: "price_desc",
    label: DEMO_COPY.catalog.sortPriceDesc,
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  return (
    <FilterRadioGroup
      title={DEMO_COPY.catalog.sortBy}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
