import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "/merchant/login", label: "Merchant Portal" },
  { href: "#", label: "Contact Support" },
] as const;

export function CustomerFooter() {
  return (
    <footer className="mt-16 border-t border-[#E8E8E8] bg-[#F0F0F0]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Link
            href="/browse"
            className="font-serif text-[22px] font-semibold tracking-tight text-[#0A0A0A]"
          >
            AutoHub
          </Link>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#64748B]">
            © {new Date().getFullYear()} AutoHub. Engineering Excellence in Every Service.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#0A0A0A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
