import { brandName } from "@/config";
import { getSEOTags } from "@/components/SEOTags/SEOTags";
import { Metadata } from "next";
import Login from "@/components/pages/Login/Login";

export const metadata: Metadata = getSEOTags({
  title: `Login | ${brandName}`,
  description: `Login to your account | ${brandName}`,
});

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;
