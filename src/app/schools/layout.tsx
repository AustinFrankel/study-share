import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Browse Study Resources by School | University & College Materials",
  description: "Find study resources from students at top universities and colleges. Access class-specific notes, guides, and practice materials organized by school.",
  keywords: ["study resources by school", "university study materials", "college notes", "school-specific resources", "campus study guides", "university class notes"],
  openGraph: {
    title: "Browse Study Resources by School | University & College Materials",
    description: "Find study resources from students at top universities and colleges. Access class-specific notes and guides.",
    url: `${siteUrl}/schools`,
    type: 'website',
    images: [{
      url: `${siteUrl}/og-schools.png`,
      width: 1200,
      height: 630,
      alt: 'Browse Study Resources by University and College'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Browse Study Resources by School | StudyShare",
    description: "Find study resources from students at top universities and colleges.",
    images: [`${siteUrl}/twitter-schools.png`]
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
