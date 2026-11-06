import { axiosApi } from "@/lib/axios";

export const downloadBookings = async (id: string) => {
  try {
    const response = await axiosApi.get(`/bookings/my-bookings/${id}/download`, {
      responseType: "blob",
    });

    
    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bookings-${id}.pdf`);
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