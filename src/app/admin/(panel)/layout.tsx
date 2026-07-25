import { AdminNav } from '@/components/admin/AdminNav'
import { AdminBottomNav } from '@/components/admin/AdminBottomNav'
import { Toaster } from 'sileo'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <AdminNav />
      <main className="flex-1 md:ml-[220px] p-6 md:p-10 pb-24 md:pb-10">
        {children}
      </main>
      <AdminBottomNav />
      <Toaster position="top-center" />
    </div>
  )
}
