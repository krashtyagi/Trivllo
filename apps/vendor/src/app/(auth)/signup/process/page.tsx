
'use client'

import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { MessageModal } from "@/app/(dashboard)/(categories)/rooms/_components/RoomsListing";
import { PageSkeleton } from "@/app/(dashboard)/(categories)/rooms/_components/details.skeleton";
import AnimatedStepper from "../_components/steeper";

import { useSignUp } from "../hooks/use-signup";
import { useProcessContext } from "@/context/auth/ProcessContextProvider";
import { useAuthStore } from "@/stores/auth.store";
import { CheckCircle2 } from "lucide-react";
import ProcessButtonHandler from "../_components/processButtonHandler";
import { useCurrentUser } from "@/services/queryes";
import { Step2Skeleton, Step3Skeleton, ReviewSkeleton } from "../_components/skeletons";
import { vendorAccessToken } from "@/services/auth";

/* ✅ Dynamic imports (SSR disabled) */
const Step_1 = dynamic(() => import("../_components/step-1").then(m => m.Step_1), { ssr: false });
const Step_2 = dynamic(() => import("../_components/step-2").then(m => m.Step_2), { ssr: false });
const Step_3_hotel = dynamic(() => import("../_components/step-3").then(m => m.Step_3_hotel), { ssr: false });
const Step_3_cab = dynamic(() => import("../_components/step-3").then(m => m.Step_3_cab), { ssr: false });
const Step_3_bike = dynamic(() => import("../_components/step-3").then(m => m.Step_3_bike), { ssr: false });
const Step_3_tour = dynamic(() => import("../_components/step-3").then(m => m.Step_3_tour), { ssr: false });
const Step_3_adventure = dynamic(() => import("../_components/step-3").then(m => m.Step_3_adventure), { ssr: false });

export default function Process() {
  const { currentStep, setCurrentStep } = useProcessContext();
  const router = useRouter();
  const { data: userRes, isLoading } = useCurrentUser();
  const { currStep } = useAuthStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(vendorAccessToken);

      if (!token && !isLoading && !userRes?.data) {
        router.replace("/login");
      }
    }

    if (currStep && currStep !== currentStep) {
      setCurrentStep(currStep);
    }
  }, [currStep, currentStep, setCurrentStep, router]);

  return (
    <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
      <Suspense fallback={<PageSkeleton />}>
        <div className="min-h-svh bg-slate-50/50 dark:bg-background flex flex-col items-center py-12 px-4 md:px-6">

          {/* <div className="w-full max-w-[800px] mb-10">
            <AnimatedStepper currentStep={currentStep} />
          </div> */}

          <main className={cn(
            "w-full transition-all duration-500 ease-in-out bg-card border shadow-sm rounded-2xl p-6 md:p-10",
            (currentStep === 2 || currentStep === 4) ? "max-w-[800px]" : "max-w-[550px]"
          )}>
            <SignupForm />
          </main>

          <footer className="mt-8 max-w-[400px]">
            <FieldDescription className="text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{" "}
              and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </FieldDescription>
          </footer>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function SignupForm() {
  const { currentStep, setCurrentStep } = useProcessContext();
  const { methods, onHandleSubmit, loading, submitStep_1, submitStep_2, submitStep_3 } = useSignUp();

  return (
    <Form {...methods}>
      <form onSubmit={onHandleSubmit} className="space-y-8">
        <FullProcessForm methods={methods} loading={loading} />

        {[2, 3, 4].includes(currentStep) && (
          <div className="pt-4 border-t"></div>
        )}

        <ProcessButtonHandler
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          methods={methods}
          loading={loading}
          submitStep_1={submitStep_1}
          submitStep_2={submitStep_2}
          submitStep_3={submitStep_3}
        />
      </form>
    </Form>
  );
}

const FullProcessForm = ({ methods, loading }: { methods: any; loading: boolean }) => {
  const { currentStep } = useProcessContext();
  const router = useRouter();
  const { data: u } = useCurrentUser();
  const serviceType = methods.watch("serviceType");

  if (loading) {
    switch (currentStep) {
      case 2:
        return <Step2Skeleton />;
      case 3:
        return <Step3Skeleton />;
      case 4:
        return <ReviewSkeleton />;
      default:
        return <ReviewSkeleton />;
    }
  }

  switch (currentStep) {
    case 2:
      return <Step_1 currentStep={currentStep} methods={methods} />;

    case 3:
      return <Step_2 currentStep={currentStep} methods={methods} />;

    case 4:
      switch (serviceType) {
        case "cab":
          return <Step_3_cab currentStep={currentStep} methods={methods} />;
        case "bike":
          return <Step_3_bike currentStep={currentStep} methods={methods} />;
        case "tour":
          return <Step_3_tour currentStep={currentStep} methods={methods} />;
        case "adventure":
          return <Step_3_adventure currentStep={currentStep} methods={methods} />;
        case "hotel":
        default:
          return <Step_3_hotel currentStep={currentStep} methods={methods} />;
      }

    case 5:
      return (
        <div className="py-12 text-center">
          <h1 className="text-xl font-bold text-destructive">
            Application {u?.data?.data?.vendor?.status}
          </h1>
          <p className="text-muted-foreground mt-2">
            Please contact support for more details.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Return to Login
          </Button>
        </div>
      );

    default:
      return (
        <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Your account is under review
          </h1>

          <p className="text-muted-foreground max-w-[300px] mb-8">
            Our team is verifying your business details. We'll notify you via email shortly.
          </p>

          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.clear();
              }
              router.push("/login");
            }}
          >
            Return to Login
          </Button>
        </div>
      );
  }
};






// 'use client';

// import React, { Suspense, useEffect, useState } from "react";
// import { ErrorBoundary } from "react-error-boundary";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";

// import { cn } from "@/lib/utils";
// import { FieldDescription } from "@/components/ui/field";
// import { Form } from "@/components/ui/form";
// import { MessageModal } from "@/app/(dashboard)/rooms/_components/full-frame";
// import { PageSkeleton } from "@/app/(dashboard)/rooms/_components/details.skeleton";
// import AnimatedStepper from "../_components/steeper";

// import { useSignUp } from "../hooks/use-signup";
// import { useProcessContext } from "@/context/auth/ProcessContextProvider";
// import { useAuthStore } from "@/stores/auth.store";
// import ProcessButtonHandler from "../_components/processButtonHandler";

// const DynamicFullProcessForm = dynamic(
//   () => import("./fullprocess"),
//   { ssr: false, loading: () => <PageSkeleton /> }
// );

// const ClientOnly = ({ children }: { children: React.ReactNode }) => {
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) return <PageSkeleton />;
//   return <>{children}</>;
// };

// export default function Process() {
//   const { currentStep, setCurrentStep } = useProcessContext();
//   const router = useRouter();
//   const { currStep } = useAuthStore();

//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);

//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         router.replace("/login");
//         return;
//       }
//     }

//     if (currStep && currStep !== currentStep) {
//       setCurrentStep(currStep);
//     }
//   }, [currStep, currentStep, router, setCurrentStep]);

//   if (!isMounted) {
//     return <PageSkeleton />;
//   }

//   return (
//     <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
//       <Suspense fallback={<PageSkeleton />}>
//         <div className="min-h-svh bg-slate-50/50 dark:bg-background flex flex-col items-center py-12 px-4 md:px-6">
//           <div className="w-full max-w-[800px] mb-10">
//             <AnimatedStepper currentStep={currentStep} />
//           </div>

//           <main
//             className={cn(
//               "w-full transition-all duration-500 ease-in-out bg-card border shadow-sm rounded-2xl p-6 md:p-10",
//               (currentStep === 2 || currentStep === 4) ? "max-w-[800px]" : "max-w-[550px]"
//             )}
//           >
//             <SignupForm />
//           </main>

//           <footer className="mt-8 max-w-[400px]">
//             <FieldDescription className="text-center text-xs text-muted-foreground">
//               By clicking continue, you agree to our{" "}
//               <a href="#" className="underline hover:text-primary transition-colors">
//                 Terms of Service
//               </a>{" "}
//               and{" "}
//               <a href="#" className="underline hover:text-primary transition-colors">
//                 Privacy Policy
//               </a>
//               .
//             </FieldDescription>
//           </footer>
//         </div>
//       </Suspense>
//     </ErrorBoundary>
//   );
// }

// function SignupForm() {
//   const { currentStep, setCurrentStep } = useProcessContext();
//   const { methods, onHandleSubmit } = useSignUp();

//   return (
//     <Form {...methods}>
//       <form onSubmit={onHandleSubmit} className="space-y-8">
//         <ClientOnly>
//           <DynamicFullProcessForm methods={methods} currentStep={currentStep} />
//         </ClientOnly>
//         <ProcessButtonHandler
//           currentStep={currentStep}
//           setCurrentStep={setCurrentStep}
//           methods={methods}
//         />
//       </form>
//     </Form>
//   );
// }
// // const FullProcessForm = ({ methods }: { methods: any }) => {
//   const { currentStep } = useProcessContext();
//   const router = useRouter();
//   const { data: u } = useCurrentUser();

//   switch (currentStep) {
//     case 2:
//       return <Step_1 currentStep={currentStep} methods={methods} />;
//     case 3:
//       return <Step_2 currentStep={currentStep} methods={methods} />;
//     case 4:
//       return <Step_3 currentStep={currentStep} methods={methods} />;
//     case 5:
//       return (
//         <div className="py-12 text-center">
//           <h1 className="text-xl font-bold text-destructive">Application {u?.data?.data?.vendor?.status}</h1>
//           <p className="text-muted-foreground mt-2">Please contact support for more details.</p>
//           <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/login")}>
//             Return to Login
//           </Button>
//         </div>
//       );
//     default:
//       return (
//         <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
//           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
//             <CheckCircle2 className="w-8 h-8 text-primary" />
//           </div>
//           <h1 className="text-2xl font-bold tracking-tight mb-2">Your account is under review</h1>
//           <p className="text-muted-foreground max-w-[300px] mb-8">
//             Our team is verifying your business details. We'll notify you via email shortly.
//           </p>
//           <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
//             // FIX 3: Window guard for event handler
//             if (typeof window !== "undefined") {
//               localStorage.clear();
//               router.push("/login");
//             }
//           }}>
//             Return to Login
//           </Button>
//         </div>
//       );
//   }
// };