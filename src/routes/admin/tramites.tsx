import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { proceduresFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'

export const Route = createFileRoute('/admin/tramites')({
  loader: () => getAdminResource({ data: { resource: 'procedures' } }),
  component: Page,
})

function Page() {
  const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>)
  return (
    <ResourceManager
      title="Trámites y Servicios"
      description="Gestione los requisitos, costos y tiempos de los trámites municipales."
      resource="procedures"
      rows={rows}
      fields={proceduresFields}
      displayKeys={['title', 'category']}
    />
  )
}
