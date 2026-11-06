import { useQuery } from "@tanstack/react-query";
import { downloadInvoice, getInvoices } from "./invoice.service";

export const useGetInvoices = () => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
    staleTime: 200000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const usedownloadInvoice = (id:string) => {
  return useQuery({
    queryKey: ["downloadInvoice", id],
    queryFn: ()=>downloadInvoice(id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
    enabled:!!id
  });
};