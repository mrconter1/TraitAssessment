const faunadb = require('faunadb'),
      q = faunadb.query;

const secretKey = process.env.FAUNADB_SERVER_SECRET;

const client = new faunadb.Client({ secret: secretKey });

async function setupFaunaDB() {
  try {
    // Create a collection
    await client.query(q.CreateCollection({ name: 'users' }));

    // Create an index
    await client.query(
      q.CreateIndex({
        name: 'users_by_email',
        source: q.Collection('users'),
        terms: [{ field: ['data', 'email'] }],
        unique: true
      })
    );

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error setting up database: ", error.message);
  }
}

setupFaunaDB();