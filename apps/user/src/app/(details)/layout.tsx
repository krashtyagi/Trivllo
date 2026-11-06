'use client'
// import DetailsNavWrapper from "@/components/navbar/detailsNavWraper";
import { NuqsContextProvider } from "@/context/NuqsContentProvider";
import { cn } from "@/lib/utils";
import { CommonPagesStyles } from "@/styles/commonpages-styles";
import dynamic from "next/dynamic";
import React from "react";
const DetailsNavWrapper = dynamic(() => import("@/components/navbar/detailsNavWraper"), {
    ssr: false,
});



const layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (

        <DetailsNavWrapper>


            {children}

        </DetailsNavWrapper>

    );
};

export default layout;
