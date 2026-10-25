"use client"

import { useState } from "react"

const OSM_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=9.489%2C51.3128%2C9.4999%2C51.3179&layer=mapnik&marker=51.31536%2C9.49445"

export default function ContactMap() {
  const [requested, setRequested] = useState(false)

  if (!requested) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 border border-ui-border-base bg-ui-bg-subtle px-6 text-center">
        <p className="text-small-regular text-ui-fg-subtle">
          Interaktive Karte von OpenStreetMap
        </p>
        <button
          type="button"
          onClick={() => setRequested(true)}
          className="wf-btn-primary"
        >
          Karte laden
        </button>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full overflow-hidden border border-ui-border-base">
      <iframe
        title="Karte von OpenStreetMap mit dem Demo-Standort in Kassel"
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
        src={OSM_EMBED_URL}
      />
    </div>
  )
}
