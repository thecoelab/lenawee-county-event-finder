import neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://192.168.86.196:7687', neo4j.auth.basic('neo4j', 'REMOVED'));

async function initDatabase() {
  const session = driver.session();
  
  try {
    console.log('Creating constraints and indexes...\n');
    
    const queries = [
      { name: 'event_id_unique', query: 'CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE' },
      { name: 'event_start_date_idx', query: 'CREATE INDEX event_start_date IF NOT EXISTS FOR (e:Event) ON (e.startDate)' },
      { name: 'event_status_idx', query: 'CREATE INDEX event_status IF NOT EXISTS FOR (e:Event) ON (e.status)' },
      { name: 'venue_id_unique', query: 'CREATE CONSTRAINT venue_id_unique IF NOT EXISTS FOR (v:Venue) REQUIRE v.id IS UNIQUE' },
      { name: 'venue_name_idx', query: 'CREATE INDEX venue_name IF NOT EXISTS FOR (v:Venue) ON (v.name)' },
      { name: 'venue_city_idx', query: 'CREATE INDEX venue_city IF NOT EXISTS FOR (v:Venue) ON (v.city)' },
      { name: 'category_id_unique', query: 'CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE' },
      { name: 'category_slug_unique', query: 'CREATE CONSTRAINT category_slug_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.slug IS UNIQUE' },
      { name: 'source_id_unique', query: 'CREATE CONSTRAINT source_id_unique IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE' },
      { name: 'city_name_unique', query: 'CREATE CONSTRAINT city_name_unique IF NOT EXISTS FOR (c:City) REQUIRE c.name IS UNIQUE' },
    ];
    
    for (const { name, query } of queries) {
      try {
        await session.run(query);
        console.log(`✓ ${name}`);
      } catch (err) {
        console.log(`✗ ${name}: ${err.message}`);
      }
    }
    
    // Create categories
    console.log('\nCreating categories...');
    const categories = [
      { id: 'arts-entertainment', name: 'Arts & Entertainment', slug: 'arts-entertainment', icon: '🎭', color: '#FF6B35' },
      { id: 'music-concerts', name: 'Music & Concerts', slug: 'music-concerts', icon: '🎵', color: '#1A1A2E' },
      { id: 'sports-recreation', name: 'Sports & Recreation', slug: 'sports-recreation', icon: '🏃', color: '#00D4AA' },
      { id: 'family-kids', name: 'Family & Kids', slug: 'family-kids', icon: '👨‍👩‍👧', color: '#FF6B35' },
      { id: 'food-dining', name: 'Food & Dining', slug: 'food-dining', icon: '🍽️', color: '#00D4AA' },
      { id: 'community-government', name: 'Community & Government', slug: 'community-government', icon: '🏛️', color: '#1A1A2E' },
      { id: 'education-learning', name: 'Education & Learning', slug: 'education-learning', icon: '📚', color: '#FF6B35' },
      { id: 'outdoors-nature', name: 'Outdoors & Nature', slug: 'outdoors-nature', icon: '🌳', color: '#00D4AA' },
      { id: 'festivals-fairs', name: 'Festivals & Fairs', slug: 'festivals-fairs', icon: '🎉', color: '#1A1A2E' },
      { id: 'business-networking', name: 'Business & Networking', slug: 'business-networking', icon: '💼', color: '#FF6B35' },
      { id: 'gaming-hobbies', name: 'Gaming & Hobbies', slug: 'gaming-hobbies', icon: '🎮', color: '#00D4AA' },
      { id: 'charity-volunteering', name: 'Charity & Volunteering', slug: 'charity-volunteering', icon: '❤️', color: '#1A1A2E' },
    ];
    
    for (const cat of categories) {
      await session.run(`MERGE (c:Category {id: $id}) SET c.name = $name, c.slug = $slug, c.icon = $icon, c.color = $color`, cat);
      console.log(`  ✓ ${cat.name}`);
    }
    
    // Create cities
    console.log('\nCreating cities...');
    const cities = ['Adrian', 'Tecumseh', 'Blissfield', 'Clinton', 'Dundee', 'Hudson', 'Morenci', 'Onsted', 'Britton', 'Deerfield', 'Fairview', 'Franklin', 'Macon', 'Palmyra', 'Raisin', 'Ridgeway', 'Rollin', 'Rome', 'Seneca', 'Woodstock'];
    for (const city of cities) {
      await session.run(`MERGE (c:City {name: $name})`, { name: city });
      console.log(`  ✓ ${city}`);
    }
    
    // Create sources
    console.log('\nCreating sources...');
    const sources = [
      { id: 'eventbrite', name: 'Eventbrite', type: 'api', reliability: 0.9 },
      { id: 'facebook', name: 'Facebook Events', type: 'scraper', reliability: 0.7 },
      { id: 'tecumseh-herald', name: 'Tecumseh Herald', type: 'scraper', reliability: 0.8 },
      { id: 'daily-telegram', name: 'Adrian Daily Telegram', type: 'scraper', reliability: 0.8 },
      { id: 'lenawee-county', name: 'Lenawee County', type: 'api', reliability: 0.95 },
      { id: 'manual', name: 'Manual Entry', type: 'manual', reliability: 1.0 },
    ];
    
    for (const src of sources) {
      await session.run(`MERGE (s:Source {id: $id}) SET s.name = $name, s.type = $type, s.reliability = $reliability`, src);
      console.log(`  ✓ ${src.name}`);
    }
    
    console.log('\n✅ Database schema initialized successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

initDatabase();