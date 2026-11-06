import { buildMetadata } from "@/lib/seo.config";
import AuthContextProvider from "@/context/auth/auth-form-provider";
import ResetPasswordContextProvider from "@/context/auth/resetpasswordsteps";
import React from "react";

export const metadata = buildMetadata("login");

const layout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <ResetPasswordContextProvider>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </ResetPasswordContextProvider>
    </div>
  );
};

export default layout;