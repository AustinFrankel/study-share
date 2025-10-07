import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Browse Study Resources by School, Subject & Teacher",
  description: "Find study resources from students at top universities. Filter by school, subject, teacher, difficulty, and resource type. Access thousands of class-specific materials.",
  keywords: ["browse study resources", "university study materials", "college notes by school", "filter class notes", "study materials by teacher", "academic resources by subject"],
  openGraph: {
    title: "Browse Study Resources by School, Subject & Teacher | StudyShare",
    description: "Find study resources from students at top universities. Filter by school, subject, teacher, difficulty, and resource type.",
    url: `${siteUrl}/browse`,
    type: 'website',
    images: [{
      url: `${siteUrl}/og-browse.png`,
      width: 1200,
      height: 630,
      alt: 'Browse Study Resources by School and Subject'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Browse Study Resources by School, Subject & Teacher | StudyShare",
    description: "Find study resources from students at top universities. Filter by school, subject, and teacher.",
    images: [`${siteUrl}/twitter-browse.png`]
  },
  alternates: {
    canonical: `${siteUrl}/browse`
  }
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
