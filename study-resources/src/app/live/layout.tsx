import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app';

export const metadata: Metadata = {
  title: "SAT, ACT & AP Exam Countdown Timer | Test Date Tracker 2025",
  description: "Track SAT, ACT, PSAT, and AP exam dates with live countdowns. Join waitlists for practice materials and get notified when test resources are available.",
  keywords: ["SAT countdown", "ACT test dates", "AP exam dates", "PSAT countdown", "exam timer", "test date tracker", "standardized test calendar", "SAT practice", "ACT prep", "AP exam prep"],
  openGraph: {
    title: "SAT, ACT & AP Exam Countdown Timer | Test Date Tracker 2025",
    description: "Track SAT, ACT, PSAT, and AP exam dates with live countdowns. Join waitlists for practice materials.",
    url: `${siteUrl}/live`,
    type: 'website',
    images: [{
      url: `${siteUrl}/og-live.png`,
      width: 1200,
      height: 630,
      alt: 'Live Countdown Timers for SAT, ACT, and AP Exams'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: "SAT, ACT & AP Exam Countdown Timer | StudyShare",
    description: "Track SAT, ACT, PSAT, and AP exam dates with live countdowns.",
    images: [`${siteUrl}/twitter-live.png`]
  },
  alternates: {
    canonical: `${siteUrl}/live`
  }
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Event Schema for major standardized tests
  const eventListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "2025 Standardized Test Dates",
    "description": "Complete schedule of SAT, ACT, PSAT, and AP exam dates for 2025",
    "itemListElement": [
      {
        "@type": "Event",
        "name": "SAT - March 2025",
        "startDate": "2025-03-08T08:00:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "organizer": {
          "@type": "Organization",
          "name": "College Board",
          "url": "https://www.collegeboard.org"
        },
        "description": "SAT Reasoning Test for college admissions"
      },
      {
        "@type": "Event",
        "name": "ACT - February 2025",
        "startDate": "2025-02-08T08:00:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "organizer": {
          "@type": "Organization",
          "name": "ACT",
          "url": "https://www.act.org"
        },
        "description": "ACT standardized test for college admissions"
      },
      {
        "@type": "Event",
        "name": "PSAT/NMSQT - October 2025",
        "startDate": "2025-10-15T08:00:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "organizer": {
          "@type": "Organization",
          "name": "College Board",
          "url": "https://www.collegeboard.org"
        },
        "description": "PSAT preliminary exam for college admissions and National Merit Scholarship"
      },
      {
        "@type": "Event",
        "name": "AP Calculus AB - May 2025",
        "startDate": "2025-05-07T08:00:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "organizer": {
          "@type": "Organization",
          "name": "College Board",
          "url": "https://www.collegeboard.org"
        },
        "description": "AP Calculus AB exam"
      },
      {
        "@type": "Event",
        "name": "AP US History - May 2025",
        "startDate": "2025-05-15T08:00:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "organizer": {
          "@type": "Organization",
          "name": "College Board",
          "url": "https://www.collegeboard.org"
        },
        "description": "AP United States History exam"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema) }}
      />
      {children}
    </>
  );
}
