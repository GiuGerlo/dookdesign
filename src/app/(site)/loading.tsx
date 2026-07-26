// Skeleton de carga del sitio público (suspense nativo de Next mientras el server trae la data).
export default function SiteLoading() {
  return (
    <div className="min-h-svh" aria-busy="true" aria-label="Cargando">
      <div className="relative h-[560px] overflow-hidden md:h-svh">
        <div className="img-skeleton" />
      </div>
      <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-20 md:px-16">
        <div className="relative mx-auto h-6 w-40 overflow-hidden rounded">
          <div className="img-skeleton" />
        </div>
        <div className="relative mx-auto h-24 w-full max-w-[680px] overflow-hidden rounded">
          <div className="img-skeleton" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-10 md:grid-cols-3 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
              <div className="img-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
