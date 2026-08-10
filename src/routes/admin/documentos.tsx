import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { documentFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'
export const Route = createFileRoute('/admin/documentos')({ loader: () => getAdminResource({ data: { resource: 'documents' } }), component: Page })
function Page() { const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>); return <ResourceManager title="Documentos" description="Gestione POA y resoluciones descargables." resource="documents" rows={rows} fields={documentFields} displayKeys={['title', 'category']} /> }

