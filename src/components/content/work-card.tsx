import { Link } from '@tanstack/react-router'
import { MapPin, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Work } from '@/types/database'

type WorkCardProps = {
  work: Pick<Work, 'id' | 'slug' | 'title' | 'summary' | 'location' | 'physical_progress' | 'cover_image_url' | 'status'>
}

export function WorkCard({ work }: WorkCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-forest-900/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-forest-100">
        {work.cover_image_url ? (
          <img
            src={work.cover_image_url}
            alt={work.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-forest-300">
            <span className="font-display font-medium">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-4 left-4 rounded-full bg-forest-950/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
          {work.status.replace('_', ' ')}
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-forest-950">
          {work.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-earth-600">
          <MapPin className="size-3.5" />
          <span>{work.location}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-2">
        <p className="line-clamp-2 text-sm leading-relaxed text-forest-800/70">
          {work.summary}
        </p>
        
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-forest-700">Avance Físico</span>
            <span className="text-forest-950">{work.physical_progress}%</span>
          </div>
          <Progress value={work.physical_progress} className="h-2 bg-forest-100 [&>div]:bg-earth-500" />
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        <Button asChild variant="outline" className="w-full rounded-xl border-forest-200 text-forest-800 hover:bg-forest-50 hover:text-forest-950">
          <Link to="/obras">
            Ir a Obras <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Necesitamos importar Button localmente en este componente
import { Button } from '@/components/ui/button'
