import { model } from "@medusajs/framework/utils"

export enum PersonalizationRequestStatus {
  SUBMITTED = "submitted",
  REVIEWING = "reviewing",
  QUOTED = "quoted",
  REJECTED = "rejected",
  CLOSED = "closed",
}

const PersonalizationRequest = model.define("personalization_request", {
  id: model.id({ prefix: "persreq" }).primaryKey(),
  customer_id: model.text().nullable(),
  contact_name: model.text(),
  contact_email: model.text(),
  company: model.text().nullable(),
  product_id: model.text(),
  variant_id: model.text(),
  quantity: model.number(),
  comment: model.text().nullable(),
  file_id: model.text(),
  logo_format: model.text().nullable(),
  status: model
    .enum(PersonalizationRequestStatus)
    .default(PersonalizationRequestStatus.SUBMITTED),
})

export default PersonalizationRequest
