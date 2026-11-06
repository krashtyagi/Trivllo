import { Button } from '@/components/ui/button'
import { useSignUp } from '@/hooks/auth/use-signup'
import { cn } from '@/lib/utils'
import type { SignUpProps } from '@/schema/auth'
import React from 'react'
import { useFormContext } from 'react-hook-form'


const ButtonHandler = ({ currentStep, setCurrentStep }: { currentStep: number, setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) => {
  const { formState, getFieldState, getValues } = useFormContext<SignUpProps>()
  const { isDirty: isEmail } = getFieldState('email', formState)
  const { isDirty: isPassword } = getFieldState('password', formState)
  const { isDirty: isConfirmPassword } = getFieldState('confirmPassword', formState)
  const { onGenerateOtp, loading } = useSignUp()
  switch (currentStep) {
    case 1:
      return (
        <Button type='submit' variant={"outline"} className={cn("rounded-full ", loading && "cursor-not-allowed")} disabled={loading}
          {...(
            isEmail &&
            isPassword &&
            isConfirmPassword && {
              onClick: () =>
                onGenerateOtp(
                  getValues('email'),
                  getValues('password'),
                  setCurrentStep
                ),
            })}
        >{loading ? "Generating otp..." : "Get otp"}</Button>
      )


  }
  return (
    <Button type='submit' className={cn("rounded-full ", loading && "cursor-not-allowed")} disabled={loading} >{loading ? "Creating account..." : "create account"}</Button>
  )
}

export default ButtonHandler