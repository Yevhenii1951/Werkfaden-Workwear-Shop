import { HttpTypes } from "@medusajs/types"

type SizeGuide = {
  name_de?: string
  measurements_de?: string
  columns_de?: Array<[string, string]>
  sizes?: Array<Record<string, string>>
}

const readSizeGuide = (
  metadata: HttpTypes.StoreProduct["metadata"]
): SizeGuide | undefined => {
  const guide = metadata?.size_guide
  if (!guide || typeof guide !== "object") return undefined
  return guide as SizeGuide
}

const SizeGuide = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const guide = readSizeGuide(product.metadata)
  if (!guide?.columns_de?.length || !guide.sizes?.length) return null

  return (
    <div className="text-small-regular py-8" data-testid="size-guide">
      <p className="font-semibold mb-1">{guide.name_de}</p>
      <p className="text-ui-fg-subtle mb-4">{guide.measurements_de}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left border-collapse">
          <thead>
            <tr className="border-b border-ui-border-base">
              <th className="py-2 pr-3 font-medium text-ui-fg-base">Größe</th>
              {guide.columns_de.map(([key, label]) => (
                <th key={key} className="py-2 pr-3 font-normal text-ui-fg-subtle">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.sizes.map((row) => (
              <tr
                key={row.size}
                className="border-b border-ui-border-base last:border-0"
              >
                <td className="py-2 pr-3 font-medium">{row.size}</td>
                {guide.columns_de!.map(([key]) => (
                  <td key={key} className="py-2 pr-3 tabular-nums">
                    {row[key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SizeGuide