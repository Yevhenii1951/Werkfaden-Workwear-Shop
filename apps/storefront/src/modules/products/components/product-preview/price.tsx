import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="block text-xs text-wf-muted line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={price.price_type === "sale" ? "text-wf-accent-strong" : undefined}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}