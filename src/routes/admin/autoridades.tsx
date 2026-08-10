import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { authorityFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'
export const Route = createFileRoute('/admin/autoridades')({ loader: () => getAdminResource({ data: { resource: 'authorities' } }), component: Page })
function Page() { const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>); return <ResourceManager title="Autoridades" description="Actualice perfiles y estructura organizacional." resource="authorities" rows={rows} fields={authorityFields} displayKeys={['full_name', 'position']} /> }

