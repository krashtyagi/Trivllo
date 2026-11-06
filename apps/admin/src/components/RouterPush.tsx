import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import NProgress from "nprogress";

export const RouterPush = (router: AppRouterInstance, path: string) => {
    NProgress.start();
    router.push(path);
    // NProgress.done();
};