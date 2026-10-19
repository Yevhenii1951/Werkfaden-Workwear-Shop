"use client"

import { useActionState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import EmbroideryEstimateResult from "@modules/embroidery/components/embroidery-estimate-result"
import { GARMENTS, POSITIONS, STITCH_OPTIONS } from "@modules/embroidery/lib/options"
import {
  estimateEmbroiderySurcharge,
  type EmbroideryEstimateState,
} from "@lib/data/embroidery"

const fieldClass =
  "block w-full h-11 px-4 bg-ui-bg-field border rounded-md border-ui-border-base hover:bg-ui-bg-field-hover"

const EmbroideryEstimator = () => {
  const [state, formAction] = useActionState<EmbroideryEstimateState, FormData>(
    estimateEmbroiderySurcharge,
    null
  )

  return (
    <div className="max-w-2xl" data-testid="embroidery-estimator">
      <form action={formAction} className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <label className="txt-compact-medium-plus" htmlFor="emb-garment">
            Kleidungsstück
          </label>
          <select
            id="emb-garment"
            name="garment"
            required
            defaultValue="tshirt"
            className={fieldClass}
            data-testid="embroidery-garment-select"
          >
            {GARMENTS.map((garment) => (
              <option key={garment.value} value={garment.value}>
                {garment.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="txt-compact-medium-plus" htmlFor="emb-position">
            Position
          </label>
          <select
            id="emb-position"
            name="position"
            required
            defaultValue="chest"
            className={fieldClass}
            data-testid="embroidery-position-select"
          >
            {POSITIONS.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="txt-compact-medium-plus" htmlFor="emb-stitch">
            Größe der Stickerei
          </label>
          <select
            id="emb-stitch"
            name="stitch_count"
            required
            defaultValue={6000}
            className={fieldClass}
            data-testid="embroidery-stitch-select"
          >
            {STITCH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Menge"
          name="quantity"
          type="number"
          min={1}
          max={100000}
          defaultValue={25}
          required
          data-testid="embroidery-quantity-input"
        />

        {state?.state === "error" && (
          <ErrorMessage error={state.error} data-testid="embroidery-error" />
        )}

        <SubmitButton className="w-fit" data-testid="embroidery-submit">
          Schätzung berechnen
        </SubmitButton>
      </form>

      {state?.state === "success" && (
        <EmbroideryEstimateResult estimate={state.estimate} />
      )}
    </div>
  )
}

export default EmbroideryEstimator
