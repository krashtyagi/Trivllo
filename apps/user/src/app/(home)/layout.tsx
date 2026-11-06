'use client'
import { NuqsContextProvider } from "@/context/NuqsContentProvider";
import { cn } from "@/lib/utils";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import dynamic from "next/dynamic";
import React from "react";
const NavWrapper = dynamic(() => import("@/components/navbar/nav.wraper"), {
  ssr: false,
});



const layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (

    <NavWrapper>
      <NuqsContextProvider>


        {children}
      </NuqsContextProvider>

    </NavWrapper>

  );
};

export default layout;
