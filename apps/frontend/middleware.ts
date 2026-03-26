import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes accessible without a Clerk session
const isPublicRoute = createRouteMatcher([
    '/',                        // landing page
    '/auth/sign-in(.*)',        // Clerk sign-in
    '/auth/sign-up(.*)',        // Clerk sign-up
    '/dashboard/patient(.*)',   // patients use their own OTP-based auth
    '/api/public(.*)',          // any explicitly public API endpoints
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};