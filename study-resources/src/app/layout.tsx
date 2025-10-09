import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UploadProvider } from "@/contexts/UploadContext";
import { ToastProvider } from "@/components/ui/toast";
import GlobalDropzone from "@/components/GlobalDropzone";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app'),
  title: {
    default: "StudyShare - Student Study Resources, Class Notes & Practice Questions",
    template: "%s | StudyShare"
  },
  description: "Access student-shared study materials, class notes, and AI-generated practice questions for your courses. Join thousands of students sharing resources.",
  keywords: ["study resources", "class notes", "study guides", "practice questions", "student materials", "exam prep", "academic resources", "AI practice questions", "college notes", "university study materials"],
  authors: [{ name: "StudyShare" }],
  creator: "StudyShare",
  publisher: "StudyShare",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'StudyShare',
    title: 'StudyShare - Student Study Resources & Class Notes',
    description: 'Share and discover study materials for your classes. Get AI-powered practice questions and connect with students in your courses.',
    images: [{
      url: '/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'StudyShare - Collaborative Student Study Platform',
      type: 'image/svg+xml'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyShare - Student Study Resources',
    description: 'Share and discover study materials for your classes',
    images: ['/twitter-image.svg'],
    creator: '@studyshare'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: '/'
  }
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
        {/* Organization Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "StudyShare",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://studyshare.app",
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://studyshare.app"}/logo.png`,
              "description": "Collaborative platform for students to share and discover study materials, class notes, and practice questions.",
              "sameAs": [
                "https://twitter.com/studyshare",
                "https://instagram.com/studyshare"
              ]
            })
          }}
        />
        {/* Suppress Supabase refresh token errors in console */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Intercept console.error to suppress specific Supabase errors
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const errorMessage = args[0]?.toString() || '';
                  // Suppress "Invalid Refresh Token" errors
                  if (errorMessage.includes('Invalid Refresh Token') || 
                      errorMessage.includes('Refresh Token Not Found')) {
                    return; // Don't log these errors
                  }
                  // Log all other errors normally
                  originalError.apply(console, args);
                };
              })();
            `,
          }}
        />
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-50 via-white to-purple-50`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <UploadProvider>
                <GlobalDropzone />
                <PageTransition>
                  <div id="main-content">
                    {children}
                  </div>
                </PageTransition>
                <Footer />
              </UploadProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
