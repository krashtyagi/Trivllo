import { createORPCContext, ORPCContext } from "./context";
import { appRouter, AppRouter } from "../routers/app.router";
import { ORPCError } from "./procedures";

export function createORPCHandler(router: AppRouter = appRouter) {
  async function handleRequest(req: Request) {
    try {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Extract router path e.g. /api/orpc/blog/getPublishedPosts -> ["blog", "getPublishedPosts"]
      const segments = pathname
        .replace(/^\/api\/orpc\/?/, "")
        .split("/")
        .filter(Boolean);

      if (segments.length < 2) {
        return new Response(
          JSON.stringify({ error: "Invalid oRPC procedure path. Format: /api/orpc/[router]/[procedure]" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const [routerName, procedureName] = segments;
      const targetRouter = (router as any)[routerName];

      if (!targetRouter || !targetRouter[procedureName]) {
        return new Response(
          JSON.stringify({ error: `Procedure '${routerName}.${procedureName}' not found` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const procedure = targetRouter[procedureName];

      // Parse input
      let input: any = undefined;
      if (req.method === "GET") {
        const inputParam = url.searchParams.get("input");
        if (inputParam) {
          try {
            input = JSON.parse(inputParam);
          } catch {
            input = Object.fromEntries(url.searchParams.entries());
          }
        }
      } else if (req.method === "POST") {
        const text = await req.text();
        if (text) {
          try {
            input = JSON.parse(text);
          } catch {
            input = undefined;
          }
        }
      }

      const ctx = await createORPCContext(req);
      const result = await procedure.execute(input, ctx);

      return new Response(JSON.stringify({ data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      const isORPCError = err instanceof ORPCError;
      const status = isORPCError ? err.status : 500;
      const message = err.message || "Internal server error";

      return new Response(
        JSON.stringify({
          error: {
            message,
            code: isORPCError ? err.code : "INTERNAL_SERVER_ERROR",
          },
        }),
        { status, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return {
    GET: handleRequest,
    POST: handleRequest,
  };
}

