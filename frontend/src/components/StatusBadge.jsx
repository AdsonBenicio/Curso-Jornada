import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function StatusBadge({ status }) {
  const suspicious = status === 'suspicious'
  return <span className={suspicious ? 'status-badge suspicious' : 'status-badge approved'}>{suspicious ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}{suspicious ? 'Suspeita' : 'Aprovada'}</span>
}
