import PersonalNavWroper from "@/components/navbar/personal.nav.wraper";
import { cn } from "@/lib/utils";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import { buildMetadata } from "@/lib/seo.config";
import React from "react";

export const metadata = buildMetadata("profile");

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PersonalNavWroper>
      <div className={cn(CommonPagesStyles, " md:flex-col  flex gap-4 ")}>
        {children}
      </div>
    </PersonalNavWroper>
  );
};

export default layout;
