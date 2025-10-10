import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Terms of Service - Study Share Educational Platform",
  description: "Study Share terms of service for students. Learn about permitted uses, academic integrity policies, user content rights, and community guidelines.",
  openGraph: {
    title: "Terms of Service - Study Share Educational Platform | Study Share - AI-Powered Test Hub",
    description: "Study Share terms of service for students. Learn about permitted uses and community guidelines.",
    url: `${siteUrl}/terms`,
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: "Terms of Service | Study Share - AI-Powered Test Hub",
    description: "Study Share terms of service for students and educational content sharing.",
  },
  alternates: {
    canonical: `${siteUrl}/terms`
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
