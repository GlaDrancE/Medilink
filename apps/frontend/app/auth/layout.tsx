import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider>
            {children}
        </ClerkProvider>
    )
}
export default AuthLayout;