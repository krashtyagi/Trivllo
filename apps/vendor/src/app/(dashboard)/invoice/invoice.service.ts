import { axiosApi } from "@/lib/axios"
import { success } from "zod"

export const getInvoices=()=>{
    const res =  axiosApi.get('/vendors/invoices')
    return res
}
export const downloadInvoice = async (id: string) => {
  try {
    const response = await axiosApi.get(`/vendors/invoices/${id}/download`, {
      responseType: "blob",
    });

    
    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, error };
  }
};