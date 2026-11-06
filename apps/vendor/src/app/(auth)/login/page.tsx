'use client'
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/auth/use-sign"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import LOGO from "@/components/logo/logo"
import { useCurrentUser } from "@/services/queryes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import { MessageModal } from "@/app/(dashboard)/(categories)/rooms/_components/RoomsListing"
import { PageSkeleton } from "@/app/(dashboard)/(categories)/rooms/_components/details.skeleton"
import { useAuthStore } from "@/stores/auth.store"
export default function LoginPage() {
  const router = useRouter()
  const { data, isLoading } = useCurrentUser()
  const { draft } = useAuthStore()
  useEffect(() => {
    if (isLoading) return;

    const user = data?.data;
    const isVendor = Boolean(user && (user.vendor || user.role === "vendor" || user.isVendor));
    const hasVendorToken = typeof window !== "undefined" && Boolean(localStorage.getItem(vendorAccessToken));

    if (hasVendorToken && isVendor) {
      if (draft || localStorage.getItem("status") === "draft") {
        router.push("/signup/process")
      } else {
        router.push("/dashboard")
      }
    }
  }, [data, isLoading, draft, router])

  return (
    <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
      <Suspense fallback={<PageSkeleton />}>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}


import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { vendorAccessToken } from "@/services/auth"
import trivlloData from "@/../trivllo.json"

function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { onHandleSubmit, methods, loading } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...methods}>
        <form onSubmit={onHandleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex items-center justify-center rounded-md">
                  <LOGO />
                </div>
                <span className="sr-only">{trivlloData.company_name} Vendor</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to {trivlloData.company_name} Vendor</h1>
              <FieldDescription>
                Don&apos;t have an account? <a href="/signup">Sign up</a>
              </FieldDescription>
            </div>
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
            <Field>
              <FormField
                control={methods.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="/resetpassword"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          disabled={loading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none disabled:opacity-50"
                          aria-label={showPassword ? "Hide password" : "Show password"}
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
              <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Login"}</Button>
            </Field>
          </FieldGroup>
        </form>
      </Form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}