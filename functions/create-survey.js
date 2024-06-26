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
    // Ensure 'surveys' collection exists
    await client.query(
      q.If(
        q.Exists(q.Collection('surveys')),
        true,
        q.CreateCollection({ name: 'surveys' })
      )
    );
    console.log('Surveys collection is ready');

    // Create a new survey document
    const { personalId, surveyId } = JSON.parse(event.body);
    const result = await client.query(
      q.Create(
        q.Collection('surveys'),
        { data: { personalId, surveyId, createdAt: q.Now() } }
      )
    );

    console.log('Survey created:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Survey created successfully", 
        id: result.ref.id,
        data: result.data
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to create survey", 
        details: error.description,
        code: error.requestResult?.statusCode,
        errors: error.requestResult?.responseContent?.errors
      })
    };
  }
};