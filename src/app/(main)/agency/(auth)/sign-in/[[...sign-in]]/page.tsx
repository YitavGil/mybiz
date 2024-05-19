import React from "react";
import { SignIn } from "@clerk/nextjs";
import AuthLayout from "../../layout";

const Page = () => {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
};

export default Page;
