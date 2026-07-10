export function BrowseNearbyPlaceholder() {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-dashed border-[#b7c7d3] bg-white px-4 text-sm font-medium text-[#5b6b7a] shadow-sm"
    >
      <span aria-hidden>⌖</span>
      Nearby
      <span className="rounded-full bg-[#eef5f8] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#8a97a5] uppercase">
        Soon
      </span>
    </button>
  );
}
