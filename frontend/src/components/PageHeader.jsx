import { ArrowUpRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <Link className="button primary" to={action.to}><Plus size={17} />{action.label}<ArrowUpRight size={15} /></Link>}</div>
}
