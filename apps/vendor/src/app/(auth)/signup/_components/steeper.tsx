// 'use client';

// import React from 'react';
// import { Check } from 'lucide-react';
// import { cn } from '@/lib/utils';

// type Step = {
//   title: string;
//   description: string;
// };

// const steps: Step[] = [
//   // { title: 'Add details', description: 'Basic info' },
//   // { title: 'OTP', description: 'Verify phone' },
//   { title: 'Business', description: 'Business details' },
//   { title: 'Bank', description: 'Bank details' },
//   { title: 'Hotel', description: 'Property' },
//   // { title: 'Submit', description: 'Submit Form' },
// ];

// interface AnimatedStepperProps {
//   currentStep: number; // 1-based index
//   className?: string;
// }

// export default function AnimatedStepper({
//   currentStep,
//   className,
// }: AnimatedStepperProps) {

//   // Calculate progress width (0% for step 1, 100% for step 7)
//   const progressWidth = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

//   return (
//     <div className={cn('w-full py-12', className)}>
//       <div className="relative flex items-center justify-between max-w-4xl mx-auto px-10">

//         {/* Progress Bar Container */}
//         <div className="absolute top-[22px] left-10 right-10 h-[3px] bg-muted -z-10 rounded-full overflow-hidden">
//           {/* Animated Filling Line */}
//           <div
//             className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
//             style={{ width: `${progressWidth}%` }}
//           />
//         </div>

//         {steps.map((step, index) => {
//           const stepNumber = index + 1;
//           const isCompleted = stepNumber < currentStep;
//           const isActive = stepNumber === currentStep;

//           return (
//             <div
//               key={index}
//               className="flex flex-col items-center relative z-10"
//             >
//               {/* Circle */}
//               <div
//                 className={cn(
//                   'w-11 h-11 rounded-full border-[3px] flex items-center justify-center',
//                   'bg-background transition-all duration-500 delay-200',
//                   isCompleted
//                     ? 'border-primary bg-primary text-primary-foreground'
//                     : isActive
//                       ? 'border-primary ring-4 ring-primary/20 scale-110'
//                       : 'border-muted bg-background text-muted-foreground'
//                 )}
//               >
//                 {isCompleted ? (
//                   <Check className="w-5 h-5 stroke-[3px] animate-in zoom-in duration-300" />
//                 ) : (
//                   <span className={cn(
//                     'text-sm font-bold',
//                     isActive ? 'text-primary' : 'text-muted-foreground'
//                   )}>
//                     {stepNumber}
//                   </span>
//                 )}
//               </div>

//               {/* Labels - Positioned Absolutely to avoid shifting layout */}
//               <div className="absolute top-14 w-32 text-center flex flex-col items-center">
//                 <p
//                   className={cn(
//                     'font-semibold text-[11px] uppercase tracking-wider transition-colors duration-300',
//                     isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground/60'
//                   )}
//                 >
//                   {step.title}
//                 </p>
//                 <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-80">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }





















'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  { title: 'Business', description: 'Business details' },
  { title: 'Bank', description: 'Bank details' },
  { title: 'Hotel', description: 'Property' },
];

interface AnimatedStepperProps {
  currentStep: number;
  className?: string;
}

export default function AnimatedStepper({
  currentStep,
  className,
}: AnimatedStepperProps) {
  

  const { currStep } = useAuthStore()

const steeperStep = currStep
  const offset = 2;
  const localActiveStep = Math.max(1, steeperStep ? steeperStep - offset : currentStep - offset);

  const progressWidth = Math.max(0, Math.min(100, ((localActiveStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className={cn('w-full py-12', className)}>
      <div className="relative flex items-center justify-between max-w-4xl mx-auto px-10">

        <div className="absolute top-[22px] left-10 right-10 h-[3px] bg-muted -z-10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < localActiveStep;
          const isActive = stepNumber === localActiveStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-11 h-11 rounded-full border-[3px] flex items-center justify-center',
                  'bg-background transition-all duration-500 delay-100',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-primary ring-4 ring-primary/20 scale-110'
                      : 'border-muted bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px] animate-in zoom-in duration-300" />
                ) : (
                  <span className={cn(
                    'text-sm font-bold',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {stepNumber}
                  </span>
                )}
              </div>

              <div className="absolute top-14 w-32 text-center flex flex-col items-center">
                <p
                  className={cn(
                    'font-semibold text-[11px] uppercase tracking-wider transition-colors duration-300',
                    isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground/60'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-80">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>)}







// 'use client';

// import React from 'react';
// import { Check } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuthStore } from '@/stores/auth.store';

// type Step = {
//   title: string;
//   description: string;
// };

// const steps: Step[] = [
//   { title: 'Business', description: 'Business details' },
//   { title: 'Bank', description: 'Bank details' },
//   { title: 'Hotel', description: 'Property' },
// ];

// interface AnimatedStepperProps {
//   currentStep?: number;
//   className?: string;
// }

// export default function AnimatedStepper({
//   currentStep,
//   className,
// }: AnimatedStepperProps) {
//   const { currStep } = useAuthStore();
//   const globalActiveStep = currStep ?? currentStep ?? 2;
//   const localActiveStep =
//     globalActiveStep > 4
//       ? steps.length
//       : Math.min(steps.length, Math.max(1, globalActiveStep - 1));

//   console.log('globalActiveStep:', globalActiveStep);
//   console.log('localActiveStep:', localActiveStep);

//   const progressWidth =
//     steps.length <= 1
//       ? 0
//       : Math.max(
//           0,
//           Math.min(100, ((localActiveStep - 1) / (steps.length - 1)) * 100),
//         );

//   console.log('progressWidth:', progressWidth);

//   return (
//     <div className={cn('w-full py-12', className)}>
//       <div className="relative flex items-center justify-between max-w-4xl mx-auto px-10">

//         {/* Progress Line */}
//         <div className="absolute top-[22px] left-10 right-10 h-[3px] bg-muted -z-10 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
//             style={{ width: `${progressWidth}%` }}
//           />
//         </div>

//         {steps.map((step, index) => {
//           const stepNumber = index + 1;
//           const isCompleted = stepNumber < localActiveStep;
//           const isActive = stepNumber === localActiveStep;

//           return (
//             <div key={index} className="flex flex-col items-center relative z-10">
//               {/* Circle */}
//               <div
//                 className={cn(
//                   'w-11 h-11 rounded-full border-[3px] flex items-center justify-center bg-background transition-all duration-500',
//                   isCompleted && 'border-primary bg-primary text-primary-foreground',
//                   isActive && 'border-primary ring-4 ring-primary/20 scale-110',
//                   !isCompleted && !isActive && 'border-muted text-muted-foreground'
//                 )}
//               >
//                 {isCompleted ? (
//                   <Check className="w-5 h-5 stroke-[3px] animate-in zoom-in duration-300" />
//                 ) : (
//                   <span className={cn('text-sm font-bold', isActive && 'text-primary')}>
//                     {stepNumber}
//                   </span>
//                 )}
//               </div>

//               {/* Label */}
//               <div className="absolute top-14 w-32 text-center">
//                 <p
//                   className={cn(
//                     'font-semibold text-[11px] uppercase tracking-wider transition-colors',
//                     (isActive || isCompleted) ? 'text-foreground' : 'text-muted-foreground/60'
//                   )}
//                 >
//                   {step.title}
//                 </p>
//                 <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-80">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }