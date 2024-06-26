const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  const secretKey = process.env.FAUNADB_SERVER_SECRET;
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Oops! We couldn't find the database key. Please contact support." })
    };
  }

  const client = new faunadb.Client({ secret: secretKey });
  
  try {
    const { personalId, surveyId } = JSON.parse(event.body);

    const result = await client.query(
      q.Create(
        q.Collection('surveys'),
        { data: { personalId, surveyId } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Great! We've successfully connected your personal ID to this survey.",
        id: result.ref.id
      })
    };
  } catch (error) {
    console.error('Error creating survey link:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't link your personal ID to the survey. Please try again or contact support if the problem persists." })
    };
  }
};