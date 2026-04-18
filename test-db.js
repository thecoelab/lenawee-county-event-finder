const neo4j = require('neo4j-driver');

// Use environment variables for credentials
const NEO4J_HOST = process.env.NEO4J_HOST || '192.168.86.196';
const NEO4J_PORT = process.env.NEO4J_PORT || '7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

if (!NEO4J_PASSWORD) {
  console.error('ERROR: NEO4J_PASSWORD environment variable is required');
  console.error('Usage: NEO4J_PASSWORD=yourpassword node test-db.js');
  process.exit(1);
}

const driver = neo4j.driver(
  `bolt://${NEO4J_HOST}:${NEO4J_PORT}`,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

const session = driver.session();

console.log('Testing Neo4j connection from container...');

session.run('MATCH (e:Event) RETURN count(e) as count')
  .then(r => {
    console.log('Total events:', r.records[0].get('count').toNumber());
    return session.run("MATCH (e:Event) WHERE e.status = 'active' RETURN count(e) as count");
  })
  .then(r => {
    console.log('Active events:', r.records[0].get('count').toNumber());
    const today = new Date().toISOString().split('T')[0];
    return session.run(
      "MATCH (e:Event) WHERE e.status = 'active' AND e.startDate >= $today RETURN e.title as title, e.startDate as date LIMIT 5",
      { today }
    );
  })
  .then(r => {
    console.log('Events from today onwards:', r.records.length);
    r.records.forEach(rec => {
      console.log(' -', rec.get('title'), '|', rec.get('date'));
    });
    session.close();
    driver.close();
  })
  .catch(e => {
    console.error('Error:', e.message);
    session.close();
    driver.close();
  });