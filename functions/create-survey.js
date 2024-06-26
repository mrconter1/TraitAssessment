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
    const result = await client.query(
      q.If(
        q.Exists(q.Collection('surveys')),
        { message: "Collection 'surveys' already exists" },
        q.CreateCollection({ name: 'surveys' })
      )
    );

    console.log('Result:', JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Operation completed successfully", 
        result: result 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to create collection", 
        details: error.description,
        stack: error.stack
      })
    };
  }
};