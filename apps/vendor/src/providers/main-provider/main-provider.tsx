"use client"
import React from "react";
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderLib,
} from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/react";
const MainProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (

    <NuqsAdapter>
      <QueryClientProviderLib client={queryClient}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </QueryClientProviderLib>
    </NuqsAdapter>
  );
};

export default MainProvider;
