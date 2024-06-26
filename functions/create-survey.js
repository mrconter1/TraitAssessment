const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  const secretKey = process.env.FAUNADB_SERVER_SECRET;
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "FaunaDB secret key is not set" })
    };
  }
  
  const client = new faunadb.Client({ secret: secretKey });
  
  try {
    // Attempt a simple query to check connection
    const result = await client.query(q.Now());
    console.log('Successfully connected to FaunaDB. Current time:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successfully connected to FaunaDB", time: result })
    };
  } catch (error) {
    console.error('Error connecting to FaunaDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to connect to FaunaDB", 
        details: error.description,
        code: error.requestResult?.statusCode,
        errors: error.requestResult?.responseContent?.errors
      })
    };
  }
};