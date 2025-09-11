import { brandName } from "@/config";
import { getSEOTags } from "@/components/SEOTags/SEOTags";
import { Metadata } from "next";
import SignUp from "@/components/pages/SignUp/SignUp";

export const metadata: Metadata = getSEOTags({
  title: `Sign Up | ${brandName}`,
  description: `Sign up for your account | ${brandName}`,
});

const SignUpPage = () => {
  return <SignUp />;
};

export default SignUpPage;
