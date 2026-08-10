import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { inventoryAssetFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'

export const Route = createFileRoute('/admin/inventario')({
  loader: () => getAdminResource({ data: { resource: 'inventory_assets' } }),
  component: Page,
})

function Page() {
  const rows = Route.useLoaderData().map((row) => {
    // Si viene con el objeto de relacion hr_employees
    const record = row as unknown as Record<string, unknown>
    const employee = record.hr_employees as Record<string, string> | undefined
    return {
      ...record,
      assigned_to_name: employee ? `${employee.first_name} ${employee.last_name}` : (record.assigned_to ? 'Asignado' : 'Sin asignar'),
    }
  })

  return (
    <ResourceManager
      title="Activos Fijos e Inventario"
      description="Registro patrimonial de vehículos, equipos, inmuebles y otros bienes municipales."
      resource="inventory_assets"
      rows={rows}
      fields={inventoryAssetFields}
      displayKeys={['asset_code', 'name', 'category', 'assigned_to_name']}
    />
  )
}
