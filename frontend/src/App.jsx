import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Activity, Bell, ChevronRight, FilePlus2, LayoutDashboard, Menu, Moon, Settings2, ShieldAlert, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransactionDetails from './pages/TransactionDetails'
import NewTransaction from './pages/NewTransaction'
import Rules from './pages/Rules'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transações', icon: Activity },
  { to: '/transactions/new', label: 'Nova transação', icon: FilePlus2 },
  { to: '/rules', label: 'Regras de detecção', icon: Settings2 },
]

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const location = useLocation()
  const { isMock, toast, transactions } = useApp()
  const current = navigation.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))
  return <div className={dark ? 'app-shell dark' : 'app-shell'}>
    <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><ShieldAlert size={20} /></div><div><strong>Suspeita<span>Bank</span></strong><small>Risk intelligence</small></div><button className="icon-button close-menu" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={18} /><span>{label}</span>{label === 'Transações' && <span className="nav-count">{transactions.length}</span>}</NavLink>)}</nav>
      <div className="sidebar-footer"><div className="status-line"><span className="pulse-dot" /> Sistema operacional</div><div className="user-row"><div className="avatar">AS</div><div><strong>Analista de risco</strong><small>Operações</small></div><ChevronRight size={15} /></div></div>
    </aside>
    {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />}
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{current?.label || 'Visão geral'}</strong></div><div className="top-actions"><span className={isMock ? 'connection mock' : 'connection'}><span />{isMock ? 'Modo demonstração' : 'API conectada'}</span><button className="icon-button notification" aria-label="Notificações"><Bell size={18} /><i /></button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>
      <div className="page-content">{children}</div>
    </main>
    {toast && <div className={`toast ${toast.tone}`}><span className="toast-icon">{toast.tone === 'warning' ? '!' : '✓'}</span>{toast.message}</div>}
  </div>
}

export default function App() { return <Layout><Routes><Route path="/" element={<Dashboard />} /><Route path="/transactions" element={<Transactions />} /><Route path="/transactions/new" element={<NewTransaction />} /><Route path="/transactions/:id" element={<TransactionDetails />} /><Route path="/rules" element={<Rules />} /></Routes></Layout> }
