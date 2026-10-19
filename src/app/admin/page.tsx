import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";

/** Private route — no SEO/social metadata; block indexing. */
export const metadata: Metadata = {
  title: {
    absolute: "",
  },
  description: "",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  // Override root layout so crawlers do not get Admin title/description/OG.
  openGraph: {
    title: "",
    description: "",
    url: "",
    images: [],
  },
  twitter: {
    title: "",
    description: "",
    images: [],
  },
  alternates: {
    canonical: null,
  },
};

export default function AdminPage() {
  return <AdminShell />;
}
