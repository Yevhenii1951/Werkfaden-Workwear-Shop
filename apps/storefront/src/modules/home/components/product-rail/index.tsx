import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"

import SectionHeading from "@modules/home/components/section-heading"

export default function ProductRail({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  if (!products.length) {
    return null
  }

  return (
    <section className="wf-container py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Beliebt"
          title="Beliebte Artikel"
          lead="Eine Auswahl robuster Basics, die sich im Alltag bewährt haben."
        />
        <Reveal delay={80}>
          <LocalizedClientLink href="/store" className="wf-btn-secondary">
            Alle ansehen
          </LocalizedClientLink>
        </Reveal>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.id}>
            <Reveal delay={(index % 4) * 60}>
              <ProductPreview product={product} region={region} isFeatured />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}