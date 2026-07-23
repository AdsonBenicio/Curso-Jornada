import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createTransaction, getRules, getTransactions, updateRules } from '../api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    Promise.all([getTransactions(), getRules()]).then(([transactionResult, rulesResult]) => {
      setTransactions(transactionResult.data)
      setRules(rulesResult.data)
      setIsMock(transactionResult.isMock || rulesResult.isMock)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = (message, tone = 'success') => setToast({ message, tone })
  const addTransaction = async (payload) => {
    const result = await createTransaction(payload)
    setTransactions((current) => [result.data, ...current])
    setIsMock((current) => current || result.isMock)
    notify(result.data.status === 'suspicious' ? 'Transação registrada e sinalizada para análise.' : 'Transação registrada com sucesso.', result.data.status === 'suspicious' ? 'warning' : 'success')
    return result.data
  }
  const saveRules = async (nextRules) => {
    const result = await updateRules(nextRules)
    setRules(result.data)
    setIsMock((current) => current || result.isMock)
    notify('Regras de detecção atualizadas.')
  }

  const value = useMemo(() => ({ transactions, rules, loading, isMock, toast, notify, addTransaction, saveRules }), [transactions, rules, loading, isMock, toast])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
