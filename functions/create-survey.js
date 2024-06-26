const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  const secretKey = "fnAFk1hnUhAAQOOl1kbnbwUJ0Dfc23h8FoKsMxH8";
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "FaunaDB secret key is not set" })
    };
  }
  
  console.log('Secret key is:', secretKey);

  const client = new faunadb.Client({ secret: secretKey });
  
  try {
    const result = await client.query(
      q.If(
        q.Exists(q.Collection('surveys1')),
        { message: "Collection 'surveys1' already exists" },
        q.CreateCollection({ name: 'surveys1' })
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