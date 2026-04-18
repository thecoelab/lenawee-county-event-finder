import neo4j from 'neo4j-driver';
import https from 'https';

// Use environment variables for credentials - NEVER hardcode secrets
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_MODEL = 'glm-5.1';

if (!OLLAMA_API_KEY) {
  console.error('ERROR: OLLAMA_API_KEY environment variable is required');
  process.exit(1);
}

// Neo4j connection - use environment variables
const NEO4J_HOST = process.env.NEO4J_HOST || '192.168.86.196';
const NEO4J_PORT = process.env.NEO4J_PORT || '7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

if (!NEO4J_PASSWORD) {
  console.error('ERROR: NEO4J_PASSWORD environment variable is required');
  process.exit(1);
}

const driver = neo4j.driver(
  `bolt://${NEO4J_HOST}:${NEO4J_PORT}`,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// Call Ollama Cloud for LLM tasks
async function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    });
    
    const options = {
      hostname: 'ollama.com',
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(body);
            resolve(result.response || '');
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Parse events from text using LLM
async function parseEventsWithLLM(text, source) {
  const prompt = `Parse the following event information and return a JSON array of events. Each event should have:
- title: string (event name)
- description: string (brief description)
- date: string (YYYY-MM-DD format)
- time: string (e.g., "7:00 PM" or "All day")
- venue: string (location name)
- address: string (full address if available)
- city: string (city name, default to "Adrian" if not specified)
- category: string (one of: arts-entertainment, music-concerts, sports-recreation, family-kids, food-dining, community-government, education-learning, outdoors-nature, festivals-fairs, business-networking, gaming-hobbies, charity-volunteering)
- price: string (e.g., "Free", "$10", "$25-50")
- familyFriendly: boolean
- sourceUrl: string (if available)

Source: ${source}

Text to parse:
${text}

Return ONLY a valid JSON array. No markdown, no explanation. If no events found, return empty array [].

Example output:
[{"title":"Art Festival","description":"Annual art show","date":"2026-04-20","time":"10:00 AM","venue":"Downtown Adrian","address":"123 Main St, Adrian, MI","city":"Adrian","category":"arts-entertainment","price":"Free","familyFriendly":true,"sourceUrl":"https://example.com"}]`;

  try {
    const response = await callOllama(prompt);
    
    // Extract JSON from response
    let jsonStr = response.trim();
    
    // Try to find JSON array in the response
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const events = JSON.parse(jsonStr);
    
    // Validate and clean events
    return events.filter(event => {
      return event.title && event.date;
    }).map(event => ({
      ...event,
      id: generateUUID(),
      source: source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastValidated: new Date().toISOString(),
      status: 'active'
    }));
    
  } catch (err) {
    console.error(`LLM parsing error for ${source}:`, err.message);
    return [];
  }
}

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Fetch from Eventbrite API (requires API key)
async function fetchEventbrite() {
  // Eventbrite requires API key - for now, return empty
  // TODO: Add Eventbrite API key from user's credentials
  console.log('Eventbrite: API key required, skipping for now');
  return [];
}

// Fetch from local news sources
async function fetchLocalNews() {
  const events = [];
  
  // Tecumseh Herald
  console.log('Fetching from Tecumseh Herald...');
  // In production, we'd scrape the actual website
  // For now, we'll use sample data
  
  // Adrian Daily Telegram
  console.log('Fetching from Adrian Daily Telegram...');
  // In production, we'd scrape the actual website
  
  return events;
}

// Fetch sample events (for initial population)
async function fetchSampleEvents() {
  const today = new Date();
  const events = [];
  
  // Generate 30 days of sample events
  const sampleEvents = [
    {
      title: 'Tecumseh Farmers Market',
      description: 'Fresh local produce, baked goods, and crafts from local vendors.',
      venue: 'Tecumseh Community Center',
      address: '703 E Chicago Blvd, Tecumseh, MI 49286',
      city: 'Tecumseh',
      category: 'food-dining',
      time: '8:00 AM - 1:00 PM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: 6, // Saturday
      weekOfMonth: [0, 1, 2, 3] // Every Saturday
    },
    {
      title: 'Adrian College Concert Series',
      description: 'Student performances from Adrian College music department.',
      venue: 'Adrian College - Dobie Hall',
      address: '110 S Madison St, Adrian, MI 49221',
      city: 'Adrian',
      category: 'music-concerts',
      time: '7:30 PM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: 5, // Friday
      weekOfMonth: [1, 3] // 2nd and 4th Friday
    },
    {
      title: 'Lenawee County Historical Society Meeting',
      description: 'Monthly meeting discussing local history and preservation efforts.',
      venue: 'Lenawee County Historical Museum',
      address: '110 E Church St, Adrian, MI 49221',
      city: 'Adrian',
      category: 'education-learning',
      time: '7:00 PM',
      price: 'Free',
      familyFriendly: false,
      dayOfWeek: 2, // Wednesday
      weekOfMonth: [2] // 3rd Wednesday
    },
    {
      title: 'Croswell Opera House Performance',
      description: 'Live theater and performing arts at the historic Croswell Opera House.',
      venue: 'Croswell Opera House',
      address: '129 W Maumee St, Adrian, MI 49221',
      city: 'Adrian',
      category: 'arts-entertainment',
      time: '8:00 PM',
      price: '$20-35',
      familyFriendly: true,
      dayOfWeek: 5, // Friday
      weekOfMonth: [0, 1, 2, 3]
    },
    {
      title: 'Hidden Lake Gardens Nature Walk',
      description: 'Guided nature walk through the beautiful Hidden Lake Gardens.',
      venue: 'Hidden Lake Gardens',
      address: '6210 Monroe Rd, Tipton, MI 49287',
      city: 'Tipton',
      category: 'outdoors-nature',
      time: '10:00 AM',
      price: '$5',
      familyFriendly: true,
      dayOfWeek: 0, // Sunday
      weekOfMonth: [1, 2, 3]
    },
    {
      title: 'Blissfield Summer Festival',
      description: 'Annual festival with carnival rides, live music, food vendors, and parade.',
      venue: 'Blissfield Downtown',
      address: '128 S Lane St, Blissfield, MI 49230',
      city: 'Blissfield',
      category: 'festivals-fairs',
      time: 'All day',
      price: 'Free entry',
      familyFriendly: true,
      dates: ['2026-06-15', '2026-06-16', '2026-06-17'] // Specific dates
    },
    {
      title: 'Tecumseh Youth Soccer League',
      description: 'Youth soccer games at Indian Crossing Park.',
      venue: 'Indian Crossing Park',
      address: '605 E Chicago Blvd, Tecumseh, MI 49286',
      city: 'Tecumseh',
      category: 'sports-recreation',
      time: '9:00 AM - 4:00 PM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: 6, // Saturday
      weekOfMonth: [0, 1, 2, 3]
    },
    {
      title: 'Adrian Public Library Story Time',
      description: 'Story time and activities for children ages 2-5.',
      venue: 'Adrian Public Library',
      address: '143 E Maumee St, Adrian, MI 49221',
      city: 'Adrian',
      category: 'family-kids',
      time: '10:30 AM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: [2, 4] // Wednesday and Friday
    },
    {
      title: 'Lenawee Community Chorus Rehearsal',
      description: 'Weekly rehearsal for community choir members.',
      venue: 'First Presbyterian Church',
      address: '156 E Maumee St, Adrian, MI 49221',
      city: 'Adrian',
      category: 'music-concerts',
      time: '7:00 PM',
      price: 'Free',
      familyFriendly: false,
      dayOfWeek: 1, // Monday
      weekOfMonth: [0, 1, 2, 3]
    },
    {
      title: 'Downtown Adrian Art Walk',
      description: 'Monthly art walk featuring local artists and galleries.',
      venue: 'Downtown Adrian',
      address: 'Downtown Adrian, MI',
      city: 'Adrian',
      category: 'arts-entertainment',
      time: '5:00 PM - 9:00 PM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: 4, // Thursday
      weekOfMonth: [1] // 2nd Thursday
    },
    {
      title: 'Hudson Community Church Service',
      description: 'Sunday worship service.',
      venue: 'Hudson Community Church',
      address: '123 N Main St, Hudson, MI 49247',
      city: 'Hudson',
      category: 'community-government',
      time: '10:00 AM',
      price: 'Free',
      familyFriendly: true,
      dayOfWeek: 0, // Sunday
      weekOfMonth: [0, 1, 2, 3]
    },
    {
      title: 'Morenci Veterans Breakfast',
      description: 'Monthly breakfast gathering for veterans and community.',
      venue: 'Morenci American Legion',
      address: '123 E Main St, Morenci, MI 49246',
      city: 'Morenci',
      category: 'charity-volunteering',
      time: '8:00 AM',
      price: '$5',
      familyFriendly: true,
      dayOfWeek: 6, // Saturday
      weekOfMonth: [0] // 1st Saturday
    }
  ];
  
  // Generate events for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    for (const event of sampleEvents) {
      // Check if this event should occur on this date
      if (event.dates) {
        const dateStr = date.toISOString().split('T')[0];
        if (event.dates.includes(dateStr)) {
          events.push({
            ...event,
            id: generateUUID(),
            date: dateStr,
            source: 'sample',
            sourceUrl: `https://thecoelab.com/events/${generateUUID()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            status: 'active'
          });
        }
      } else {
        const dayOfWeek = date.getDay();
        const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
        
        const days = Array.isArray(event.dayOfWeek) ? event.dayOfWeek : [event.dayOfWeek];
        const weeks = event.weekOfMonth || [0, 1, 2, 3];
        
        if (days.includes(dayOfWeek) && weeks.includes(weekOfMonth)) {
          events.push({
            ...event,
            id: generateUUID(),
            date: date.toISOString().split('T')[0],
            source: 'sample',
            sourceUrl: `https://thecoelab.com/events/${generateUUID()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            status: 'active'
          });
        }
      }
    }
  }
  
  console.log(`Generated ${events.length} sample events for the next 30 days`);
  return events;
}

// Save events to Neo4j
async function saveEventsToNeo4j(events) {
  const session = driver.session();
  let saved = 0;
  
  try {
    for (const event of events) {
      // Create or find venue
      const venueResult = await session.run(`
        MERGE (v:Venue {name: $venue})
        SET v.address = $address, v.city = $city
        WITH v
        MATCH (c:City {name: $city})
        MERGE (v)-[:IN_CITY]->(c)
        RETURN v
      `, { venue: event.venue, address: event.address, city: event.city });
      
      // Create event
      await session.run(`
        MERGE (e:Event {id: $id})
        SET e.title = $title,
            e.description = $description,
            e.startDate = $date,
            e.time = $time,
            e.price = $price,
            e.familyFriendly = $familyFriendly,
            e.sourceUrl = $sourceUrl,
            e.status = $status,
            e.createdAt = $createdAt,
            e.updatedAt = $updatedAt,
            e.lastValidated = $lastValidated
        WITH e
        MATCH (v:Venue {name: $venue})
        MERGE (e)-[:AT]->(v)
        WITH e
        MATCH (c:Category {slug: $category})
        MERGE (e)-[:IN_CATEGORY]->(c)
        WITH e
        MATCH (s:Source {id: $source})
        MERGE (e)-[:FROM_SOURCE]->(s)
      `, {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time || 'All day',
        price: event.price || 'Free',
        familyFriendly: event.familyFriendly ?? true,
        sourceUrl: event.sourceUrl || '',
        status: event.status || 'active',
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        lastValidated: event.lastValidated,
        venue: event.venue,
        category: event.category,
        source: 'sample'
      });
      
      saved++;
      if (saved % 10 === 0) {
        console.log(`  Saved ${saved} events...`);
      }
    }
    
    console.log(`✅ Saved ${saved} events to Neo4j`);
  } catch (err) {
    console.error('Error saving events:', err);
  } finally {
    await session.close();
  }
  
  return saved;
}

// Main function
async function main() {
  console.log('🦞 Lenawee Event Finder - Data Pipeline\n');
  console.log('Fetching events from multiple sources...\n');
  
  const allEvents = [];
  
  // Fetch from all sources
  console.log('📦 Loading sample events...');
  const sampleEvents = await fetchSampleEvents();
  allEvents.push(...sampleEvents);
  
  // TODO: Add more sources
  // const eventbriteEvents = await fetchEventbrite();
  // allEvents.push(...eventbriteEvents);
  
  // const newsEvents = await fetchLocalNews();
  // allEvents.push(...newsEvents);
  
  console.log(`\n📊 Total events: ${allEvents.length}`);
  
  // Save to Neo4j
  if (allEvents.length > 0) {
    console.log('\n💾 Saving to Neo4j...');
    await saveEventsToNeo4j(allEvents);
  }
  
  await driver.close();
  console.log('\n✅ Done!');
}

main().catch(console.error);