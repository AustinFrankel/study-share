import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View your StudyShare profile, uploaded resources, points earned, and contribution statistics. Track your learning and sharing progress.",
  keywords: ["student profile", "uploaded resources", "points system", "contribution stats", "study progress"],
  openGraph: {
    title: "Your Profile | StudyShare",
    description: "View your StudyShare profile, uploaded resources, points earned, and contribution statistics.",
    url: `${siteUrl}/profile`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Your Profile | StudyShare",
    description: "View your profile, uploaded resources, and contribution statistics.",
  },
  alternates: {
    canonical: `${siteUrl}/profile`
  },
  robots: {
    index: false, // Don't index individual user profiles
    follow: true
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
