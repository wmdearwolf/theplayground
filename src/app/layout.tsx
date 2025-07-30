import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import Navigation from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Learning Adventure',
  description: 'An educational app for kids to learn and have fun!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}