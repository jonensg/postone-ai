import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: '400',
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Postone — 小紅書 AI 創作工具',
  description: 'AI-powered 小紅書 content generator for HK brands by Chiwa DCM Group',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body className={`${dmSerif.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
