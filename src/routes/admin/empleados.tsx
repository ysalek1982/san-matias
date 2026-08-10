import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { hrEmployeeFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'

export const Route = createFileRoute('/admin/empleados')({
  loader: () => getAdminResource({ data: { resource: 'hr_employees' } }),
  component: Page,
})

function Page() {
  const rows = Route.useLoaderData().map((row) => row as unknown as Record<string, unknown>)
  return (
    <ResourceManager
      title="Gestión de Personal"
      description="Administre la nómina de empleados del municipio."
      resource="hr_employees"
      rows={rows}
      fields={hrEmployeeFields}
      displayKeys={['first_name', 'identity_document']}
    />
  )
}
