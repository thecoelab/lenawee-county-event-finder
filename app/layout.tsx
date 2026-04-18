export const metadata = {
  title: 'Lenawee Events',
  description: 'Discover events, activities, and happenings in Lenawee County, Michigan',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#0a0a0f',
        color: '#ffffff',
      }}>
        {children}
      </body>
    </html>
  )
}