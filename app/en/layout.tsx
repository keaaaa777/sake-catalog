import WaterBackground from '@/components/WaterBackground'
import EnSiteHeader from '@/components/EnSiteHeader'
import EnSiteFooter from '@/components/EnSiteFooter'
import AgeGate from '@/components/AgeGate'
import SetHtmlLang from '@/components/SetHtmlLang'

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SetHtmlLang lang="en" />
      <WaterBackground />
      <EnSiteHeader />
      <main className="content-page animate-fade-in">{children}</main>
      <EnSiteFooter />
      <AgeGate lang="en" />
    </>
  )
}
