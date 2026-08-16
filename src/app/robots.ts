import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://habeshahome.et";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/owner/", "/admin/", "/account/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
