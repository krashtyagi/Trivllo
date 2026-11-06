import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import NProgress from "nprogress";

export const RouterPush = (router: AppRouterInstance, path: string, query?: Record<string, string>) => {
    NProgress.start();
    if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        router.push(`${path}?${params.toString()}`);
    } else {
        router.push(path);
    }
};
