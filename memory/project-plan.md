# Lenawee Event Finder - Project Plan

## Overview
Full-featured event finder for Lenawee County, Michigan. Personal use for family + portfolio showpiece.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  thecoelab.com/events - Next.js 14, mobile-friendly        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  Neo4j (192.168.86.196:7687)                               │
│  - Events, venues, categories, cached searches            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE                            │
│  Scheduled jobs (cron) to:                                 │
│  - Scan multiple event sources                             │
│  - Validate with LLM (Ollama Cloud)                       │
│  - Store/update Neo4j                                      │
│  - Remove stale events                                     │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind (same as thecoelab.com)
- **Database**: Neo4j (already running at 192.168.86.196:7687)
- **API Layer**: Next.js API routes (server-side)
- **Data Pipeline**: Node.js scripts (scheduled via cron)
- **LLM**: Ollama Cloud (glm-5.1 for validation/parsing)
- **Hosting**: Docker on Unraid

## Neo4j Schema

```cypher
// Event nodes
(:Event {
  id: UUID,
  title: String,
  description: String,
  startDate: DateTime,
  endDate: DateTime,
  time: String,
  price: String,
  familyFriendly: Boolean,
  sourceUrl: String,
  imageUrl: String,
  status: String,  // active, cancelled, past
  createdAt: DateTime,
  updatedAt: DateTime,
  lastValidated: DateTime
})

// Venue nodes
(:Venue {
  id: UUID,
  name: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  latitude: Float,
  longitude: Float,
  type: String
})

// Category nodes
(:Category {
  id: UUID,
  name: String,
  slug: String,
  icon: String,
  color: String
})

// Source nodes (where events come from)
(:Source {
  id: UUID,
  name: String,
  type: String,  // api, scraper, manual
  url: String,
  reliability: Float,
  lastScraped: DateTime
})

// Relationships
(:Event)-[:AT]->(:Venue)
(:Event)-[:IN_CATEGORY]->(:Category)
(:Event)-[:FROM_SOURCE]->(:Source)
(:Venue)-[:IN_CITY]->(:City)
```

## Event Categories
1. 🎭 Arts & Entertainment
2. 🎵 Music & Concerts
3. 🏃 Sports & Recreation
4. 👨‍👩‍👧 Family & Kids
5. 🍽️ Food & Dining
6. 🏛️ Community & Government
7. 📚 Education & Learning
8. 🌳 Outdoors & Nature
9. 🎉 Festivals & Fairs
10. 💼 Business & Networking
11. 🎮 Gaming & Hobbies
12. ❤️ Charity & Volunteering

## Data Pipeline

### Phase 1: Initial Load
- Scan all configured sources
- Parse and validate with LLM
- Store in Neo4j
- Build frontend

### Phase 2: Ongoing Updates (Cron)
- Every 6 hours: Scan for new events
- Daily: Validate existing events
- Weekly: Clean up past events
- On-demand: Manual refresh button

### Event Sources (Priority Order)
1. **Local Newspapers**
   - Tecumseh Herald
   - Adrian Daily Telegram
   - Blissfield Advance

2. **Event Platforms**
   - Eventbrite API
   - Facebook Events (via scraper)
   - Meetup API

3. **Government/Schools**
   - Lenawee County events calendar
   - Tecumseh Public Schools
   - Adrian Public Schools
   - Siena Heights University

4. **Venue Websites**
   - Croswell Opera House
   - Adrian College
   - Hidden Lake Gardens
   - Indian Creek Zoo

5. **Social Media**
   - Local Facebook groups
   - Community calendars

## API Endpoints

### Frontend API Routes
```
GET /api/events - List events (with filters)
GET /api/events/:id - Single event
GET /api/categories - List categories
GET /api/venues - List venues
GET /api/sources - List sources (for transparency)
POST /api/admin/refresh - Trigger data refresh (future)
```

### Internal Pipeline Scripts
```
/scripts/fetch-events.ts - Main data fetcher
/scripts/validate-events.ts - LLM validation
/scripts/cleanup-events.ts - Remove stale events
/scripts/init-db.ts - Initialize Neo4j schema
```

## Deployment Path
1. Build in workspace
2. Test locally
3. Push to GitHub: thecoelab/lenawee-county-event-finder
4. Build Docker image
5. Push to Docker Hub: thecoelab/lenawee-event-finder
6. Deploy to Unraid
7. Configure nginx for thecoelab.com/events

## File Structure
```
lenawee-events/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (main events page)
│   ├── api/
│   │   ├── events/route.ts
│   │   ├── categories/route.ts
│   │   └── venues/route.ts
│   └── events/
│       └── [id]/page.tsx (event detail)
├── components/
│   ├── EventCard.tsx
│   ├── EventList.tsx
│   ├── FilterBar.tsx
│   ├── Header.tsx
│   ├── CategoryFilter.tsx
│   ├── DateFilter.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── neo4j.ts
│   ├── event-sources/
│   │   ├── index.ts
│   │   ├── eventbrite.ts
│   │   ├── facebook.ts
│   │   ├── newspapers.ts
│   │   └── venues.ts
│   └── llm-parser.ts
├── scripts/
│   ├── init-db.ts
│   ├── fetch-events.ts
│   ├── validate-events.ts
│   └── cleanup-events.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

## Success Criteria
- ✅ Live URL working (thecoelab.com/events)
- ✅ Events displaying for next 30 days
- ✅ Mobile-friendly, responsive design
- ✅ Filtering by category, date, location
- ✅ Search by keyword
- ✅ Fast (no external API calls on page load)
- ✅ Data persisted in Neo4j
- ✅ Background jobs updating events
- ✅ GitHub repo updated
- ✅ Docker image pushed to Docker Hub
- ✅ Deployed to Unraid