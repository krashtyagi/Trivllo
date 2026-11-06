// // components/LogoLoader.tsx
// 'use client'

// import Image from 'next/image'
// import { cn } from "@/lib/utils" // if you have classnames helper

// interface LogoLoaderProps {
//     className?: string
//     size?: number // in pixels
// }

// export default function LogoLoader({ className, size = 80 }: LogoLoaderProps) {
//     return (
//         <div
//             className={cn(
//                 "fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm",
//                 className
//             )}
//         >
//             <div className="relative flex flex-col items-center gap-3">
//                 <div className="animate-float">
//                     <Image
//                         src="/logo.png"
//                         alt="Loading..."
//                         width={size}
//                         height={size}
//                         priority
//                         className="drop-shadow-xl"
//                     />
//                 </div>

//                 <div className="absolute inset-[-20%] rounded-full border-border border animate-ping-slow" />
//             </div>
//         </div>
//     )
// }

// 'use client'

// import { motion } from 'framer-motion'
// import Image from 'next/image'
// import { cn } from "@/lib/utils"

// interface LogoLoaderProps {
//     className?: string
//     size?: number
// }

// export default function LogoLoader({ className, size = 110 }: LogoLoaderProps) {
//     return (
//         <div className={cn(
//             "fixed inset-0 z-50 flex items-center justify-center bg-[#050505] backdrop-blur-md",
//             className
//         )}>
//             {/* 1. Ambient Background Glow (from globals.css) */}
//             <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-glow-soft" />

//             <div className="relative flex items-center justify-center">
//                 {/* 2. Expanding Luxury Rings */}
//                 {[...Array(2)].map((_, i) => (
//                     <motion.div
//                         key={i}
//                         initial={{ opacity: 0, scale: 0.5 }}
//                         animate={{ opacity: [0, 0.2, 0], scale: [0.8, 2] }}
//                         transition={{
//                             duration: 4,
//                             repeat: Infinity,
//                             delay: i * 2,
//                             ease: "easeOut"
//                         }}
//                         className="absolute rounded-full border border-white/10"
//                         style={{ width: size, height: size }}
//                     />
//                 ))}

//                 {/* 3. The Floating/Swinging Logo Container */}
//                 <motion.div
//                     animate={{
//                         y: [-12, 12, -12],
//                         rotateX: [-8, 8, -8],
//                         rotateY: [-15, 15, -15],
//                     }}
//                     transition={{
//                         duration: 5,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                     className="relative perspective-1000 flex flex-col items-center"
//                 >
//                     {/* The Logo itself */}
//                     <div className="relative overflow-hidden rounded-3xl group">
//                         <Image
//                             src="/logo.png"
//                             alt="Loading..."
//                             width={size}
//                             height={size}
//                             priority
//                             className="relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
//                         />
                        
//                         {/* Shimmer Streak (from globals.css) */}
//                         <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-luxury" />
//                     </div>

//                     {/* 4. Dynamic Shadow: Shrinks when logo rises, grows when it falls */}
//                     <motion.div 
//                         animate={{ 
//                             scale: [0.8, 1.1, 0.8], 
//                             opacity: [0.2, 0.5, 0.2],
//                             filter: ["blur(12px)", "blur(16px)", "blur(12px)"]
//                         }}
//                         transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//                         className="mt-8 w-2/3 h-2 bg-black rounded-[100%] shadow-[0_0_20px_rgba(0,0,0,0.8)]"
//                     />
//                 </motion.div>
//             </div>
//         </div>
//     )
// }
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from "@/lib/utils"

interface LogoLoaderProps {
    className?: string
    size?: number
}

export default function LogoLoader({ className, size = 110 }: LogoLoaderProps) {
    // We use Primary/20 and Primary/10 for the neon colors.
    // Replace 'primary' with 'blue', 'emerald', etc., if needed.
    const neonColor = "rgb(59 130 246)" // Example: blue-500

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-[#010101] backdrop-blur-md overflow-hidden",
            className
        )}>
            {/* 1. BACKGROUND LAYER: NEON RAYS & WAVES (New) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                {/* Electromagnetic Waves Container: Rotates and flows slowly */}
                <div className="absolute w-[150vw] h-[150vh] origin-center animate-wave-flow opacity-60">
                    
                    {/* Radial Light Source: Directly behind the logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]" />
                    
                    {/* The "Rays": Overlapping Conic Gradients */}
                    <div className="absolute inset-0 animate-ray-flicker">
                        {/* Ray Layer 1 */}
                        <div 
                            className="absolute inset-0"
                            style={{
                                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${neonColor} 10deg, transparent 20deg, transparent 180deg, ${neonColor} 190deg, transparent 200deg)`
                            }}
                        />
                        {/* Ray Layer 2 (Rotated slightly for complexity) */}
                        <div 
                            className="absolute inset-0 rotate-[45deg]"
                            style={{
                                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${neonColor} 5deg, transparent 15deg, transparent 200deg, ${neonColor} 205deg, transparent 215deg)`
                            }}
                        />
                    </div>
                </div>

                {/* Subtly Animated Wavy Distortion Overlay */}
                <svg className="absolute w-full h-full opacity-10 blur-[2px]" width="100%" height="100%">
                    <defs>
                        <filter id="wave">
                            <feTurbulence 
                                type="fractalNoise" 
                                baseFrequency="0.005 0.01" 
                                numOctaves="2" 
                                seed="1"
                            />
                            <feDisplacementMap in="SourceGraphic" scale="150" />
                        </filter>
                    </defs>
                    <rect width="100%" height="100%" filter="url(#wave)" className="fill-primary/20" />
                </svg>
            </div>


            {/* 2. FOREGROUND LAYER: LOGO & RINGS (Retained and improved) */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Expanding Luxury Rings (Thinner border for more elegance) */}
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.2, 0], scale: [0.8, 2] }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i * 2.5,
                            ease: "easeOut"
                        }}
                        className="absolute rounded-full border-[0.5px] border-white/10"
                        style={{ width: size, height: size }}
                    />
                ))}

                {/* The Floating/Swinging Logo Container (Retained) */}
                <motion.div
                    animate={{
                        y: [-12, 12, -12],
                        rotateX: [-8, 8, -8],
                        rotateY: [-15, 15, -15],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative perspective-1000 flex flex-col items-center"
                >
                    {/* The Logo itself (Added soft neon drop-shadow) */}
                    <div className="relative overflow-hidden rounded-3xl group">
                        <Image
                            src="/logo.png"
                            alt="Loading..."
                            width={size}
                            height={size}
                            priority
                            className="relative z-10 drop-shadow-[0_10px_40px_rgba(59,130,246,0.3)] brightness-110"
                        />
                        
                        {/* Shimmer Streak (Retained from globals.css) */}
                        <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-luxury" />
                    </div>

                    {/* Dynamic Shadow (Retained) */}
                    <motion.div 
                        animate={{ 
                            scale: [0.8, 1.1, 0.8], 
                            opacity: [0.2, 0.5, 0.2],
                            filter: ["blur(12px)", "blur(16px)", "blur(12px)"]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="mt-8 w-2/3 h-2 bg-black rounded-[100%] shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    />
                </motion.div>
            </div>
        </div>
    )
}