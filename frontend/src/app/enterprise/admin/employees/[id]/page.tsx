"use client";

import { EmployeeProfilePage } from '@/features/enterprise-admin';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <EmployeeProfilePage employeeId={params.id} />;
}
