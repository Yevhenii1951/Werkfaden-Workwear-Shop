import { HOME_IMAGES } from "@lib/util/home-images"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import Image from "next/image"

import SectionHeading from "@modules/home/components/section-heading"

export default function CollectionsGrid({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) {
  if (!collections.length) {
    return null
  }

  return (
    <section className="wf-container py-16 md:py-24">
      <SectionHeading
        eyebrow="Kategorien"
        title="Finden Sie die passende Ausrüstung"
        lead="Fünf Kollektionen vom Basis-T-Shirt bis zur wetterfesten Jacke — alle Modelle auf Wunsch mit Firmenlogo."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <Reveal
            key={collection.id}
            delay={index * 60}
            className={index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
          >
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-card border border-wf-line shadow-wf transition-shadow duration-200 hover:shadow-wf-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wf-accent focus-visible:ring-offset-2 focus-visible:ring-offset-wf-bone lg:aspect-[16/10]"
            >
              <Image
                src={HOME_IMAGES.collections[collection.handle ?? ""] ?? HOME_IMAGES.hero}
                alt={collection.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wf-ink/75 via-wf-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <div>
                  <span className="wf-eyebrow text-wf-bone/80">Kollektion</span>
                  <h3 className="wf-display mt-1 text-xl leading-tight text-wf-bone">
                    {collection.title}
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-circle border border-wf-bone/40 text-wf-bone transition-colors duration-200 group-hover:bg-wf-accent group-hover:border-wf-accent"
                >
                  →
                </span>
              </div>
            </LocalizedClientLink>
          </Reveal>
        ))}
      </div>
    </section>
  )
}