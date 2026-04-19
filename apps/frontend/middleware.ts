import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes accessible without a Clerk session
const isPublicRoute = createRouteMatcher([
    '/',                        // landing page
    '/auth/sign-in(.*)',        // Clerk sign-in (doctor)
    '/auth/sign-up(.*)',        // Clerk sign-up (doctor)
    '/auth/patient(.*)',        // patient phone-based login
    '/dashboard/patient(.*)',   // patient dashboard — uses its own JWT auth, not Clerk
    '/api/public(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static assets (including video — must bypass Clerk or playback breaks)
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|ogg|m4v)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};