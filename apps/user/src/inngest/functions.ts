// "use client";
import { dotoggleLike } from "@/services/hotel/hotel.service";
import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  },
);

export const toggleLikeBackground = inngest.createFunction(
  { id: "toggle-like-background", triggers: { event: "app/like.toggled" } },
  async ({ event, step }) => {
    const { id, token } = event.data;
    await step.run("hit-backend-like", async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/v1/favorites/toggle/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle like: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    });

    return { message: `Successfully toggled like for ${id}` };
  },
);
