import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import Benefits from "@modules/home/components/benefits"
import CollectionsGrid from "@modules/home/components/collections-grid"
import CtaBand from "@modules/home/components/cta-band"
import Hero from "@modules/home/components/hero"
import PersonalizationBand from "@modules/home/components/personalization-band"
import ProcessSteps from "@modules/home/components/process-steps"
import ProductRail from "@modules/home/components/product-rail"
import StatsStrip from "@modules/home/components/stats-strip"

export const metadata: Metadata = {
  title: "Werkfaden – Arbeitskleidung",
  description:
    "Arbeitskleidung für Werkstatt, Baustelle und Team. Robust, pflegeleicht und auf Wunsch mit Logo veredelt. Demo-Shop ohne echte Bestellungen oder Zahlungen.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 8 },
  })

  return (
    <>
      <Hero />
      <StatsStrip />
      {collections && collections.length > 0 && (
        <CollectionsGrid collections={collections} />
      )}
      <ProductRail products={products} region={region} />
      <ProcessSteps />
      <Benefits />
      <PersonalizationBand />
      <CtaBand />
    </>
  )
}