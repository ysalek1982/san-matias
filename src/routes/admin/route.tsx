import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentAdmin } from '@/server/admin'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => { const profile = await getCurrentAdmin(); if (!profile) throw redirect({ to: '/login' }); return { profile } },
  component: AdminLayout,
})

function AdminLayout() { const { profile } = Route.useRouteContext(); return <AdminShell profile={profile}><Outlet /></AdminShell> }

