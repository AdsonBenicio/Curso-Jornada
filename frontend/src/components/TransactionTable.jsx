import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const ruleLabels = { high_amount: 'Valor alto', repeated_transaction: 'Repetição', new_destination_account: 'Conta nova', unusual_hour: 'Horário incomum' }
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function TransactionTable({ transactions, compact = false }) {
  return <div className="table-wrap"><table><thead><tr><th>ID / data</th><th>Origem</th><th>Destino</th><th>Valor</th><th>Regras acionadas</th><th>Status</th><th aria-label="Abrir" /></tr></thead><tbody>{transactions.length ? transactions.map((item) => <tr key={item.id}><td><Link className="transaction-id" to={`/transactions/${item.id}`}>#{item.id}</Link><small>{date.format(new Date(item.occurred_at))}</small></td><td><span className="account-pill">{item.account_id}</span></td><td><span className="account-pill">{item.destination_account_id}</span></td><td><strong className={item.status === 'suspicious' ? 'amount-risk' : ''}>{money.format(item.amount)}</strong></td><td><div className="rule-list">{item.triggered_rules?.length ? item.triggered_rules.slice(0, compact ? 1 : 3).map((rule) => <span key={rule} className="rule-tag">{ruleLabels[rule] || rule}</span>) : <span className="muted">Nenhuma</span>}{compact && item.triggered_rules?.length > 1 && <span className="more-rules">+{item.triggered_rules.length - 1}</span>}</div></td><td><StatusBadge status={item.status} /></td><td><Link className="row-action" to={`/transactions/${item.id}`} aria-label={`Ver transação ${item.id}`}><ExternalLink size={15} /></Link></td></tr>) : <tr><td colSpan="7" className="empty-state">Nenhuma transação encontrada.</td></tr>}</tbody></table></div>
}
