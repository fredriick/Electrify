import { SupplierProtectedRoute } from '@/components/auth/SupplierProtectedRoute';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupplierProtectedRoute>
      {children}
    </SupplierProtectedRoute>
  );
} 