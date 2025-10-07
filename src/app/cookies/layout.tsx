import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Cookie Policy - StudyShare Data & Privacy Practices",
  description: "Learn about cookies used on StudyShare for authentication, analytics, and user preferences. Manage your cookie settings and understand our data practices.",
  keywords: ["cookie policy", "browser cookies", "data tracking", "privacy settings", "cookie management", "user preferences", "analytics cookies"],
  openGraph: {
    title: "Cookie Policy - StudyShare Data & Privacy Practices",
    description: "Learn about cookies used on StudyShare for authentication, analytics, and user preferences.",
    url: `${siteUrl}/cookies`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Cookie Policy | StudyShare",
    description: "Learn about cookies used on StudyShare and manage your preferences.",
  },
  alternates: {
    canonical: `${siteUrl}/cookies`
  }
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
