import matter from "gray-matter";

export interface AuthorType {
  name: string;
  picture: string;
}

export interface ArticleType {
  slug: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  author: AuthorType;
  excerpt: string;
  timeReading: {
    text: string;
  };
  ogImage: {
    url: string;
  };
  content: string;
  tags: string[];
}

export interface API {
  getRawArticleBySlug: (slug: string) => matter.GrayMatterFile<string> | any;
  getAllSlugs: () => Promise<Array<string>>;
  getAllArticles: (fields: string[]) => Promise<Array<ArticleType>>;
  getArticlesByTag: (tag: string, fields: string[]) => Promise<Array<ArticleType>>;
  getArticleBySlug: (slug: string, fields: string[]) => Promise<ArticleType>;
  getAllTags: () => Promise<Array<string>>;
}
