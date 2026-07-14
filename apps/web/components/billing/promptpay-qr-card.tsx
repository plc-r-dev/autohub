"use client"

import { useEffect, useState } from "react"
import { QrCode } from "lucide-react"
import { ServiceStoreCard } from "@/components/service-store/ui"

export type PromptPayQrCardProps = {
  payload: string | null
  amountLabel: string
  accountName?: string
  bankName?: string
  targetLabel?: string
}

export function PromptPayQrCard({
  payload,
  amountLabel,
  accountName,
  bankName,
  targetLabel,
}: PromptPayQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!payload) {
      setQrDataUrl(null)
      return
    }

    let cancelled = false

    void import("qrcode").then((QRCode) =>
      QRCode.toDataURL(payload, {
        width: 220,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      }),
    )

    return () => {
      cancelled = true
    }
  }, [payload])

  return (
    <ServiceStoreCard className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16A34A]">
          <QrCode className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">PromptPay</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Scan to pay {amountLabel}
          </p>
        </div>
      </div>

      {payload && qrDataUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-[#e8eef4] bg-white p-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="PromptPay QR code"
              className="size-[200px]"
            />
          </div>
          <dl className="w-full space-y-1.5 text-sm">
            {accountName ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[#64748B]">Account</dt>
                <dd className="text-right font-medium text-[#0F172A]">
                  {accountName}
                </dd>
              </div>
            ) : null}
            {bankName ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[#64748B]">Bank</dt>
                <dd className="text-right font-medium text-[#0F172A]">
                  {bankName}
                </dd>
              </div>
            ) : null}
            {targetLabel ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[#64748B]">PromptPay ID</dt>
                <dd className="text-right font-medium text-[#0F172A]">
                  {targetLabel}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-[#eef3f7] pt-2">
              <dt className="text-[#64748B]">Amount</dt>
              <dd className="text-right font-semibold text-[#16A34A]">
                {amountLabel}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="rounded-xl bg-[#f8fafc] px-3 py-4 text-center text-sm text-[#64748B]">
          PromptPay is not configured yet. Please transfer using the account
          details provided by AutoHub admin.
        </p>
      )}
    </ServiceStoreCard>
  )
}
