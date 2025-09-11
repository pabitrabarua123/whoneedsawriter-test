import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { Routes } from "@/data/routes";
import { brandName } from "@/config";

export const metadata = {
  title: `Generate Articles | ${brandName}`,
  description: `Generate Articles | ${brandName}`,
};

const ArticleGenerator = () => {
  return <WebAppPage currentPage={Routes.articlegenerator} />;
};

export default ArticleGenerator;
