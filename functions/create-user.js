const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
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
    return handleError(error, "Sorry, we couldn't link your personal ID to the survey. Please try again or contact support if the problem persists.");
  }
};