'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin/dashboard')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="surface p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-widest text-ink">
              CYBER<span className="text-accent-2">LOG</span>
            </h1>
            <p className="text-ink-muted/60 text-sm mt-1 tracking-wide">管理员登录</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted/70 text-xs tracking-widest uppercase">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-panel-2 border border-line rounded-xl px-4 py-2.5 text-ink text-sm outline-none focus:border-accent/40 transition-colors placeholder:text-ink-muted/30"
                placeholder="admin"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink-muted/70 text-xs tracking-widest uppercase">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-panel-2 border border-line rounded-xl px-4 py-2.5 text-ink text-sm outline-none focus:border-accent/40 transition-colors placeholder:text-ink-muted/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-accent text-xs text-center bg-accent/8 border border-accent/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-xl bg-accent/12 border border-accent/30 text-ink text-sm font-medium tracking-wide hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
