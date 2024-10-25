import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Collaborative Code Editor',
  description: 'A real-time collaborative code editor built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='scroll-smooth'>
      
      <body className={`${inter.className} `}>
        {children}
        <Toaster/>
        </body>
      
    </html>
  )
}