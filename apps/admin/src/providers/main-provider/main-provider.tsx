"use client"
import React from "react";
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderLib,
} from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/react";
import VariantsProvider from "./variants-provider";
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
        ><VariantsProvider>

            {children}
          </VariantsProvider>
        </ThemeProvider>
      </QueryClientProviderLib>
    </NuqsAdapter>
  );
};

export default MainProvider;
