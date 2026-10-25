import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { adminHeaders, registerAndLoginAdmin } from "../helpers/admin-auth"
import { PERSONALIZATION_MODULE } from "../../src/modules/personalization"
import { PersonalizationRequestStatus } from "../../src/modules/personalization/models/personalization-request"
import type PersonalizationModuleService from "../../src/modules/personalization/service"

jest.setTimeout(120_000)

// 1x1 PNG: enough for the storage path, which does not inspect the raster.
const LOGO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

const STATIC_DIR = path.join(process.cwd(), "static")
const PRIVATE_DIR = path.join(process.cwd(), "private")

const exists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const created: string[] = []

    afterEach(async () => {
      await Promise.all(
        created.splice(0).map((filePath) => fs.rm(filePath, { force: true }))
      )
    })

    const upload = async (access: "public" | "private") => {
      const { result } = await uploadFilesWorkflow(getContainer()).run({
        input: {
          files: [
            {
              filename: "logo.png",
              mimeType: "image/png",
              content: LOGO_PNG.toString("base64"),
              access,
            },
          ],
        },
      })

      // The file module uses the provider key as the file id.
      const file = result[0]
      created.push(
        path.join(access === "private" ? PRIVATE_DIR : STATIC_DIR, file.id)
      )

      return file
    }

    describe("WW-019 private uploads stay private", () => {
      it("writes a private file outside the publicly served directory", async () => {
        const file = await upload("private")

        expect(file.id.startsWith("private-")).toBe(true)
        expect(await exists(path.join(PRIVATE_DIR, file.id))).toBe(true)
        expect(await exists(path.join(STATIC_DIR, file.id))).toBe(false)
      })

      it("serves public files at /static and refuses the private key there", async () => {
        const publicFile = await upload("public")
        const privateFile = await upload("private")

        // Proves the static mount is live in this process, so the 404 below is
        // a statement about the file and not about a missing route.
        const publicResponse = await api.get(`/static/${publicFile.id}`, {
          responseType: "arraybuffer",
          validateStatus: () => true,
        })
        expect(publicResponse.status).toBe(200)

        const privateResponse = await api.get(`/static/${privateFile.id}`, {
          responseType: "arraybuffer",
          validateStatus: () => true,
        })
        expect(privateResponse.status).toBe(404)
      })

      it("hands the private file out only through the authenticated admin route", async () => {
        const file = await upload("private")

        const service = getContainer().resolve<PersonalizationModuleService>(
          PERSONALIZATION_MODULE
        )
        const request = await service.createPersonalizationRequests({
          customer_id: null,
          contact_name: "Erika Musterfrau",
          contact_email: "logo@example.de",
          company: null,
          product_id: "prod_placeholder",
          variant_id: "variant_placeholder",
          quantity: 5,
          comment: null,
          file_id: file.id,
          logo_format: "png",
          status: PersonalizationRequestStatus.SUBMITTED,
        })

        const anonymous = await api.get(
          `/admin/personalization-requests/${request.id}/file`,
          { responseType: "arraybuffer", validateStatus: () => true }
        )
        expect(anonymous.status).toBe(401)

        const token = await registerAndLoginAdmin(
          { container: getContainer(), api },
          `admin-${randomUUID().slice(0, 8)}@werkfaden.test`
        )
        const authorized = await api.get(
          `/admin/personalization-requests/${request.id}/file`,
          {
            ...adminHeaders(token),
            responseType: "arraybuffer",
            validateStatus: () => true,
          }
        )

        expect(authorized.status).toBe(200)
        expect(authorized.headers["cache-control"]).toContain("no-store")
        expect(Buffer.from(authorized.data).equals(LOGO_PNG)).toBe(true)
      })
    })
  },
})
