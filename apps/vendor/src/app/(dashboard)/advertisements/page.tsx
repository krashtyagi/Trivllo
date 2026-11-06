'use client'

import React from 'react'
import { Check, Star, Info, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import trivlloData from '@/../trivllo.json'

export default function AdvertisementsPage() {
    const handleAdPlanSelection = (planName: string, price: string, duration: string) => {
        const email = process.env.NEXT_PUBLIC_EMAIL_TO || trivlloData.contact.email || 'example@gmail.com'
        const subject = `[Ad Inquiry] Request to Advertise on ${trivlloData.company_name} - ${planName} Plan`

        const body = `Dear ${trivlloData.company_name} Advertising Team,

I would like to submit an inquiry to advertise my business on the ${trivlloData.company_name} platform. Below are the details of the advertising plan I am interested in:

- Plan Selected: ${planName}
- Pricing: ${price}
- Duration: ${duration} 
- Target Email: ${email}
- Inquiry Status: Pending Review (Dummy Test)
- Reference Code: HLX-ADV-${Math.floor(100000 + Math.random() * 900000)}

Please contact me with placement availability, campaign requirements, and instructions for payment/activation.

Best regards,
[Your Name]
[Your Business Name]
[Your Contact Number]`

        toast.success(`Redirecting to Gmail for the ${planName} Advertising Plan!`)

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

        window.open(gmailUrl, '_blank')
    }

    const plans = [
        {
            name: 'Growth',
            price: '₹999 + GST',
            duration: '15 Days',
            description: 'Essential placement to get your brand noticed by travelers searching for destinations.',
            features: [
                'Advertisement placement on destination pages',
                'Advertisement placement on selected hotel/property pages',
                'Brand logo and banner display',
                'Reach travelers actively searching for stays and experiences',
                'Standard advertisement rotation',
                'Basic performance report'
            ],
            isPopular: false,
            buttonText: 'Buy Growth Plan',
            buttonStyle: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        },
        {
            name: 'Booking Plus',
            price: '₹2,999 + GST',
            duration: '30 Days',
            description: 'Enhanced exposure to boost conversion rates and drive direct inquiries.',
            features: [
                'Everything in Growth',
                'Higher advertisement priority',
                'Enhanced visibility on destination pages',
                'Priority placement on selected hotel/property pages',
                'Increased brand exposure to potential guests',
                'Detailed campaign performance report',
                'Priority campaign activation'
            ],
            isPopular: true,
            buttonText: 'Buy Booking Plus',
            buttonStyle: 'bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-medium'
        },
        {
            name: 'Premium',
            price: '₹9,999 + GST',
            duration: '30 Days',
            description: `Maximum reach and premium positioning across the entire ${trivlloData.company_name} ecosystem.`,
            features: [
                'Everything in Booking Plus',
                'Premium Homepage Advertisement Placement',
                'Top-priority advertisement visibility',
                'Placement across Homepage, Hotel Pages, and Destination Pages',
                `Maximum audience reach across the ${trivlloData.company_name} platform`,
                'Premium campaign support',
                'Advanced performance analytics',
                'Featured exposure during seasonal and promotional campaigns'
            ],
            isPopular: false,
            buttonText: 'Buy Premium Plan',
            buttonStyle: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }
    ]

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-start">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center gap-4"
            >
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 uppercase">
                    Advertise on {trivlloData.company_name}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
                    Grow your brand presence
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
                    Promote your property, business, brand, or special offers to travelers actively planning and booking their next trip. Increase your visibility across the {trivlloData.company_name} platform with our prepaid advertising plans.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto w-full mb-12">
                {plans.map((plan, idx) => {
                    const cardContent = (
                        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-6 sm:p-8 md:p-10 rounded-[1.9rem] relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {plan.name}
                                </h3>
                                {plan.isPopular && (
                                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase shrink-0">
                                        <Star className="h-3 w-3 fill-white" />
                                        Recommended
                                    </span>
                                )}
                            </div>

                            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 min-h-[48px]">
                                {plan.description}
                            </p>

                            <div className="flex flex-col mb-6">
                                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {plan.price}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                                    / {plan.duration}
                                </span>
                            </div>

                            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800/80 mb-6" />

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                                        <Check className="h-4 w-4 text-zinc-950 dark:text-zinc-50 shrink-0 mr-3 mt-0.5 stroke-[2.5]" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-2">
                                <Button
                                    onClick={() => handleAdPlanSelection(plan.name, plan.price, plan.duration)}
                                    className={`w-full py-6 text-sm rounded-xl cursor-pointer shadow-xs transition-all duration-200 active:scale-98 ${plan.buttonStyle}`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        </div>
                    )

                    if (plan.isPopular) {
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{
                                    opacity: 1,
                                    y: [0, -10, 0]
                                }}
                                whileHover={{ y: -16, scale: 1.02 }}
                                transition={{
                                    opacity: { duration: 0.6, delay: idx * 0.15 },
                                    y: {
                                        repeat: Infinity,
                                        duration: 2.2,
                                        ease: 'easeInOut',
                                        delay: idx * 0.15 + 0.6
                                    },
                                    scale: { duration: 0.2 }
                                }}
                                className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-400 shadow-xl flex flex-col hover:shadow-2xl transition-shadow duration-300 ease-out group"
                            >
                                {cardContent}
                            </motion.div>
                        )
                    }

                    return (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ duration: 0.4, delay: idx * 0.15, ease: 'easeOut' }}
                            className="relative rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 ease-out bg-white dark:bg-zinc-950"
                        >
                            {cardContent}
                        </motion.div>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-4"
            >
                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                        <Info className="h-5 w-5 text-blue-500" />
                        <h3>Important Information</h3>
                    </div>
                    <ul className="space-y-2.5 text-sm text-zinc-500 dark:text-zinc-400 list-disc pl-5">
                        <li>All advertisement plans are prepaid.</li>
                        <li>GST will be charged as applicable.</li>
                        <li>Advertisement fees are separate from partner commission and promotion plans.</li>
                        <li>Advertisement placement is subject to availability and approval by {trivlloData.company_name}.</li>
                        <li>Advertising increases visibility and reach but does not guarantee bookings, inquiries, or sales.</li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 flex flex-col justify-between shadow-md">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <MessageSquare className="h-5 w-5 fill-white/20" />
                            <h3>Ready to Advertise?</h3>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">
                            Submit your advertisement request by clicking on any of our plans. Our team will contact you with placement availability, campaign details, and activation instructions.
                        </p>
                    </div>
                    <div className="mt-6 text-[12px] font-medium text-white/70">
                        * Dummy Testing Active with target email {process.env.NEXT_PUBLIC_EMAIL_TO || 'rajmohit06660@gmail.com'}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}