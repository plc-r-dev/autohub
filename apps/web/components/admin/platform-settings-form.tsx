"use client";

import { useActionState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/onboarding/form-field";
import {
  updatePlatformSettings,
  type PlatformSettingsActionState,
} from "@/lib/platform-settings/actions";

type PlatformSettingsFormProps = {
  defaultValues: {
    bookingFee: string;
    vatRate: string;
    currency: string;
    billingDueDays: number;
    companyName: string;
    taxId: string;
    address: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    bankBranch: string;
    storageProvider: string;
    bucketName: string;
    storageRegion: string;
    timeZone: string;
    dateFormat: string;
    timeFormat: string;
  };
};

const initialState: PlatformSettingsActionState = {};

export function PlatformSettingsForm({ defaultValues }: PlatformSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformSettings,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Billing</h2>
        <FormField id="bookingFee" label="Booking fee" error={state.fieldErrors?.bookingFee?.[0]}>
          <input
            id="bookingFee"
            name="bookingFee"
            type="number"
            min={0}
            required
            defaultValue={defaultValues.bookingFee}
            className={inputClassName}
          />
        </FormField>
        <FormField id="vatRate" label="VAT rate (%)" error={state.fieldErrors?.vatRate?.[0]}>
          <input
            id="vatRate"
            name="vatRate"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            defaultValue={defaultValues.vatRate}
            className={inputClassName}
          />
        </FormField>
        <FormField id="currency" label="Currency" error={state.fieldErrors?.currency?.[0]}>
          <input
            id="currency"
            name="currency"
            required
            defaultValue={defaultValues.currency}
            className={inputClassName}
          />
        </FormField>
        <FormField
          id="billingDueDays"
          label="Billing due days"
          error={state.fieldErrors?.billingDueDays?.[0]}
        >
          <input
            id="billingDueDays"
            name="billingDueDays"
            type="number"
            min={1}
            max={365}
            required
            defaultValue={defaultValues.billingDueDays}
            className={inputClassName}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Company</h2>
        <FormField id="companyName" label="Company name" error={state.fieldErrors?.companyName?.[0]}>
          <input
            id="companyName"
            name="companyName"
            defaultValue={defaultValues.companyName}
            className={inputClassName}
          />
        </FormField>
        <FormField id="taxId" label="Tax ID" error={state.fieldErrors?.taxId?.[0]}>
          <input id="taxId" name="taxId" defaultValue={defaultValues.taxId} className={inputClassName} />
        </FormField>
        <FormField id="address" label="Address" error={state.fieldErrors?.address?.[0]}>
          <textarea
            id="address"
            name="address"
            defaultValue={defaultValues.address}
            className={textareaClassName}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Bank account</h2>
        <FormField id="bankName" label="Bank name" error={state.fieldErrors?.bankName?.[0]}>
          <input
            id="bankName"
            name="bankName"
            defaultValue={defaultValues.bankName}
            className={inputClassName}
          />
        </FormField>
        <FormField id="accountName" label="Account name" error={state.fieldErrors?.accountName?.[0]}>
          <input
            id="accountName"
            name="accountName"
            defaultValue={defaultValues.accountName}
            className={inputClassName}
          />
        </FormField>
        <FormField
          id="accountNumber"
          label="Account number"
          error={state.fieldErrors?.accountNumber?.[0]}
        >
          <input
            id="accountNumber"
            name="accountNumber"
            defaultValue={defaultValues.accountNumber}
            className={inputClassName}
          />
        </FormField>
        <FormField id="bankBranch" label="Branch" error={state.fieldErrors?.bankBranch?.[0]}>
          <input
            id="bankBranch"
            name="bankBranch"
            defaultValue={defaultValues.bankBranch}
            className={inputClassName}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Storage</h2>
        <FormField
          id="storageProvider"
          label="Storage provider"
          error={state.fieldErrors?.storageProvider?.[0]}
        >
          <select
            id="storageProvider"
            name="storageProvider"
            defaultValue={defaultValues.storageProvider}
            className={selectClassName}
          >
            <option value="local">Local</option>
            <option value="s3">Amazon S3</option>
            <option value="r2">Cloudflare R2</option>
            <option value="azure">Azure Blob</option>
            <option value="gcs">Google Cloud Storage</option>
          </select>
        </FormField>
        <FormField id="bucketName" label="Bucket name" error={state.fieldErrors?.bucketName?.[0]}>
          <input
            id="bucketName"
            name="bucketName"
            required
            defaultValue={defaultValues.bucketName}
            className={inputClassName}
          />
        </FormField>
        <FormField id="storageRegion" label="Region" error={state.fieldErrors?.storageRegion?.[0]}>
          <input
            id="storageRegion"
            name="storageRegion"
            defaultValue={defaultValues.storageRegion}
            className={inputClassName}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">System</h2>
        <FormField id="timeZone" label="Time zone" error={state.fieldErrors?.timeZone?.[0]}>
          <input
            id="timeZone"
            name="timeZone"
            required
            defaultValue={defaultValues.timeZone}
            className={inputClassName}
          />
        </FormField>
        <FormField id="dateFormat" label="Date format" error={state.fieldErrors?.dateFormat?.[0]}>
          <input
            id="dateFormat"
            name="dateFormat"
            required
            defaultValue={defaultValues.dateFormat}
            className={inputClassName}
          />
        </FormField>
        <FormField id="timeFormat" label="Time format" error={state.fieldErrors?.timeFormat?.[0]}>
          <input
            id="timeFormat"
            name="timeFormat"
            required
            defaultValue={defaultValues.timeFormat}
            className={inputClassName}
          />
        </FormField>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save platform settings"}
      </Button>
    </form>
  );
}
