'use client'

import { useEffect } from 'react'

// ルートlayoutの<html lang>は全ページ共通で"ja"固定のため、
// /en配下だけこのコンポーネントでlangをブラウザ側から上書きする。
export default function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang
    document.documentElement.lang = lang
    return () => {
      document.documentElement.lang = prev
    }
  }, [lang])
  return null
}
