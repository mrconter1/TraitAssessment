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
    // Log all collections
    const collections = await client.query(q.Paginate(q.Collections()));
    console.log('Collections:', collections.data);

    // Attempt to get the 'surveys' collection
    const surveysCollection = await client.query(q.Exists(q.Collection('surveys')));
    console.log('Surveys collection exists:', surveysCollection);

    const { personalId, surveyId } = JSON.parse(event.body);
    const result = await client.query(
      q.Create(
        q.Collection('surveys'),
        { data: { personalId, surveyId } }
      )
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Survey created successfully", id: result.ref.id })
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