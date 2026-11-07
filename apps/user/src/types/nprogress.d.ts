declare module "nprogress" {
  interface NProgressOptions {
    minimum?: number;
    template?: string;
    easing?: string;
    speed?: number;
    trickle?: boolean;
    trickleSpeed?: number;
    showSpinner?: boolean;
    parent?: string;
  }

  interface NProgress {
    start(): NProgress;
    done(force?: boolean): NProgress;
    set(n: number): NProgress;
    inc(amount?: number): NProgress;
    configure(options: Partial<NProgressOptions>): NProgress;
    status: number | null;
    isStarted(): boolean;
  }

  const nprogress: NProgress;
  export default nprogress;
}

