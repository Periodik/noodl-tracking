import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'NOODL Tracking - Ramen Shop Inventory Management',
  description: 'Complete inventory and shelf-life tracking system for ramen shop toppings',
  keywords: 'inventory, ramen, restaurant, tracking, food safety, expiry',
  authors: [{ name: 'NOODL Tracking' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="min-h-screen bg-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}