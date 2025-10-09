import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "Help Center & FAQ - StudyShare Study Resources Platform",
  description: "Get answers to common questions about uploading resources, earning points, view limits, and academic integrity. Support available 24/7 for student users.",
  keywords: ["help center", "FAQ", "student support", "upload help", "points system help", "view limits", "academic integrity FAQ", "troubleshooting"],
  openGraph: {
    title: "Help Center & FAQ - StudyShare Study Resources Platform",
    description: "Get answers to common questions about uploading resources, earning points, view limits, and academic integrity.",
    url: `${siteUrl}/help-center`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Help Center & FAQ | StudyShare",
    description: "Get answers to common questions about uploading resources and using StudyShare.",
  },
  alternates: {
    canonical: `${siteUrl}/help-center`
  }
};

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I upload a resource?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Go to Upload, select your school/teacher/class, add a title and description, then upload your PDFs or images. Our AI will process them automatically."
        }
      },
      {
        "@type": "Question",
        "name": "What file types are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support PDFs, images (JPG, PNG), and text documents. Files should be under 50MB."
        }
      },
      {
        "@type": "Question",
        "name": "Do I get rewarded for uploading?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You earn points and get 5 additional resource views for each upload."
        }
      },
      {
        "@type": "Question",
        "name": "Why can't I view more resources?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You have 5 free views per month. Upload resources or watch short ads to unlock more views (up to 8 total per month)."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get more views?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload a resource (+5 views) or watch an ad (+1 view, max 3 ads per month)."
        }
      },
      {
        "@type": "Question",
        "name": "When do view limits reset?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "View limits reset on the first of each month."
        }
      },
      {
        "@type": "Question",
        "name": "How do I earn points?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Earn points by uploading resources, getting upvotes, commenting, and helping classmates."
        }
      },
      {
        "@type": "Question",
        "name": "How do I report inappropriate content?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the flag icon on any resource or comment to report issues. We review all reports promptly."
        }
      },
      {
        "@type": "Question",
        "name": "What content is not allowed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No copyrighted materials, inappropriate content, or academic dishonesty. See our Honor Code for details."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we use secure encryption and never share your personal information. See our Privacy Policy."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
