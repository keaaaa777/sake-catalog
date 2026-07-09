import WaterBackground from '@/components/WaterBackground'
import SiteHeader from '@/components/SiteHeader'

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WaterBackground />
      <SiteHeader />
      <main className="content-page animate-fade-in">{children}</main>
    </>
  )
}
