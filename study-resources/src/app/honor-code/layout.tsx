import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Academic Honor Code - Study Share Integrity Policy",
  description: "Study Share academic integrity and honor code. Learn about permitted study resource sharing, prohibited content, and maintaining academic honesty standards.",
  openGraph: {
    title: "Academic Honor Code - Study Share Integrity Policy | Study Share - AI-Powered Test Hub",
    description: "Study Share academic integrity and honor code. Learn about permitted study resource sharing and maintaining academic honesty.",
    url: `${siteUrl}/honor-code`,
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: "Academic Honor Code | Study Share - AI-Powered Test Hub",
    description: "Study Share academic integrity and honor code for student resource sharing.",
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
