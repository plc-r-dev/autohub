import Image from "next/image";
import { AutohubLogo } from "@/components/brand/autohub-logo";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-background">
      <Image
        src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1920&q=80"
        alt="Automotive service workshop with a vehicle in a lit bay"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background"
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-28 text-center duration-700 md:px-10 md:py-36">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Precision Engine Management
        </p>
        <AutohubLogo
          href={null}
          priority
          heightClassName="h-14 sm:h-16 md:h-20"
          className="mt-6 justify-center"
        />
        <p className="mt-6 text-2xl font-medium text-foreground sm:text-3xl">
          The Automotive Service Platform
        </p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Run your entire automotive service business — from booking to operations.
        </p>
      </div>
    </section>
  );
}
