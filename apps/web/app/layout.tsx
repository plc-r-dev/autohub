import { Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@workspace/ui/lib/utils";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, notoSansThai.variable, "font-sans")}
    >
      <body>
        {/*
          Emotion cache must sit at the root so useServerInsertedHTML can flush
          styles before hydration. Nested portal caches (admin/store) caused
          style-vs-div mismatches with Turbopack + Tailwind.
        */}
        <AppRouterCacheProvider
          options={{ key: "mui", enableCssLayer: true }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
