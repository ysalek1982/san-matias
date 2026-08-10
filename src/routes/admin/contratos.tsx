import { createFileRoute } from '@tanstack/react-router'
import { ResourceManager } from '@/components/admin/resource-manager'
import { hrContractFields } from '@/components/admin/resource-config'
import { getAdminResource } from '@/server/admin'

export const Route = createFileRoute('/admin/contratos')({
  loader: () => getAdminResource({ data: { resource: 'hr_contracts' } }),
  component: Page,
})

function Page() {
  const rows = Route.useLoaderData().map((row) => {
    // Para mostrar el nombre del empleado en la tabla, concatenamos si viene el joined object de supabase
    const record = row as unknown as Record<string, unknown>
    const employee = record.hr_employees as Record<string, string> | undefined
    return {
      ...record,
      employee_name: employee ? `${employee.first_name} ${employee.last_name}` : record.employee_id,
    }
  })

  return (
    <ResourceManager
      title="Gestión de Contratos"
      description="Historial de contratos, cargos y asignaciones salariales."
      resource="hr_contracts"
      rows={rows}
      fields={hrContractFields}
      displayKeys={['employee_name', 'position']}
    />
  )
}
