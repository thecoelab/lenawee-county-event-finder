'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Types
interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  price: string
  familyFriendly: boolean
  sourceUrl: string
  venue: {
    name: string
    address: string
    city: string
  }
  category: {
    name: string
    slug: string
    icon: string
    color: string
  }
  source: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, catsRes, citiesRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/events/categories'),
          fetch('/api/events/cities')
        ])
        
        if (!eventsRes.ok) throw new Error('Failed to fetch events')
        if (!catsRes.ok) throw new Error('Failed to fetch categories')
        if (!citiesRes.ok) throw new Error('Failed to fetch cities')
        
        const eventsData = await eventsRes.json()
        const catsData = await catsRes.json()
        const citiesData = await citiesRes.json()
        
        setEvents(eventsData)
        setCategories(catsData)
        setCities(citiesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Filter events
  const filteredEvents = events.filter(event => {
    if (selectedCategory && event.category.slug !== selectedCategory) return false
    if (selectedCity && event.venue.city !== selectedCity) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!event.title.toLowerCase().includes(term) && 
          !event.description.toLowerCase().includes(term) &&
          !event.venue.name.toLowerCase().includes(term)) {
        return false
      }
    }
    if (startDate && event.date < startDate) return false
    if (endDate && event.date > endDate) return false
    return true
  })
  
  // Group events by date
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = event.date
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {} as Record<string, Event[]>)
  
  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort()
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
  
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', paddingTop: '80px' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.85) 100%)',
        padding: '64px 24px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2rem, 8vw, 3.5rem)',
          fontWeight: 500,
          color: 'white',
          marginBottom: '16px'
        }}>
          Lenawee County Events
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Discover what&apos;s happening in your community
        </p>
      </section>
      
      {/* Filters */}
      <section style={{
        background: '#1A1A2E',
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {/* Category */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* City */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
        
        {/* Clear Filters */}
        {(selectedCategory || selectedCity || searchTerm || startDate || endDate) && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => {
                setSelectedCategory('')
                setSelectedCity('')
                setSearchTerm('')
                setStartDate('')
                setEndDate('')
              }}
              style={{
                background: 'transparent',
                border: '1px solid #00D4AA',
                color: '#00D4AA',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
      
      {/* Events */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '1.5rem', color: '#00D4AA' }}>Loading events...</div>
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#FF6B35' }}>
            Error: {error}
          </div>
        )}
        
        {!loading && !error && filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '16px' }}>No events found</div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Try adjusting your filters or check back later</p>
          </div>
        )}
        
        {!loading && !error && sortedDates.map(date => (
          <div key={date} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.25rem',
              color: '#00D4AA',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              {formatDate(date)}
            </h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {groupedEvents[date].map(event => (
                <article
                  key={event.id}
                  style={{
                    background: '#1A1A2E',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '1.125rem',
                      color: 'white',
                      margin: 0
                    }}>
                      {event.category.icon} {event.title}
                    </h3>
                    <span style={{
                      background: event.category.color,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {event.price}
                    </span>
                  </div>
                  
                  <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '16px',
                    lineHeight: 1.6
                  }}>
                    {event.description}
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    <div>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>📍 {event.venue.name}</strong>
                      <br />{event.venue.address}
                      <br />{event.venue.city}, MI
                    </div>
                    <div>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>🕐 {event.time}</strong>
                      {event.familyFriendly && (
                        <>
                          <br />👨‍👩‍👧 Family Friendly
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
      
      {/* Stats */}
      {!loading && !error && (
        <section style={{
          background: '#1A1A2E',
          padding: '24px',
          textAlign: 'center'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            Showing {filteredEvents.length} of {events.length} events across {cities.length} cities
          </p>
        </section>
      )}
    </main>
  )
}