import { WebAppPage } from "@/components/templates/WebAppPage/WebAppPage";
import { brandName } from "@/config";
import { Routes } from "@/data/routes";

export const metadata = {
  title: `Account | ${brandName}`,
  description: `Account | ${brandName}`,
};

const Account = () => {
  return <WebAppPage currentPage={Routes.account} />;
};

export default Account;
