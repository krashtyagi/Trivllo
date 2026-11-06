// services/reservationMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Reservation } from '../datatable'; // adjust path

type Status = "Confirmed" | "Pending";

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: Status }) => {
      // Replace with your real API call
      await new Promise(r => setTimeout(r, 800)); // fake delay for demo
      return { success: true, id, newStatus };
    },

    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['user-reservations'] });

      const previousReservations = queryClient.getQueryData<Reservation[]>(['user-reservations']);

      queryClient.setQueryData<Reservation[]>(['user-reservations'], (old = []) => {
        const item = old.find(r => r.bookingReference === id);
        if (item) {
          // In-place mutation → same array reference, only one object changes
          item.status = newStatus;
        }
        return old; // ← same array → avoids big re-renders
      });

      return { previousReservations };
    },

    onError: (_, __, context) => {
      if (context?.previousReservations) {
        queryClient.setQueryData(['user-reservations'], context.previousReservations);
      }
      console.error("Status update failed – rolled back");
    },

    onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: ['user-reservations'] });
    },
  });
};