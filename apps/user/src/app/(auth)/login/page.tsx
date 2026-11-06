'use client'
import { ResetPassword, SignInForm, SignupForm } from '@/components/auth/_components/sign-in-hover'
import AuthContextProvider from '@/context/auth/auth-form-provider'
import ResetPasswordContextProvider from '@/context/auth/resetpasswordsteps'
import React from 'react'

type Props = {}

const LoginPage = (props: Props) => {
    const [tag, setTag] = React.useState<"Log-in" | "Sign-up" | "ResetPassword">("Log-in");
    return (
        <div className='w-full h-full flex justify-center items-center'>
            {tag === "Sign-up" ? (
                <AuthContextProvider>
                    <SignupForm setTag={setTag} />
                </AuthContextProvider>
            ) : tag === "ResetPassword" ? (
                <ResetPasswordContextProvider>
                    <ResetPassword setTag={setTag} />
                </ResetPasswordContextProvider>
            ) : (
                <SignInForm setTag={setTag} />
            )}
        </div>
    )
}

export default LoginPage