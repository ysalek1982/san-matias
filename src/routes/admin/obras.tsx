import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { workFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'
export const Route = createFileRoute('/admin/obras')({ loader: () => getAdminResource({ data: { resource: 'works' } }), component: Page })
function Page() { const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>); return <ResourceManager title="Obras" description="Administre proyectos, estados y avance físico." resource="works" rows={rows} fields={workFields} displayKeys={['title', 'location']} /> }

