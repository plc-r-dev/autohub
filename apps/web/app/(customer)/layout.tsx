import { LiffCustomerLayout } from "@/components/liff/liff-customer-layout";

export default function CustomerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiffCustomerLayout>{children}</LiffCustomerLayout>;
}
