const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  const secretKey = process.env.DB_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Oops! We couldn't find the database key. Please contact support." })
    };
  }

  const client = new faunadb.Client({ secret: secretKey });

  try {
    const { personalId, surveyId } = JSON.parse(event.body);

    // Fetch the user reference by personal ID
    const userRef = await client.query(
      q.Select(
        "ref",
        q.Get(
          q.Match(q.Index('users_by_personal_id'), personalId)
        )
      )
    );

    // Create the survey with a reference to the user
    const result = await client.query(
      q.Create(
        q.Collection('Surveys'),
        { data: { user_ref: userRef, surveyId } }
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