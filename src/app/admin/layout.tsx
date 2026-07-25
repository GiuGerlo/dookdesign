import { AdminThemeLock } from '@/components/admin/AdminThemeLock'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="dark" style={{ minHeight: '100dvh' }}>
      <AdminThemeLock />
      {children}
    </div>
  )
}
