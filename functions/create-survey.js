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
    // Log database connection info
    const dbInfo = await client.query(q.Get(q.Database('TraitAssessment')));
    console.log('Connected to database:', dbInfo.name);

    // Log all collections
    const collections = await client.query(q.Paginate(q.Collections()));
    console.log('Collections:', collections.data);

    // Check if 'surveys' collection exists, if not, create it
    let surveysCollection;
    try {
      surveysCollection = await client.query(q.Get(q.Collection('surveys')));
      console.log('Surveys collection exists');
    } catch (error) {
      if (error.requestResult.statusCode === 404) {
        console.log('Surveys collection does not exist. Creating it...');
        surveysCollection = await client.query(q.CreateCollection({ name: 'surveys' }));
        console.log('Surveys collection created');
      } else {
        throw error;
      }
    }

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