import { getProductPrice } from "@lib/util/get-product-price"
import { getProductImageUrls } from "@lib/util/product-images"
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
  const localImages = getProductImageUrls(
    product.handle,
    product.collection?.handle
  )

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full focus-visible:outline-none"
      aria-label={product.title}
    >
      <div
        data-testid="product-wrapper"
        className="wf-card flex h-full min-w-0 flex-col overflow-hidden"
      >
        <Thumbnail
          thumbnail={localImages[0] ?? product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 p-4 sm:flex-row sm:justify-between sm:gap-3">
          <h3
            className="min-w-0 break-words text-[15px] font-medium leading-5 text-wf-ink decoration-wf-accent decoration-2 underline-offset-4 group-hover:underline"
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
