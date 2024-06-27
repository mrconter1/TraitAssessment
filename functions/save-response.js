// functions/save-response.js
const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
    const { survey_id, question_id, selection } = JSON.parse(event.body);

    // Get user_ref using survey_id
    const survey = await client.query(
      q.Get(q.Match(q.Index('survey_by_id'), survey_id))
    );

    const user_ref = survey.data.user_ref;

    const response = await client.query(
      q.Create(q.Collection('Responses'), {
        data: {
          user_ref,
          survey_id,
          question_id,
          selection,
          timestamp: q.Now(),
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ id: response.ref.id }),
    };
  } catch (error) {
    return handleError(error, "Sorry, we couldn't save your response. Please try again or contact support if the problem persists.");
  }
};