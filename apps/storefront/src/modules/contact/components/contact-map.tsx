const OSM_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=9.489%2C51.3128%2C9.4999%2C51.3179&layer=mapnik&marker=51.31536%2C9.49445"

export default function ContactMap() {
  return (
    <div className="w-full h-[400px] overflow-hidden border border-ui-border-base">
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
