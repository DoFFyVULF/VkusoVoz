import type { Metadata, Viewport } from "next"
import { Inter, Manrope } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ToastProvider } from "@/components/ui/toast"
import { AppChrome } from "@/components/layout/app-chrome"

// next/font/google: offline/network-blocked -> warning once, automatically uses fallback stack below (non-blocking). No self-host needed.
// Alternative if permanently offline: switch to next/font/local with woff2 files.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
  preload: false,
  variable: "--font-heading",
})

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
  preload: false,
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "ВкусоВоз — доставка еды",
  description:
    "ВкусоВоз — тёплая гастрономическая доставка. Свежие блюда из локальных продуктов, быстрая доставка и забота в каждой детали.",
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="bg-background text-foreground font-body flex min-h-full flex-col overflow-x-hidden antialiased">
        <Providers>
          <ToastProvider>
            <a
              href="#main-content"
              className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only z-[100] rounded-xl px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus-visible:ring-2 focus-visible:outline-none"
            >
              Перейти к содержимому
            </a>
            <AppChrome>{children}</AppChrome>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
