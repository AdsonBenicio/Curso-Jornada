import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, detail, icon: Icon, tone = 'neutral', trend }) {
  return <div className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><strong>{value}</strong><div className="stat-bottom">{trend && <span className={trend.startsWith('-') ? 'trend down' : 'trend'}>{trend.startsWith('-') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{trend}</span>}<span>{detail}</span></div></div>
}
