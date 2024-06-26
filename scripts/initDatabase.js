const faunadb = require('faunadb'),
      q = faunadb.query;

const secretKey = process.env.FAUNADB_SERVER_SECRET;

// Print the key to the console
console.log("Using FaunaDB Secret:", secretKey);

const client = new faunadb.Client({ secret: secretKey });

async function setupFaunaDB() {
  try {
    // Create a collection
    await client.query(q.CreateCollection({ name: 'users1' }));

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error setting up database: ", error.message);
  }
}

setupFaunaDB();