import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View your Study Share profile, uploaded resources, points earned, and contribution statistics. Track your learning and sharing progress.",
  openGraph: {
    title: "Your Profile | Study Share - AI-Powered Test Hub",
    description: "View your Study Share profile, uploaded resources, points earned, and contribution statistics.",
    url: `${siteUrl}/profile`,
    type: 'profile'
  },
  twitter: {
    card: 'summary',
    title: "Your Profile | Study Share - AI-Powered Test Hub",
    description: "View your Study Share profile, uploaded resources, points earned, and contribution statistics.",
  },
  alternates: {
    canonical: `${siteUrl}/profile`
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
