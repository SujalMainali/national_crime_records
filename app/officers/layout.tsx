import DashboardLayout from '@/components/DashboardLayout';

export default function OfficersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
