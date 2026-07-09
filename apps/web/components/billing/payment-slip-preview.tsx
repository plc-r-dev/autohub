type PaymentSlipPreviewProps = {
  previewUrl: string;
  fileName: string;
  mimeType: string;
};

export function PaymentSlipPreview({
  previewUrl,
  fileName,
  mimeType,
}: PaymentSlipPreviewProps) {
  if (!previewUrl) {
    return (
      <p className="text-muted-foreground text-sm">
        Slip preview unavailable. Re-upload the payment slip.
      </p>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary text-sm underline"
        >
          Open PDF slip: {fileName}
        </a>
        <iframe
          src={previewUrl}
          title={fileName}
          className="border-input h-96 w-full rounded-md border"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={previewUrl}
        target="_blank"
        rel="noreferrer"
        className="text-primary text-sm underline"
      >
        Open image slip: {fileName}
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt={fileName}
        className="border-input max-h-96 w-full rounded-md border object-contain"
      />
    </div>
  );
}
