"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import SizeGuide from "@modules/products/components/size-guide"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Produktdetails",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Lieferung & Rücksendung",
      component: <ShippingInfoTab />,
    },
    {
      label: "Größentabelle",
      component: <SizeGuide product={product} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Herkunftsland</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Typ</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Gewicht</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Maße</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length} L x ${product.width} B x ${product.height} H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Lieferung (Demo)</span>
            <p className="max-w-sm">
              Versand nur innerhalb Deutschlands. Demo-Konditionen: 5,90 EUR,
              ab 100,00 EUR Warenwert kostenlos. Lieferzeit 3–5 Werktage –
              ein demonstrierter Zeitraum, der im realen Betrieb vom Händler
              bestätigt werden muss.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Umtausch (Demo)</span>
            <p className="max-w-sm">
              Demo-Rückgabeprozess über das Kontaktformular mit fiktiver
              Rücksendenummer. Es werden keine echten Waren versendet oder
              zurückgenommen.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Rückerstattung</span>
            <p className="max-w-sm">
              Dieser Shop verarbeitet keine echten Zahlungen – eine echte
              Rückerstattung findet nicht statt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs