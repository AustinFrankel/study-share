import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Browse Study Resources by School",
  description: "Explore study resources shared by students at your school. Find class notes, study guides, and practice questions organized by university.",
  keywords: ["study resources by school", "university study materials", "college notes", "school-specific resources", "campus study guides", "university class notes"],
  openGraph: {
    title: "Browse Study Resources by School | Study Share - AI-Powered Test Hub",
    description: "Explore study resources shared by students at your school.",
    url: `${siteUrl}/schools`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Browse Study Resources by School | Study Share - AI-Powered Test Hub",
    description: "Explore study resources shared by students at your school.",
  },
  alternates: {
    canonical: `${siteUrl}/schools`
  }
};

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
