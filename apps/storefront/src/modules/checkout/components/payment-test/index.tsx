import { Badge } from "@modules/common/components/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">Achtung:</span> Nur zu Testzwecken.
    </Badge>
  )
}

export default PaymentTest
