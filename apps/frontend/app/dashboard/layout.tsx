// ... existing imports ...
import DoctorProfileWrapper from "@/components/DoctorProfileWrapper";
import AuthProvider from "@/context/auth";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}