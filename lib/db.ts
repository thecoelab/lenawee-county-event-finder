import neo4j from 'neo4j-driver';

// Neo4j connection - singleton pattern
let driver;

function getDriver() {
  if (!driver) {
    try {
      // Use environment variable or default to Unraid server IP
      const neo4jHost = process.env.NEO4J_HOST || '192.168.86.196';
      const neo4jPort = process.env.NEO4J_PORT || '7687';
      console.log('Connecting to Neo4j at:', neo4jHost, neo4jPort);
      // Use environment variables for credentials - NEVER hardcode passwords
      const neo4jUser = process.env.NEO4J_USER || 'neo4j';
      const neo4jPassword = process.env.NEO4J_PASSWORD;
      
      if (!neo4jPassword) {
        throw new Error('NEO4J_PASSWORD environment variable is required');
      }
      
      driver = neo4j.driver(
        `bolt://${neo4jHost}:${neo4jPort}`,
        neo4j.auth.basic(neo4jUser, neo4jPassword)
      );
      console.log('Neo4j driver created successfully');
    } catch (err) {
      console.error('Failed to create Neo4j driver:', err);
      throw err;
    }
  }
  return driver;
}

interface Filters {
  category?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface QueryParams {
  today: string;
  category?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getEvents(filters: Filters = {}) {
  const session = getDriver().session();
  
  try {
    const { category, city, startDate, endDate, search } = filters;
    
    console.log('Fetching events with filters:', filters);
    
    let query = `
      MATCH (e:Event)-[:AT]->(v:Venue)-[:IN_CITY]->(c:City)
      MATCH (e)-[:IN_CATEGORY]->(cat:Category)
      MATCH (e)-[:FROM_SOURCE]->(s:Source)
      WHERE e.status = 'active' AND e.startDate >= $today
    `;
    
    const params: QueryParams = { today: new Date().toISOString().split('T')[0] };
    
    if (category) {
      query += ` AND cat.slug = $category`;
      params.category = category;
    }
    
    if (city) {
      query += ` AND c.name = $city`;
      params.city = city;
    }
    
    if (startDate) {
      query += ` AND e.startDate >= $startDate`;
      params.startDate = startDate;
    }
    
    if (endDate) {
      query += ` AND e.startDate <= $endDate`;
      params.endDate = endDate;
    }
    
    if (search) {
      query += ` AND (toLower(e.title) CONTAINS toLower($search) OR toLower(e.description) CONTAINS toLower($search))`;
      params.search = search;
    }
    
    query += `
      RETURN e, v, c, cat, s
      ORDER BY e.startDate
      LIMIT 100
    `;
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await session.run(query, params);
    console.log('Records returned:', result.records.length);
    
    
    return result.records.map(record => ({
      id: record.get('e').properties.id,
      title: record.get('e').properties.title,
      description: record.get('e').properties.description,
      date: record.get('e').properties.startDate,
      time: record.get('e').properties.time,
      price: record.get('e').properties.price,
      familyFriendly: record.get('e').properties.familyFriendly,
      sourceUrl: record.get('e').properties.sourceUrl,
      venue: {
        name: record.get('v').properties.name,
        address: record.get('v').properties.address,
        city: record.get('c').properties.name,
      },
      category: {
        name: record.get('cat').properties.name,
        slug: record.get('cat').properties.slug,
        icon: record.get('cat').properties.icon,
        color: record.get('cat').properties.color,
      },
      source: record.get('s').properties.name,
    }));
  } finally {
    await session.close();
  }
}

export async function getCategories() {
  const session = getDriver().session();
  
  try {
    const result = await session.run(`
      MATCH (c:Category)
      RETURN c
      ORDER BY c.name
    `);
    
    return result.records.map(record => ({
      id: record.get('c').properties.id,
      name: record.get('c').properties.name,
      slug: record.get('c').properties.slug,
      icon: record.get('c').properties.icon,
      color: record.get('c').properties.color,
    }));
  } finally {
    await session.close();
  }
}

export async function getCities() {
  const session = getDriver().session();
  
  try {
    const result = await session.run(`
      MATCH (c:City)
      RETURN c.name as name
      ORDER BY c.name
    `);
    
    return result.records.map(record => record.get('name'));
  } finally {
    await session.close();
  }
}