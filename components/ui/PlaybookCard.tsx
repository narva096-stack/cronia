'use client'

import { useState } from 'react'
import type { Playbook } from '@/types'

export default function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleCopy(e?: React.MouseEvent) {
    e?.stopPropagation()
    await navigator.clipboard.writeText(playbook.prompt_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="border transition-all"
      style={{
        borderColor: copied ? 'rgba(200,255,0,0.35)' : 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      {/* ── Header row ── */}
      <div
        className="flex items-start justify-between gap-6 px-6 py-5 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-[#F5F5F5] leading-tight">
            {playbook.title}
          </h3>
          {(playbook.objective || playbook.description) && (
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'rgba(245,245,245,0.45)' }}>
              {playbook.objective || playbook.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
          <button
            onClick={handleCopy}
            className="text-xs font-black tracking-[0.12em] uppercase px-5 py-2.5 transition-all"
            style={{
              background: copied ? '#C8FF00' : 'transparent',
              color: copied ? '#000' : '#C8FF00',
              border: '1px solid',
              borderColor: copied ? '#C8FF00' : 'rgba(200,255,0,0.35)',
            }}
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>

          <span
            className="text-sm transition-transform duration-200 inline-block"
            style={{
              color: 'rgba(245,245,245,0.25)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ↓
          </span>
        </div>
      </div>

      {/* ── Prompt expandido ── */}
      {expanded && (
        <div className="px-6 pb-5">
          <div
            className="border-l-2 px-5 py-4"
            style={{ borderColor: '#C8FF00', background: 'rgba(0,0,0,0.35)' }}
          >
            <p
              className="text-xs font-black tracking-[0.2em] uppercase mb-3"
              style={{ color: 'rgba(200,255,0,0.5)' }}
            >
              Prompt completo
            </p>
            <pre
              className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
              style={{
                color: 'rgba(245,245,245,0.7)',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              {playbook.prompt_content}
            </pre>
            {playbook.when_to_use && (
              <p className="mt-4 text-xs" style={{ color: 'rgba(245,245,245,0.35)' }}>
                <span className="font-black tracking-[0.1em] uppercase" style={{ color: 'rgba(200,255,0,0.5)' }}>Cuándo usarlo: </span>
                {playbook.when_to_use}
              </p>
            )}
            <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                onClick={handleCopy}
                className="text-xs font-black tracking-[0.15em] uppercase px-6 py-3"
                style={{ background: '#C8FF00', color: '#000' }}
              >
                {copied ? '¡Copiado! ✓' : 'Copiar prompt →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
