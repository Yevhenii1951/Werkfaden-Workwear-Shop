import { model } from "@medusajs/framework/utils"

export enum QuoteRequestStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  QUOTED = "quoted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CLOSED = "closed",
}

const QuoteRequest = model.define("quote_request", {
  id: model.id({ prefix: "quote" }).primaryKey(),
  customer_id: model.text().nullable(),
  access_token_hash: model.text(),
  contact_name: model.text(),
  contact_email: model.text(),
  company: model.text().nullable(),
  comment: model.text().nullable(),
  status: model
    .enum(QuoteRequestStatus)
    .default(QuoteRequestStatus.SUBMITTED),
  currency_code: model.text(),
  offered_total_minor: model.number().nullable(),
  promotion_code: model.text().nullable(),
  quoted_at: model.dateTime().nullable(),
  accepted_at: model.dateTime().nullable(),
  items: model.hasMany(() => QuoteRequestItem, { mappedBy: "quote_request" }),
})

const QuoteRequestItem = model.define("quote_request_item", {
  id: model.id({ prefix: "quoteitem" }).primaryKey(),
  quote_request: model.belongsTo(() => QuoteRequest, { mappedBy: "items" }),
  product_id: model.text(),
  variant_id: model.text(),
  title: model.text(),
  quantity: model.number(),
})

export { QuoteRequest, QuoteRequestItem }
export default QuoteRequest
