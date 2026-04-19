'use client';

import { RouteGuard } from '@/core/guards';
import { ERole } from '@/shared/types';

export default function AttendantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard role={ERole.ATTENDANT}>{children}</RouteGuard>;
}
