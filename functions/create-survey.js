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
    // Log the current database
    const dbInfo = await client.query(q.Get(q.Database('this')));
    console.log('Connected to database:', dbInfo.name);

    // Ensure the 'surveys' collection exists
    await client.query(
      q.If(
        q.Exists(q.Collection('surveys')),
        true,
        q.CreateCollection({ name: 'surveys' })
      )
    );
    console.log('Surveys collection exists or was created');

    // Ensure the index exists
    await client.query(
      q.If(
        q.Exists(q.Index('surveys_by_personal_and_survey_id')),
        true,
        q.CreateIndex({
          name: 'surveys_by_personal_and_survey_id',
          source: q.Collection('surveys'),
          terms: [
            { field: ['data', 'personalId'] },
            { field: ['data', 'surveyId'] }
          ],
          unique: true
        })
      )
    );
    console.log('Index exists or was created');

    // Retrieve and log all existing entries
    const existingEntries = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('surveys'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );
    console.log('Existing entries:', JSON.stringify(existingEntries, null, 2));

    // Parse the incoming request body
    const { personalId, surveyId } = JSON.parse(event.body);

    if (!personalId || !surveyId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "personalId and surveyId are required" })
      };
    }

    // Attempt to create a new survey document
    const result = await client.query(
      q.Let(
        {
          match: q.Match(q.Index('surveys_by_personal_and_survey_id'), [personalId, surveyId])
        },
        q.If(
          q.Exists(q.Var('match')),
          { existing: true, data: q.Get(q.Var('match')) },
          {
            existing: false,
            data: q.Create(
              q.Collection('surveys'),
              { 
                data: { 
                  personalId, 
                  surveyId
                }
              }
            )
          }
        )
      )
    );

    console.log('Operation result:', JSON.stringify(result, null, 2));

    if (result.existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Survey already exists", 
          id: result.data.ref.id,
          data: result.data.data
        })
      };
    } else {
      return {
        statusCode: 201,
        body: JSON.stringify({ 
          message: "Survey created successfully", 
          id: result.data.ref.id,
          data: result.data.data
        })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to create survey", 
        details: error.description,
        stack: error.stack
      })
    };
  }
};