import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getProductImageUrls } from "@lib/util/product-images"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Werkfaden`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Werkfaden`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const sourceImages = getImagesForVariant(pricedProduct, selectedVariantId)
  const localImageUrls = getProductImageUrls(
    pricedProduct.handle,
    pricedProduct.collection?.handle
  )
  const images = localImageUrls.length
    ? localImageUrls.map((url, index) => ({
        id: `${pricedProduct.id}-local-${index}`,
        url,
      }))
    : (sourceImages ?? []).flatMap((image) =>
        image.url ? [{ id: image.id, url: image.url }] : []
      )

  const variantPrices = (pricedProduct.variants ?? [])
    .map((v) => v.calculated_price)
    .filter((p): p is NonNullable<typeof p> => !!p?.calculated_amount)
  const priceAmounts = variantPrices
    .map((p) => p.calculated_amount)
    .filter((a): a is number => typeof a === "number")
  const currency = variantPrices[0]?.currency_code?.toUpperCase() ?? "EUR"

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: pricedProduct.description || undefined,
    image: (images ?? []).map((i) => i.url).filter(Boolean),
    brand: { "@type": "Brand", name: "Werkfaden" },
    ...(priceAmounts.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: currency,
            lowPrice: Math.min(...priceAmounts) / 100,
            highPrice: Math.max(...priceAmounts) / 100,
            offerCount: priceAmounts.length,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: pricedProduct.collection?.title ?? "Kollektion",
        item: pricedProduct.collection
          ? `/collections/${pricedProduct.collection.handle}`
          : "/store",
      },
      { "@type": "ListItem", position: 3, name: pricedProduct.title },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}
