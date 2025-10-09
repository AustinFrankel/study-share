import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Academic Honor Code - StudyShare Integrity Policy",
  description: "StudyShare academic integrity and honor code. Learn about permitted study resource sharing, prohibited content, and maintaining academic honesty standards.",
  keywords: ["academic honor code", "academic integrity", "honesty policy", "permitted sharing", "prohibited content", "ethical study practices", "cheating prevention"],
  openGraph: {
    title: "Academic Honor Code - StudyShare Integrity Policy",
    description: "StudyShare academic integrity and honor code. Learn about permitted study resource sharing and maintaining academic honesty.",
    url: `${siteUrl}/honor-code`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Academic Honor Code | StudyShare",
    description: "StudyShare academic integrity and honor code for student resource sharing.",
  },
  alternates: {
    canonical: `${siteUrl}/honor-code`
  }
};

export default function HonorCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
