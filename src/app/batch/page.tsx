import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { brandName } from "@/config";
import { Routes } from "@/data/routes";


export const metadata = {
  title: `List of Articles | ${brandName}`,
  description: `List of Articles | ${brandName}`,
};

const Batch = () => {
  return <WebAppPage currentPage={Routes.batch} />;
};

export default Batch;
