'use client'

import React, { useEffect, useState } from 'react'
import { Check, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { axiosApi } from '@/lib/axios'
import trivlloData from '@/../trivllo.json'

interface Plan {
    name: string
    key: string
    commission: string
    description: string
    features: string[]
    isPopular: boolean
    buttonText: string
    buttonStyle: string
}

export default function PromotionsPage() {
    const [activePlan, setActivePlan] = useState<string | null>(null)
    const [pendingPlan, setPendingPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)

    useEffect(() => {
        const fetchPromotionRequests = async () => {
            try {
                const res = await axiosApi.get('/vendors/promotions/my-requests')
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    const requests = res.data.data
                    const approved = requests.find((r: any) => r.status === 'approved')
                    const pending = requests.find((r: any) => r.status === 'pending')
                    if (approved) {
                        setActivePlan(approved.plan)
                    } else if (pending) {
                        setPendingPlan(pending.plan)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPromotionRequests()
    }, [])

    const handlePromotionSelection = async (planKey: string) => {
        setSubmitting(planKey)
        try {
            const res = await axiosApi.post('/vendors/promotions/apply', { plan: planKey })
            if (res.data && res.data.success) {
                toast.success(`Promotion request for ${planKey} submitted successfully!`)
                setPendingPlan(planKey)
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to apply for promotion.'
            toast.error(message)
        } finally {
            setSubmitting(null)
        }
    }

    const plans: Plan[] = [
        {
            name: 'Boost Promotion 🥉',
            key: 'Boost',
            commission: '10%',
            description: 'Increased visibility in search results and priority over standard listings.',
            features: [
                'Higher Search Visibility',
                'More Traveler Exposure',
                'Priority Over Standard Listings',
                'Increased Booking Potential'
            ],
            isPopular: false,
            buttonText: 'Activate Boost',
            buttonStyle: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        },
        {
            name: 'Premium Promotion 🥈',
            key: 'Premium',
            commission: '15%',
            description: 'Higher ranking on category pages and priority placement during peak times.',
            features: [
                'Everything in 10%',
                'Better Search Ranking',
                'Destination Page Exposure',
                'More Impressions & Clicks'
            ],
            isPopular: true,
            buttonText: 'Activate Premium',
            buttonStyle: 'bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-medium'
        },
        {
            name: 'Elite Promotion 🥇',
            key: 'Elite',
            commission: '20%',
            description: 'Maximum visibility and top-priority exposure across the entire platform.',
            features: [
                'Everything in 15%',
                'Top Search Placement',
                'Maximum Platform Visibility',
                'Featured Promotional Exposure',
                'Highest Booking Potential'
            ],
            isPopular: false,
            buttonText: 'Activate Elite',
            buttonStyle: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading promotions...</p>
            </div>
        )
    }

    const hasAnyPlan = activePlan !== null || pendingPlan !== null

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-start">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center gap-4"
            >
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 uppercase">
                    Promotions & Campaigns
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
                    Maximize your booking potential
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
                    Commission-based promotions boost your visibility and search ranking on {trivlloData.company_name}. Choose a promotion level to apply to your listings.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto w-full">
                {plans.map((plan, idx) => {
                    const isActive = activePlan === plan.key
                    const isPending = pendingPlan === plan.key
                    const isBlurred = hasAnyPlan && !isActive && !isPending

                    const cardContent = (
                        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-6 sm:p-8 md:p-10 rounded-[1.9rem] relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {plan.name}
                                </h3>
                                {plan.isPopular && !isActive && !isPending && (
                                    <span className="inline-flex items-center gap-1.5 bg-black dark:bg-zinc-900 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0">
                                        <Sparkles className="h-3 w-3 fill-white" />
                                        Recommended
                                    </span>
                                )}
                                {isActive && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 shadow-xs">
                                        Active Plan
                                    </span>
                                )}
                                {isPending && (
                                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 shadow-xs">
                                        Pending Approval
                                    </span>
                                )}
                            </div>

                            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 min-h-[48px]">
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {plan.commission}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    Commission
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

                            {!isActive && !isPending && (
                                <div className="mt-auto pt-2">
                                    <Button
                                        onClick={() => handlePromotionSelection(plan.key)}
                                        disabled={submitting !== null || hasAnyPlan}
                                        className={`w-full py-6 text-sm rounded-xl cursor-pointer shadow-xs transition-all duration-200 active:scale-98 ${plan.buttonStyle}`}
                                    >
                                        {submitting === plan.key ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            plan.buttonText
                                        )}
                                    </Button>
                                </div>
                            )}

                            {(isActive || isPending) && (
                                <div className="mt-auto pt-2 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm font-medium py-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                                    <AlertCircle className="h-4 w-4 text-zinc-400" />
                                    <span>Plan Status locked</span>
                                </div>
                            )}
                        </div>
                    )

                    if (plan.isPopular && !isBlurred) {
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
                            animate={{ opacity: isBlurred ? 0.35 : 1, y: 0 }}
                            whileHover={isBlurred ? {} : { y: -8, scale: 1.01 }}
                            transition={{ duration: 0.4, delay: idx * 0.15, ease: 'easeOut' }}
                            className={`relative rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 ease-out bg-white dark:bg-zinc-950 ${
                                isBlurred ? 'filter blur-[1.5px] pointer-events-none select-none' : ''
                            }`}
                        >
                            {cardContent}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}