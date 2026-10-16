import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <Heading level="h1" className="text-xl text-zinc-900">
          Übertragungsanfrage für Bestellung {id}
        </Heading>
        <Text className="text-zinc-600">
          Sie haben eine Anfrage zum Besitzwechsel Ihrer Bestellung ({id})
          erhalten. Wenn Sie zustimmen, können Sie die Übertragung mit dem Button
          unten bestätigen.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="text-zinc-600">
          Bei Zustimmung übernimmt der neue Inhaber alle Rechte und Pflichten,
          die mit dieser Bestellung verbunden sind.
        </Text>
        <Text className="text-zinc-600">
          Wenn Sie diese Anfrage nicht kennen oder Eigentümer bleiben möchten,
          ist keine weitere Maßnahme erforderlich.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
