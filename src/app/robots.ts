import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal/", "/api/", "/admin/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/portal/", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://fluxco.com/sitemap.xml",
    host: "https://fluxco.com",
  };
}
