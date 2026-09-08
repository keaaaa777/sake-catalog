'use client'

import { useEffect, useState } from 'react'

interface ShareButtonsProps {
  url: string
  text: string
}

export default function ShareButtons({ url, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === 'function')
  }, [])

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: text, url })
    } catch {
      // ユーザーがキャンセルした場合は何もしない
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボード権限が無い環境では何もしない
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="content-mall-btn inline-block"
      >
        Xでシェア
      </a>
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        className="content-mall-btn inline-block"
        style={{ borderColor: 'rgba(6, 199, 85, 0.5)' }}
      >
        LINEでシェア
      </a>
      {canNativeShare && (
        <button type="button" onClick={handleNativeShare} className="content-mall-btn inline-block">
          その他でシェア
        </button>
      )}
      <button type="button" onClick={handleCopy} className="content-mall-btn inline-block">
        {copied ? 'コピーしました✓' : 'リンクをコピー'}
      </button>
    </div>
  )
}
