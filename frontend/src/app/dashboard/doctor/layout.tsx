'use client';

import { RouteGuard } from '@/core/guards';
import { ERole } from '@/shared/types';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard role={ERole.DOCTOR}>{children}</RouteGuard>;
}
