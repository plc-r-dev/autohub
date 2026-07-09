export type ListSearchParams = {
  q?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
  status?: string;
  from?: string;
  to?: string;
  branchId?: string;
  merchantId?: string;
  customerId?: string;
  vehicleId?: string;
};

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function parseListPaging(params: ListSearchParams) {
  const page = parsePositiveInt(params.page, 1);
  const pageSize = [10, 20, 50, 100].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 20;
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function parseSortOrder(value: string | undefined): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}
