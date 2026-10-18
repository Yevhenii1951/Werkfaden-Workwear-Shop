import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import Breadcrumbs, { BreadcrumbItem } from "@modules/common/components/breadcrumbs"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: { id: string; url: string }[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Start", href: "/" },
    {
      label: product.collection?.title ?? "Kollektion",
      href: product.collection
        ? `/collections/${product.collection.handle}`
        : "/store",
    },
    { label: product.title },
  ]

  return (
    <>
      <div
        className="content-container"
        data-testid="product-container"
      >
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col gap-10 py-8 small:flex-row small:gap-12">
          <div className="w-full small:w-7/12">
            <ImageGallery images={images} />
          </div>

          <div className="flex w-full flex-col gap-10 small:sticky small:top-48 small:w-5/12 small:self-start">
            <ProductInfo product={product} />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductTabs product={product} />
          </div>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
