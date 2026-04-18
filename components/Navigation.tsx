'use client'

import Link from 'next/link'

interface NavigationProps {
  currentPath: string
}

export default function Navigation({ currentPath }: NavigationProps) {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 100,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
      }}>
        <Link href="/" style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.5rem',
          fontWeight: 500,
          color: '#FF6B35',
          textDecoration: 'none',
        }}>
          Lenawee Events
        </Link>

        <div style={{ display: 'flex', gap: '32px' }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: currentPath === link.href ? '#00D4AA' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontWeight: currentPath === link.href ? 600 : 400,
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}