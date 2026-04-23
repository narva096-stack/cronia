import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: 'CRONIA · Tu centro de control',
  description: 'Recupera tu tiempo. Opera mejor.',
  icons: { icon: '/favicon.ico' },
  other: {
    'facebook-domain-verification': 'xrh0f94du9gx7qqmx4k0q6ylwvei2y',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  )
}
