const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  // Use the FAUNADB_SERVER_SECRET provided by Netlify
  const secretKey = process.env.FAUNADB_SERVER_SECRET;

  // Ensure the secret key is available
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "FaunaDB secret key is not set" })
    };
  }

  const client = new faunadb.Client({
    secret: secretKey,
  });

  try {
    // Log all collections
    const collections = await client.query(
      q.Paginate(q.Collections())
    );
    console.log('Collections:', collections.data);

    // Proceed with creating the survey
    const { personalId, surveyId } = JSON.parse(event.body);

    const result = await client.query(
      q.Create(
        q.Collection('surveys'), // Ensure correct reference to the collection
        { data: { personalId, surveyId } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Survey created successfully", id: result.ref.id })
    };
  } catch (error) {
    console.error('Error creating survey:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create survey" })
    };
  }
};
