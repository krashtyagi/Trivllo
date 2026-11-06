import type { AppRouter } from "../routers/app.router";

export interface ClientOptions {
  baseURL?: string;
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
}

export function createORPCClient(options?: ClientOptions) {
  const getBaseURL = () => {
    if (options?.baseURL) return options.baseURL;
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  };

  const handler = {
    get(_target: any, routerName: string) {
      return new Proxy(
        {},
        {
          get(_subTarget: any, procedureName: string) {
            return async (input?: any) => {
              const url = `${getBaseURL()}/api/orpc/${routerName}/${procedureName}`;
              const customHeaders = options?.headers ? await options.headers() : {};

              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...customHeaders,
                },
                body: JSON.stringify(input ?? {}),
                credentials: "include",
              });

              const result = await response.json();
              if (!response.ok) {
                throw new Error(result.error?.message || "oRPC Request Failed");
              }

              return result.data;
            };
          },
        }
      );
    },
  };

  return new Proxy({}, handler) as ClientProxy<AppRouter>;
}

type ClientProxy<TRouter> = {
  [K in keyof TRouter]: {
    [P in keyof TRouter[K]]: TRouter[K][P] extends { execute: (input: infer TInput, ctx: any) => Promise<infer TOutput> }
      ? (input: TInput) => Promise<TOutput>
      : (input?: any) => Promise<any>;
  };
};

export const orpc = createORPCClient();

