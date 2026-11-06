// import { useAuthStore } from "@/store/auth.store";
// import { useEffect } from "react";
// import { useForm } from "react-hook-form";

// export const usePersonalDetails = () => {
//   const { currUser } = useAuthStore();

//   const methods = useForm({
//     defaultValues: {
//       firstName: currUser?.firstName || "",
//       lastName: currUser?.lastName || "",
//       email: currUser?.email || "",
//       address: currUser?.address || "",
//       zipCode: currUser?.zipCode || "",
//       country: currUser?.country || "",
//       gender: currUser?.gender || "",
//     },
//   });

//   // Important: reset when user loads later
//   useEffect(() => {
//     if (currUser) {
//       methods.reset({
//         firstName: currUser.firstName || "",
//         lastName: currUser.lastName || "",
//         email: currUser.email || "",
//         address: currUser.address || "",
//         zipCode: currUser.zipCode || "",
//         country: currUser.country || "",
//         gender: currUser.gender || "",
//       });
//     }
//   }, [currUser, methods]);

//   return {methods};
// };
