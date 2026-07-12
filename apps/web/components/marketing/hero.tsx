export function Hero() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-28 text-center md:px-10 md:py-36">
        <h1 className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl md:text-8xl">
          AutoHub
        </h1>
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
