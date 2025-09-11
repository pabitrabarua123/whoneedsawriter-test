const glob = require("glob");

const siteUrl = "https://whoneedsawriter.com";

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  generateIndexSitemap: false,
  additionalPaths: async () => {
    try {
      const routes = await glob.sync("src/app/**/page.{md,mdx,js,jsx,ts,tsx}", {
        cwd: __dirname,
      });

      const blogRoutes = await glob.sync("blogposts/*.mdx", {
        cwd: __dirname,
      });

      console.log("Routes:", routes);
      console.log("Blog Routes:", blogRoutes);

      const allRoutes = [...routes, ...blogRoutes];

      if (!Array.isArray(allRoutes)) {
        throw new Error("Routes is not an array");
      }

      // Filter out private/authenticated routes
      const publicRoutes = routes.filter(
        (page) => {
          const pathParts = page.split("/");
          // Exclude admin, dashboard, account, articles, article-generator, batch routes
          return !pathParts.some((folder) => 
            folder.startsWith("_") || 
            folder === "admin" || 
            folder === "dashboard" || 
            folder === "account" || 
            folder === "articles" || 
            folder === "article-generator" || 
            folder === "batch" ||
            folder === "api" ||
            folder === "supabase"
          );
        }
      );

      const publicRoutesWithoutRouteGroups = publicRoutes.map((page) =>
        page
          .split("/")
          .filter((folder) => !folder.startsWith("(") && !folder.endsWith(")"))
          .join("/")
      );

      // Define static public pages with their priorities
      const staticPages = [
        { path: "", priority: 1.0, changefreq: "daily" }, // Homepage
        { path: "pricing", priority: 0.8, changefreq: "weekly" },
        { path: "privacy", priority: 0.3, changefreq: "monthly" },
        { path: "terms", priority: 0.3, changefreq: "monthly" },
        { path: "login", priority: 0.5, changefreq: "monthly" },
        { path: "signup", priority: 0.5, changefreq: "monthly" },
        { path: "blog", priority: 0.7, changefreq: "weekly" },
      ];

      const staticLocs = staticPages.map((page) => ({
        changefreq: page.changefreq,
        lastmod: new Date().toISOString(),
        loc: page.path === "" ? siteUrl : `${siteUrl}/${page.path}`,
        priority: page.priority,
      }));

      // Process blog posts - exclude specific test/demo posts
      const excludedBlogPosts = [
        "blogpost-slug-copy",
        "blogpost-slug", 
        "how-to-write-a-great-blog-post",
        "xczxc"
      ];
      
      const blogLocs = blogRoutes
        .map((route) => {
          const path = route.replace(/^blogposts\//, "").replace(/\.mdx$/, "");
          return path;
        })
        .filter((path) => !excludedBlogPosts.includes(path))
        .map((path) => ({
          changefreq: "monthly",
          lastmod: new Date().toISOString(),
          loc: `${siteUrl}/blog/${path}`,
          priority: 0.6,
        }));

      const paths = [...staticLocs, ...blogLocs];

      console.log("Generated sitemap paths:", paths);
      return paths;
    } catch (error) {
      console.error("Error fetching routes:", error);
      return [];
    }
  },
  generateRobotsTxt: true,
  siteUrl,
  exclude: [
    "/admin/*",
    "/dashboard/*", 
    "/account/*",
    "/articles/*",
    "/article-generator/*",
    "/batch/*",
    "/api/*",
    "/supabase/*"
  ],
};
