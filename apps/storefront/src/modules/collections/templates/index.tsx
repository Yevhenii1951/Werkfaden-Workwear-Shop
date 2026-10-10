import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { ListingFilters } from "@lib/util/listing-filters"

export default function CollectionTemplate({
  collection,
  filters,
  countryCode,
}: {
  collection: HttpTypes.StoreCollection
  filters?: ListingFilters
  countryCode: string
}) {
  const pageNumber = filters?.page ?? 1
  const sort = filters?.sortBy ?? "created_at"

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={filters?.optionValueIds}
            filters={filters}
          />
        </Suspense>
      </div>
    </div>
  )
}
