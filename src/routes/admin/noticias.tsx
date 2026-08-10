import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { newsFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'
export const Route = createFileRoute('/admin/noticias')({ loader: () => getAdminResource({ data: { resource: 'news' } }), component: Page })
function Page() { const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>); return <ResourceManager title="Noticias" description="Publique información municipal por categoría." resource="news" rows={rows} fields={newsFields} displayKeys={['title', 'category']} /> }

