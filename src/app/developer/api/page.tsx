import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { brandName } from "@/config";
import { Routes } from "@/data/routes";

export const metadata = {
  title: `Developer API | ${brandName}`,
  description: `Manage your API access | ${brandName}`,
};

const DeveloperApiPage = () => {
  return <WebAppPage currentPage={Routes.apiKeys} />;
};

export default DeveloperApiPage;
