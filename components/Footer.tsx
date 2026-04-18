import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0a0f',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '48px 24px',
      marginTop: '64px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.25rem',
            color: '#FF6B35',
            marginBottom: '16px',
          }}>
            Lenawee County Events
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.6,
          }}>
            Discover what&apos;s happening in Lenawee County, Michigan. Events, activities, and community gatherings all in one place.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#00D4AA', marginBottom: '16px' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>Home</Link>
            <Link href="/events" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>All Events</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#00D4AA', marginBottom: '16px' }}>About</h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
            Part of <Link href="https://thecoelab.com" style={{ color: '#FF6B35' }}>The Coe Lab</Link> — 
            a digital workshop exploring AI, automation, and technology.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '32px auto 0',
        paddingTop: '32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.875rem',
      }}>
        © {new Date().getFullYear()} The Coe Lab. All rights reserved.
      </div>
    </footer>
  )
}