import AuthProvider from "@/context/auth";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthProvider>{children}</AuthProvider>;
}
