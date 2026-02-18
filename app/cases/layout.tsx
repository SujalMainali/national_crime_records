import DashboardLayout from '@/components/DashboardLayout';

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
