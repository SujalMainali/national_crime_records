import DashboardLayout from '@/components/DashboardLayout';

export default function EvidenceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
