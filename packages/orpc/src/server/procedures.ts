import { z } from "zod";
import { ORPCContext } from "./context";

export class ORPCError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
  status: number;

  constructor(message: string, code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.name = "ORPCError";
    this.code = code;
    this.status =
      code === "UNAUTHORIZED" ? 401 :
      code === "FORBIDDEN" ? 403 :
      code === "NOT_FOUND" ? 404 :
      code === "BAD_REQUEST" ? 400 : 500;
  }
}

export type MiddlewareFn<TInCtx extends ORPCContext = ORPCContext, TOutCtx extends ORPCContext = ORPCContext> = (
  ctx: TInCtx
) => Promise<TOutCtx> | TOutCtx;

export type HandlerFn<TInput, TOutput, TCtx extends ORPCContext> = (opts: {
  input: TInput;
  ctx: TCtx;
}) => Promise<TOutput> | TOutput;

export interface Procedure<TInput = any, TOutput = any, TCtx extends ORPCContext = ORPCContext> {
  type: "query" | "mutation";
  inputSchema?: z.ZodType<TInput>;
  middlewares: MiddlewareFn[];
  handler: HandlerFn<TInput, TOutput, TCtx>;
  execute: (input: unknown, ctx: ORPCContext) => Promise<TOutput>;
}

export class ProcedureBuilder<TCtx extends ORPCContext = ORPCContext> {
  private middlewares: MiddlewareFn[] = [];

  constructor(middlewares: MiddlewareFn[] = []) {
    this.middlewares = middlewares;
  }

  use<TNewCtx extends ORPCContext>(fn: (ctx: TCtx) => Promise<TNewCtx> | TNewCtx): ProcedureBuilder<TNewCtx> {
    return new ProcedureBuilder<TNewCtx>([...this.middlewares, fn as MiddlewareFn]);
  }

  input<TInput>(schema: z.ZodType<TInput>) {
    return {
      query: <TOutput>(handler: HandlerFn<TInput, TOutput, TCtx>): Procedure<TInput, TOutput, TCtx> => {
        return this.createProcedure("query", schema, handler);
      },
      mutation: <TOutput>(handler: HandlerFn<TInput, TOutput, TCtx>): Procedure<TInput, TOutput, TCtx> => {
        return this.createProcedure("mutation", schema, handler);
      },
    };
  }

  query<TOutput>(handler: HandlerFn<void, TOutput, TCtx>): Procedure<void, TOutput, TCtx> {
    return this.createProcedure("query", undefined, handler);
  }

  mutation<TOutput>(handler: HandlerFn<void, TOutput, TCtx>): Procedure<void, TOutput, TCtx> {
    return this.createProcedure("mutation", undefined, handler);
  }

  private createProcedure<TInput, TOutput>(
    type: "query" | "mutation",
    schema?: z.ZodType<TInput>,
    handler?: any
  ): Procedure<TInput, TOutput, TCtx> {
    const middlewares = this.middlewares;
    return {
      type,
      inputSchema: schema,
      middlewares,
      handler,
      execute: async (rawInput: unknown, baseCtx: ORPCContext): Promise<TOutput> => {
        let currentCtx: any = baseCtx;
        for (const mw of middlewares) {
          currentCtx = await mw(currentCtx);
        }

        let parsedInput: any = rawInput;
        if (schema) {
          const result = schema.safeParse(rawInput);
          if (!result.success) {
            throw new ORPCError(
              `Validation error: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
              "BAD_REQUEST"
            );
          }
          parsedInput = result.data;
        }

        return await handler({ input: parsedInput, ctx: currentCtx });
      },
    };
  }
}

// 1. Public procedure
export const publicProcedure = new ProcedureBuilder();

// 2. Authenticated user procedure
export const authProcedure = publicProcedure.use(async (ctx) => {
  if (!ctx.user) {
    throw new ORPCError("Authentication required to access this resource", "UNAUTHORIZED");
  }
  return {
    ...ctx,
    user: ctx.user,
  };
});

// 3. Vendor procedure
export const vendorProcedure = authProcedure.use(async (ctx) => {
  if (!ctx.user.isVendor && ctx.user.role !== "vendor" && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new ORPCError("Vendor privileges required", "FORBIDDEN");
  }
  return ctx;
});

// 4. Admin procedure (Super Admin / Admin)
export const adminProcedure = authProcedure.use(async (ctx) => {
  const role = ctx.user.role || "user";
  if (!["admin", "super_admin"].includes(role)) {
    throw new ORPCError("Administrator privileges required", "FORBIDDEN");
  }
  return ctx;
});

// 5. EMPLOYEE ROLE: Blog Editor Procedure
export const blogEditorProcedure = authProcedure.use(async (ctx) => {
  const role = ctx.user.role || "user";
  const allowed = ["admin", "super_admin", "blog_editor", "blog_author"];
  if (!allowed.includes(role)) {
    throw new ORPCError("Blog Editor permissions required", "FORBIDDEN");
  }
  return {
    ...ctx,
    employeeRole: role as "admin" | "super_admin" | "blog_editor" | "blog_author",
  };
});

// 6. EMPLOYEE ROLE: Reviewer Procedure
export const reviewerProcedure = authProcedure.use(async (ctx) => {
  const role = ctx.user.role || "user";
  const allowed = ["admin", "super_admin", "reviewer"];
  if (!allowed.includes(role)) {
    throw new ORPCError("Reviewer moderation permissions required", "FORBIDDEN");
  }
  return {
    ...ctx,
    employeeRole: role as "admin" | "super_admin" | "reviewer",
  };
});

// 7. EMPLOYEE ROLE: SEO Manager Procedure
export const seoProcedure = authProcedure.use(async (ctx) => {
  const role = ctx.user.role || "user";
  const allowed = ["admin", "super_admin", "seo_manager"];
  if (!allowed.includes(role)) {
    throw new ORPCError("SEO Management permissions required", "FORBIDDEN");
  }
  return {
    ...ctx,
    employeeRole: role as "admin" | "super_admin" | "seo_manager",
  };
});

// 8. EMPLOYEE ROLE: Analyst Procedure
export const analystProcedure = authProcedure.use(async (ctx) => {
  const role = ctx.user.role || "user";
  const allowed = ["admin", "super_admin", "analyst"];
  if (!allowed.includes(role)) {
    throw new ORPCError("Data Analyst permissions required", "FORBIDDEN");
  }
  return {
    ...ctx,
    employeeRole: role as "admin" | "super_admin" | "analyst",
  };
});

