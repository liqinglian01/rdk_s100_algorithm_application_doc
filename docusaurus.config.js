
import { themes as prismThemes } from "prism-react-renderer";
import fs from "fs";
import path from "path";

/**
 * 📦 读取 versions.json（兼容首次无文件）
 */
let publishedVersions = [];

try {
  const file = path.resolve("./versions.json");
  if (fs.existsSync(file)) {
    publishedVersions = JSON.parse(fs.readFileSync(file, "utf-8"));
  }
} catch (e) {}

/** 有已发布快照时：根路径为最新发布版；未发布文档在 /next。无发布记录时仍只有 current 占根路径。 */
const docsVersions =
  publishedVersions.length > 0
    ? (() => {
        const latestPub = publishedVersions[0];
        const map = {
          current: {
            label: "Next",
            path: "next",
            banner: "none",
          },
        };
        for (const v of publishedVersions) {
          map[v] = {
            label: `V${v}`,
            path: v === latestPub ? "" : v,
            banner: v === latestPub ? "none" : "unmaintained",
          };
        }
        return map;
      })()
    : {
        current: {
          label: "Next",
          path: "",
          banner: "none",
        },
      };

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Algorithm Application DOC",
  favicon: "img/logo.png",

  url: "https://developer.d-robotics.cc",
  baseUrl: "/rdk_s100_algorithm_application_doc/",

  organizationName: "D-Robotics",
  projectName: "rdk_s100_algorithm_application_doc",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  scripts: [
    {
      src: "https://hm.baidu.com/hm.js?24dd63cad43b63889ea6bede5fd1ab9e",
      async: true,
    },
    // Dify Chatbot Configuration
    {
      src: "/algorithm_application_doc/js/dify-config.js",
    },
    {
      src: "https://rdk.d-robotics.cc/embed.min.js",
      id: "MltLQTHPb5EeP7uz",
      defer: true,
    },
  ],
  
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans", "en"],
    localeConfigs: {
      en: { label: "EN" },
      "zh-Hans": { label: "CN" },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/", // ✅ 必须（否则默认不显示文档）

          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,

          includeCurrentVersion: true,

          lastVersion:
            publishedVersions.length > 0 ? publishedVersions[0] : "current",

          versions: docsVersions,
        },

        blog: { showReadingTime: true },
        pages: { exclude: ["/imager/**", "**/dl/**"] },
        theme: { customCss: "./src/css/custom.css" },
        sitemap: { lastmod: "date" },
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },

    navbar: {
      title: "D-Robotics",
      logo: {
        alt: "logo",
        src: "img/logo.png",
        href: "https://d-robotics.cc/",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Model Zoo",
        },
        {
          type: "docsVersionDropdown",
          position: "left",
          // 仅列出已发布快照；未发布为 /next，不进下拉
          ...(publishedVersions.length > 0 ? { versions: publishedVersions } : {}),
        },
        {
          href: "https://developer.d-robotics.cc/",
          label: "Community",
          position: "right",
        },
        {
          href: "https://github.com/D-Robotics",
          label: "GitHub",
          position: "right",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },

    footer: {
      style: "dark",
      links: [
        {
          title: "友情链接",
          items: [
            {
              label: "古月居",
              href: "https://www.guyuehome.com/",
            },
          ],
        },
        {
          title: "联系我们",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/D-Robotics",
            },
            {
              label: "BiLiBiLi",
              href: (() => {
                if (process.env.DOCUSAURUS_CURRENT_LOCALE === "en") {
                  return "https://www.youtube.com/@D-Robotics";
                }
                return "https://space.bilibili.com/437998606";
              })(),
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} D-Robotics.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },

  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en", "zh"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: ["/", "rdk_s"],

        indexDocs: true,
        indexBlog: false,
        indexPages: false,

        searchResultContextMaxLength: 50,
      },
    ],
  ],
};

export default config;
