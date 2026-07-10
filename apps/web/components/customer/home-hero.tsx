type HomeHeroProps = {
  displayName: string;
};

export function HomeHero({ displayName }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-white px-6 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.05)] md:px-12 md:py-14">
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-[#ECFDF5] blur-3xl" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-[#F0FDFA] blur-2xl" />
      <div className="relative max-w-2xl">
        <p className="text-[14px] font-medium text-[#0F9B76]">Welcome back</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[44px] md:leading-[1.1]">
          Hello, {displayName}
        </h1>
        <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-[#64748B] md:text-[18px]">
          Book service in under 30 seconds. Wash, detail, coat — trusted merchants near you.
        </p>
      </div>
    </section>
  );
}
