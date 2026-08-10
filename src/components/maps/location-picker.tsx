import { Crosshair, LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

const SAN_MATIAS_LAT = -16.3615
const SAN_MATIAS_LNG = -58.4069

type Coordinates = { latitude: number; longitude: number; accuracy?: number }

export function LocationPicker() {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: SAN_MATIAS_LAT,
    longitude: SAN_MATIAS_LNG,
  })
  const [isCustomPoint, setIsCustomPoint] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function locateGPS() {
    if (!navigator.geolocation) {
      setError('Este dispositivo no permite obtener la ubicación GPS.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setIsCustomPoint(true)
        setLocating(false)
      },
      (locationError) => {
        setLocating(false)
        setError(
          locationError.code === locationError.PERMISSION_DENIED
            ? 'Permiso de ubicación denegado. Se mantienen las coordenadas de San Matías.'
            : 'No pudimos obtener la ubicación GPS. Intente al aire libre.',
        )
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    )
  }

  function resetToSanMatias() {
    setCoordinates({ latitude: SAN_MATIAS_LAT, longitude: SAN_MATIAS_LNG })
    setIsCustomPoint(false)
    setError(null)
  }

  const embedUrl = `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=16&output=embed`

  return (
    <div className="grid gap-3 sm:col-span-2">
      {/* Hidden inputs to save coordinates in the form submit */}
      <input type="hidden" name="latitude" value={coordinates.latitude} />
      <input type="hidden" name="longitude" value={coordinates.longitude} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-forest-950 flex items-center gap-1.5">
            <MapPin className="size-4 text-sky-600" />
            Ubicación en San Matías, Santa Cruz, Bolivia
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isCustomPoint
              ? 'Punto personalizado registrado para la inspección municipal.'
              : 'Posicionado por defecto en San Matías. Se guardarán estas coordenadas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCustomPoint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetToSanMatias}
              className="rounded-full border-forest-900/15 text-xs"
            >
              <RefreshCw className="size-3.5 mr-1" />
              Restablecer a San Matías
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={locateGPS}
            disabled={locating}
            className="rounded-full bg-forest-50 border-forest-900/15 text-xs font-semibold text-forest-900"
          >
            <LocateFixed className="size-3.5 mr-1 text-sky-600" />
            {locating ? 'Obteniendo GPS…' : 'Usar mi GPS actual'}
          </Button>
        </div>
      </div>

      {/* Map display centered on San Matías */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-forest-900/15 bg-forest-100 shadow-sm h-72">
        <iframe
          src={embedUrl}
          title="Mapa de San Matías, Santa Cruz, Bolivia"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />

        {/* Map badges */}
        <div className="pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-4rem)] items-center gap-2 rounded-full bg-forest-950/90 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur">
          <MapPin className="size-3.5 shrink-0 text-earth-300" />
          <span className="truncate">
            {isCustomPoint ? 'Ubicación GPS seleccionada' : 'San Matías, Santa Cruz, Bolivia'}
          </span>
        </div>

        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold text-forest-900 shadow backdrop-blur">
          Lat: {coordinates.latitude.toFixed(5)}, Lng: {coordinates.longitude.toFixed(5)}
        </span>
      </div>

      {coordinates.accuracy && (
        <div className="flex items-center gap-2 rounded-xl bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-900">
          <Crosshair className="size-4" />
          Precisión GPS: {Math.round(coordinates.accuracy)} metros
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-amber-100 px-4 py-2.5 text-xs font-semibold text-amber-900">
          {error}
        </p>
      )}
    </div>
  )
}
