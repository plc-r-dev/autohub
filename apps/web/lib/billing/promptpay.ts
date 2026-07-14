/**
 * Builds a Thai PromptPay EMVCo QR payload (Bot format).
 * Target: mobile (0XXXXXXXXX) or 13-digit tax/national ID.
 */
export function buildPromptPayPayload(
  target: string,
  amount?: number,
): string | null {
  const cleaned = target.replace(/[^0-9]/g, "")
  if (!cleaned) return null

  let idType: string
  let idValue: string

  if (cleaned.length >= 13) {
    idType = "02" // National ID / Tax ID
    idValue = cleaned.slice(0, 13)
  } else if (cleaned.length >= 9 && cleaned.length <= 10) {
    idType = "01" // Mobile
    const phone = cleaned.length === 10 && cleaned.startsWith("0")
      ? cleaned.slice(1)
      : cleaned
    idValue = `0066${phone}`
  } else {
    return null
  }

  const merchantAccount = tag(
    "29",
    tag("00", "A000000677010111") + tag(idType, idValue),
  )

  const amountTag =
    amount != null && amount > 0
      ? tag("54", amount.toFixed(2))
      : ""

  const payload =
    tag("00", "01") +
    tag("01", amount != null && amount > 0 ? "12" : "11") +
    merchantAccount +
    tag("53", "764") +
    amountTag +
    tag("58", "TH")

  const withCrcPlaceholder = payload + "6304"
  const crc = crc16Ccitt(withCrcPlaceholder)
  return withCrcPlaceholder + crc
}

function tag(id: string, value: string): string {
  const length = String(value.length).padStart(2, "0")
  return `${id}${length}${value}`
}

function crc16Ccitt(data: string): string {
  let crc = 0xffff
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function resolvePromptPayTarget(input: {
  taxId?: string | null
  accountNumber?: string | null
}): string | null {
  const taxId = input.taxId?.replace(/[^0-9]/g, "") ?? ""
  if (taxId.length === 13) return taxId

  const account = input.accountNumber?.replace(/[^0-9]/g, "") ?? ""
  if (account.length >= 9 && account.length <= 13) return account

  return null
}
