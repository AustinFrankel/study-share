import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Community Guidelines - StudyShare Academic Resource Sharing",
  description: "StudyShare community rules for quality content, respectful interaction, copyright compliance, and reporting violations. Keep our study platform safe.",
  keywords: ["community guidelines", "content rules", "respectful interaction", "copyright compliance", "community standards", "reporting violations", "platform rules"],
  openGraph: {
    title: "Community Guidelines - StudyShare Academic Resource Sharing",
    description: "StudyShare community rules for quality content, respectful interaction, and copyright compliance.",
    url: `${siteUrl}/guidelines`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Community Guidelines | StudyShare",
    description: "StudyShare community rules for quality content and respectful interaction.",
  },
  alternates: {
    canonical: `${siteUrl}/guidelines`
  }
};

export default function GuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
