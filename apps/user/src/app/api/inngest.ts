// pages/api/inngest.ts
import { Inngest } from "inngest";
import { serve } from "inngest/next";

export const inngest = new Inngest({ id: "my-app" });
// pages/api/inngest.ts - update the serve call

// pages/api/inngest.ts - add to existing file
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
export default serve({
  client: inngest,
  functions: [processTask],
});
