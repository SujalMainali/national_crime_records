import DashboardLayout from '@/components/DashboardLayout';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
