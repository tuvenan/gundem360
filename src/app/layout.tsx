import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/news-service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.seo;

  const title = seo?.metaTitle || `${settings.siteName} | Son Dakika, Güncel ve Tarafsız Haber Portalı`;
  const description = seo?.metaDescription || settings.siteSlogan;
  const canonical = seo?.canonicalUrl || "https://gundem360.com";

  return {
    title: {
      default: title,
      template: seo?.metaTitleTemplate || `%s | ${settings.siteName}`,
    },
    description,
    metadataBase: new URL(canonical),
    alternates: {
      canonical: "/",
    },
    verification: {
      google: seo?.googleVerification || undefined,
      yandex: seo?.yandexVerification || undefined,
      other: seo?.bingVerification ? { "msvalidate.01": [seo.bingVerification] } : undefined,
    },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      siteName: settings.siteName,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: seo?.twitterCard || "summary_large_image",
      site: seo?.twitterHandle || "@gundem360",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    robots: {
      index: seo?.robotsIndex?.includes("index") ?? true,
      follow: seo?.robotsIndex?.includes("follow") ?? true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const seo = settings.seo;
  const canonical = seo?.canonicalUrl || "https://gundem360.com";

  const schemaOrgData = {
    "@context": "https://schema.org",
    "@type": seo?.publisherType || "NewsMediaOrganization",
    "name": seo?.googleNewsName || settings.siteName,
    "url": canonical,
    "logo": {
      "@type": "ImageObject",
      "url": seo?.publisherLogo || seo?.ogImage || "https://gundem360.com/logo.png",
    },
    "publishingPrinciples": `${canonical}/kunye`,
    "inLanguage": "tr-TR",
  };

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
