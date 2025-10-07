import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

// Static metadata for search page
export const metadata: Metadata = {
  title: "Search Study Resources",
  description: "Search for study materials, class notes, practice questions, and study guides. Find resources by course, topic, or keyword.",
  keywords: ["search study materials", "find class notes", "search study guides", "find practice questions", "search college notes"],
  openGraph: {
    title: "Search Study Resources | StudyShare",
    description: "Search for study materials, class notes, practice questions, and study guides.",
    url: `${siteUrl}/search`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Search Study Resources | StudyShare",
    description: "Search for study materials, class notes, and practice questions.",
  },
  alternates: {
    canonical: `${siteUrl}/search`
  }
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
