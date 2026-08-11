import { createFileRoute } from '@tanstack/react-router'

import { homeBannerFields } from '@/components/admin/resource-config'
import { ResourceManager } from '@/components/admin/resource-manager'
import { getAdminResource } from '@/server/admin'

export const Route = createFileRoute('/admin/banners')({
  loader: () => getAdminResource({ data: { resource: 'home_banners' } }),
  component: BannersPage,
})

function BannersPage() {
  const data = Route.useLoaderData()
  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : []

  return (
    <ResourceManager
      title="Portada y atractivos"
      description="Administre desde aquí las imágenes, títulos, enlaces y el orden de los atractivos que aparecen en la página de inicio."
      resource="home_banners"
      rows={rows}
      fields={homeBannerFields}
      displayKeys={['title', 'eyebrow', 'sort_order']}
    />
  )
}
