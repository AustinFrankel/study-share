import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q || '';

  if (query) {
    return {
      title: `Search Results for '${query}'`,
      description: `Find study resources for ${query}. Browse notes, guides, and practice materials shared by students.`,
      openGraph: {
        title: `Search Results for '${query}' | StudyShare`,
        description: `Find study resources for ${query}. Browse notes, guides, and practice materials.`,
        url: `${siteUrl}/search?q=${encodeURIComponent(query)}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `Search Results for '${query}' | StudyShare`,
        description: `Find study resources for ${query}. Browse notes, guides, and practice materials.`,
      },
      alternates: {
        canonical: `${siteUrl}/search?q=${encodeURIComponent(query)}`
      }
    };
  }

  return {
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
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
