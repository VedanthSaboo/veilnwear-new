// components/admin/withAdminAuth.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  const ComponentWithAdminAuth: React.FC<P> = (props) => {
    const { appUser, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-neutral-400">Checking admin access...</p>
        </div>
      );
    }

    if (!appUser || appUser.role !== 'admin') {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="text-sm text-neutral-200">Access denied.</p>
            <p className="text-xs text-neutral-500">
              You must be an admin to view this page.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAdminAuth;
}
