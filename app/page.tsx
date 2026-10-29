import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'
import HomeSakeIndex from '@/components/HomeSakeIndex'

export const metadata: Metadata = {
  title: '雫 SAKE SELECT|日本酒を産地・味わい・診断で探せる日本酒カタログ',
}

export default function Home() {
  return (
    <HomeClient>
      <HomeSakeIndex />
    </HomeClient>
  )
}
