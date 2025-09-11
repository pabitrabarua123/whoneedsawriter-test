import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { Routes } from "@/data/routes";

export const metadata = {
  title: 'List of Articles | Who Needs a Writer',
  description: '',
};

const Articles = () => {
  return <WebAppPage currentPage={Routes.articles} />;
};

export default Articles;
