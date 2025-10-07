import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Privacy Policy - StudyShare | Student Data Protection",
  description: "Learn how StudyShare protects student privacy, handles educational content, and keeps your study materials secure. Anonymous sharing, encrypted data, GDPR compliant.",
  keywords: ["privacy policy", "student data protection", "GDPR compliance", "data security", "anonymous sharing", "educational privacy", "user data protection"],
  openGraph: {
    title: "Privacy Policy - StudyShare | Student Data Protection",
    description: "Learn how StudyShare protects student privacy, handles educational content, and keeps your study materials secure.",
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Privacy Policy | StudyShare",
    description: "Learn how StudyShare protects student privacy and handles educational content securely.",
  },
  alternates: {
    canonical: `${siteUrl}/privacy`
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
