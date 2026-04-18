import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  console.log('=== API route called ===')
  
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);
    
    const neo4jHost = process.env.NEO4J_HOST || '192.168.86.196';
    const neo4jPort = process.env.NEO4J_PORT || '7687';
    
    const driver = neo4j.driver(
      `bolt://${neo4jHost}:${neo4jPort}`,
      neo4j.auth.basic('neo4j', 'REMOVED')
    );
    
    const session = driver.session();
    
    // Use simple query first
    console.log('Running simple query...');
    const result = await session.run(`
      MATCH (e:Event)
      WHERE e.status = 'active' AND e.startDate >= $today
      MATCH (e)-[:AT]->(v:Venue)
      MATCH (e)-[:IN_CATEGORY]->(cat:Category)
      OPTIONAL MATCH (v)-[:IN_CITY]->(c:City)
      OPTIONAL MATCH (e)-[:FROM_SOURCE]->(s:Source)
      RETURN e, v, c, cat, s
      ORDER BY e.startDate
      LIMIT 100
    `, { today });
    
    console.log('Query returned', result.records.length, 'records');
    
    const events = result.records.map(record => {
      const e = record.get('e').properties;
      const v = record.get('v')?.properties || {};
      const c = record.get('c')?.properties || { name: 'Unknown' };
      const cat = record.get('cat').properties;
      const s = record.get('s')?.properties || { name: 'Unknown' };
      
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.startDate,
        time: e.time,
        price: e.price,
        familyFriendly: e.familyFriendly,
        sourceUrl: e.sourceUrl,
        venue: {
          name: v.name || 'Unknown',
          address: v.address || '',
          city: c.name,
        },
        category: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
        },
        source: s.name,
      };
    });
    
    await session.close();
    await driver.close();
    
    console.log('Returning', events.length, 'events');
    return NextResponse.json(events)
  } catch (error) {
    console.error('=== Error fetching events ===');
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}