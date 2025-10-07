import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Terms of Service - StudyShare Educational Platform",
  description: "StudyShare terms of service for students. Learn about permitted uses, academic integrity policies, user content rights, and community guidelines.",
  keywords: ["terms of service", "user agreement", "academic integrity", "community guidelines", "content rights", "student platform terms", "acceptable use policy"],
  openGraph: {
    title: "Terms of Service - StudyShare Educational Platform",
    description: "StudyShare terms of service for students. Learn about permitted uses, academic integrity policies, and community guidelines.",
    url: `${siteUrl}/terms`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Terms of Service | StudyShare",
    description: "StudyShare terms of service for students and educational content sharing.",
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
