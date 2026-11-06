import { Button } from '@/components/ui/button'
import { useResetPassword } from '@/hooks/auth/forgotPassword'
import { useSignUp } from '@/hooks/auth/use-signup'
import { cn } from '@/lib/utils'
import type { ResetPasswordProps } from '@/schema/auth'
import React from 'react'
import { useFormContext } from 'react-hook-form'


const ForgetPasswordHandeler = ({ currentStep, setCurrentStep }: { currentStep: number, setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) => {
    const { formState, getFieldState, getValues } = useFormContext<ResetPasswordProps>()
    const { isDirty: isEmail } = getFieldState('email', formState)
    const { isDirty: isPassword } = getFieldState('password', formState)
    const { isDirty: isConfirmPassword } = getFieldState('confirmPassword', formState)
    const { isDirty: isOtp } = getFieldState('otp', formState)
    const { onGenerateOtp, onVerify, loading } = useResetPassword()
    switch (currentStep) {
        case 1:
            return (
                <Button type='button' variant={"outline"} className={cn("rounded-full ", loading && "cursor-not-allowed")} disabled={loading}
                    {...(
                        isEmail &&
                        {
                            onClick: (e) => {
                                e.preventDefault();
                                onGenerateOtp(
                                    getValues('email'),
                                    setCurrentStep
                                );
                            }
                        })}
                >{loading ? "Sending..." : "Send Verification Code"}</Button>
            )
        case 2:
            return (
                <Button type='button' className={cn("rounded-full ", loading && "cursor-not-allowed")} disabled={loading}
                    {...(

                        // isOtp &&

                        {
                            onClick: (e) => {
                                e.preventDefault();
                                onVerify(
                                    getValues('email'),
                                    getValues('otp'),
                                    setCurrentStep
                                );
                            }
                        })} >{loading ? "Verifying..." : "Verify OTP"}</Button>
            )


    }
    return (
        <Button type='submit' className={cn("rounded-full ", loading && "cursor-not-allowed")} disabled={loading}
        >{loading ? "Resetting..." : "Reset Password"}</Button>
    )
}

export default ForgetPasswordHandeler