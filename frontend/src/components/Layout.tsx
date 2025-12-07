import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar />
      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}

export default Layout
