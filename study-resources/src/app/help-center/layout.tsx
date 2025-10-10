import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Help Center & FAQ - Study Share Study Resources Platform",
  description: "Get answers to common questions about uploading resources and using Study Share.",
  openGraph: {
    title: "Help Center & FAQ - Study Share Study Resources Platform | Study Share - AI-Powered Test Hub",
    description: "Get answers to common questions about uploading resources and using Study Share.",
    url: `${siteUrl}/help-center`,
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: "Help Center & FAQ | Study Share - AI-Powered Test Hub",
    description: "Get answers to common questions about uploading resources and using Study Share.",
  },
  alternates: {
    canonical: `${siteUrl}/help-center`
  }
};

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
