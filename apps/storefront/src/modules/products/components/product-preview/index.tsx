import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full focus-visible:outline-none"
      aria-label={product.title}
    >
      <div
        data-testid="product-wrapper"
        className="wf-card flex h-full flex-col overflow-hidden"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-1 items-start justify-between gap-3 p-4">
          <h3
            className="text-sm font-medium leading-5 text-wf-ink"
            data-testid="product-title"
          >
            {product.title}
          </h3>
          {cheapestPrice && (
            <div className="shrink-0 font-mono text-sm text-wf-ink">
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}