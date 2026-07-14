"use client"

import { useId, useRef, useState, useActionState } from "react"
import { Upload } from "lucide-react"
import {
  FormField,
  inputClassName,
} from "@/components/onboarding/form-field"
import { ServiceStoreButton } from "@/components/service-store/ui"
import {
  type BillingActionState,
  uploadBillingPaymentSlip,
} from "@/lib/billing/actions"
import { cn } from "@workspace/ui/lib/utils"

const initialState: BillingActionState = {}

type ServiceStorePaymentSlipFormProps = {
  billingId: string
  canUpload: boolean
  formId?: string
}

export function ServiceStorePaymentSlipForm({
  billingId,
  canUpload,
  formId = "billing-payment-form",
}: ServiceStorePaymentSlipFormProps) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [state, formAction, isPending] = useActionState(
    uploadBillingPaymentSlip.bind(null, billingId),
    initialState,
  )

  if (!canUpload) {
    return (
      <p className="text-sm text-[#8a97a5]">
        Payment submission is not available for the current billing status.
      </p>
    )
  }

  return (
    <form id={formId} action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#16A34A]">{state.success}</p>
      ) : null}

      <div>
        <input
          ref={fileInputRef}
          id={inputId}
          name="slipFile"
          type="file"
          accept="image/*,application/pdf"
          required
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            setFileName(file?.name ?? null)
          }}
        />
        <button
          type="button"
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            const file = event.dataTransfer.files?.[0]
            if (!file || !fileInputRef.current) return
            const transfer = new DataTransfer()
            transfer.items.add(file)
            fileInputRef.current.files = transfer.files
            setFileName(file.name)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
            isDragging
              ? "border-[#16A34A] bg-[#16A34A]/5"
              : "border-[#d7e0e9] bg-[#f8fafc] hover:border-[#16A34A]/60 hover:bg-[#f0fdf4]",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#16A34A] shadow-sm">
            <Upload className="size-4" />
          </div>
          <p className="text-sm text-[#64748B]">
            Drag and drop your image here or{" "}
            <span className="font-semibold text-[#16A34A]">Choose Image</span>
          </p>
          {fileName ? (
            <p className="text-xs font-medium text-[#0F172A]">{fileName}</p>
          ) : (
            <p className="text-xs text-[#94A3B8]">PNG, JPG, or PDF</p>
          )}
        </button>
        {state.fieldErrors?.slipFile?.[0] ? (
          <p className="text-destructive mt-1.5 text-sm">
            {state.fieldErrors.slipFile[0]}
          </p>
        ) : null}
      </div>

      <FormField
        id="paymentDate"
        label="Payment Date"
        error={state.fieldErrors?.paymentDate?.[0]}
      >
        <input
          id="paymentDate"
          name="paymentDate"
          type="date"
          required
          className={inputClassName}
          placeholder="Select date"
        />
      </FormField>

      <FormField
        id="referenceNumber"
        label="Payment Reference (optional)"
        error={state.fieldErrors?.referenceNumber?.[0]}
      >
        <input
          id="referenceNumber"
          name="referenceNumber"
          placeholder="Transfer reference or note"
          className={inputClassName}
        />
      </FormField>

      <ServiceStoreButton type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting..." : "Submit Payment"}
      </ServiceStoreButton>
    </form>
  )
}
