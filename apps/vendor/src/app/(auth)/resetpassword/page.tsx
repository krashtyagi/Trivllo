'use client'
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useResetPassword } from "@/hooks/auth/forgotPassword"
import LOGO from "@/components/logo/logo"
import trivlloData from "@/../trivllo.json"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import { MessageModal } from "@/app/(dashboard)/(categories)/rooms/_components/RoomsListing"
import { PageSkeleton } from "@/app/(dashboard)/(categories)/rooms/_components/details.skeleton"
import { Eye, EyeOff } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

export default function ResetPasswordPage() {
  return (
    <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
      <Suspense fallback={<PageSkeleton />}>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <ResetPasswordForm />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const { methods, loading, onGenerateOtp, onVerify, onHandleSubmit } = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const email = methods.watch("email")
  const otp = methods.watch("otp")

  const handleSendOtp = async () => {
    if (!email) {
      methods.setError("email", { type: "manual", message: "Email is required" })
      return
    }
    await onGenerateOtp(email, setStep)
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      methods.setError("otp", { type: "manual", message: "OTP must be 4 digits" })
      return
    }
    await onVerify(email, otp, setStep)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...methods}>
        <form onSubmit={onHandleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex items-center justify-center rounded-md">
                  <LOGO />
                </div>
                <span className="sr-only">{trivlloData.company_name} Vendor</span>
              </a>
              <h1 className="text-xl font-bold">Reset Password</h1>
              <FieldDescription>
                {step === 1 && "Enter your email to receive a password reset code."}
                {step === 2 && "Enter the 4-digit code sent to your email."}
                {step === 3 && "Enter your new password."}
              </FieldDescription>
            </div>

            {step === 1 && (
              <Field>
                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>
            )}

            {step === 2 && (
              <Field className="flex flex-col items-center gap-4">
                <FormField
                  control={methods.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className="text-center">Verification Code</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={4}
                          pattern={REGEXP_ONLY_DIGITS}
                          disabled={loading}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>
            )}

            {step === 3 && (
              <>
                <Field>
                  <FormField
                    control={methods.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="New password"
                              disabled={loading}
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={loading}
                              className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <FormField
                    control={methods.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              disabled={loading}
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={loading}
                              className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </>
            )}

            <Field className="mt-2">
              {step === 1 && (
                <Button type="button" onClick={handleSendOtp} disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              )}
              {step === 2 && (
                <Button type="button" onClick={handleVerifyOtp} disabled={loading} className="w-full">
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              )}
              {step === 3 && (
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              )}
            </Field>

            <div className="text-center mt-2">
              <a href="/login" className="text-xs font-semibold text-primary hover:underline">
                Back to Login
              </a>
            </div>
          </FieldGroup>
        </form>
      </Form>
    </div>
  )
}