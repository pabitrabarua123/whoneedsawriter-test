import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { brandName } from "@/config";
import { Routes } from "@/data/routes";

export const metadata = {
  title: `Dashboard | ${brandName}`,
  description: `Dashboard | ${brandName}`,
};

const Dashboard = () => {
  return <WebAppPage currentPage={Routes.dashboard} />;
};

export default Dashboard;
