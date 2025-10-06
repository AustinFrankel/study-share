import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UploadProvider } from "@/contexts/UploadContext";
import { ToastProvider } from "@/components/ui/toast";
import GlobalDropzone from "@/components/GlobalDropzone";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyShare - Class-Specific Study Resources",
  description: "Share and discover study materials for your specific classes and teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const isProduction = process.env.NODE_ENV === 'production'
  const shouldLoadGA = gaId && isProduction

  return (
    <html lang="en">
      <head>
        {/* Google Analytics - only loads in production with GA ID set */}
        {shouldLoadGA && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <ToastProvider>
          <AuthProvider>
            <UploadProvider>
              <GlobalDropzone />
              <div className="page-transition">
                {children}
              </div>
              <Footer />
            </UploadProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
