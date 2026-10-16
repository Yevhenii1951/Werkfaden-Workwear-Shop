import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import MailSinkNotificationService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [MailSinkNotificationService],
})
