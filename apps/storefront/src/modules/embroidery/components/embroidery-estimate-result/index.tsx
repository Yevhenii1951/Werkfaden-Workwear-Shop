import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import type { EmbroideryEstimate } from "@lib/data/embroidery"
import { buildSummary, labelOf, POSITIONS } from "@modules/embroidery/lib/options"

const money = (amount: number, currencyCode: string) =>
  convertToLocale({ amount, currency_code: currencyCode })

const EmbroideryEstimateResult = ({
  estimate,
}: {
  estimate: EmbroideryEstimate
}) => {
  const summary = buildSummary(estimate)

  return (
    <div
      className="mt-8 border border-ui-border-base rounded-rounded p-6"
      data-testid="embroidery-estimate-result"
    >
      <h2 className="txt-compact-large-plus mb-3">Ihre Schätzung</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-small-regular">
        <div className="flex justify-between sm:block">
          <dt className="text-ui-fg-subtle">Position</dt>
          <dd>{labelOf(POSITIONS, estimate.position)}</dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-ui-fg-subtle">Stickerei</dt>
          <dd>{estimate.stitch_band}</dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-ui-fg-subtle">Veredelung je Stück (netto)</dt>
          <dd data-testid="embroidery-unit">
            {money(estimate.unit_surcharge, estimate.currency_code)}
          </dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-ui-fg-subtle">
            Gesamt für {estimate.quantity} Stück (netto)
          </dt>
          <dd className="font-semibold" data-testid="embroidery-total">
            {money(estimate.total, estimate.currency_code)}
          </dd>
        </div>
      </dl>

      <p
        className="mt-4 text-small-regular text-ui-fg-muted"
        data-testid="embroidery-disclaimer"
      >
        Unverbindliche Schätzung auf Basis unserer Demo-Preistabelle — keine
        Bestellung, kein Auftrag. Der Stickpreis ist im Warenkorb nicht
        enthalten; wir bestätigen den endgültigen Preis im Angebot.
      </p>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <LocalizedClientLink
          href={`/personalization?menge=${estimate.quantity}&hinweis=${encodeURIComponent(
            summary
          )}`}
          className="wf-btn-primary w-fit"
          data-testid="embroidery-cta-personalization"
        >
          Logo-Veredelung anfragen
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/angebote?hinweis=${encodeURIComponent(summary)}`}
          className="w-fit px-5 py-3 border border-ui-border-base rounded-md text-small-regular hover:bg-ui-bg-field-hover"
          data-testid="embroidery-cta-quote"
        >
          Angebot anfordern
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmbroideryEstimateResult
