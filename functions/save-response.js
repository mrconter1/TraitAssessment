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

    // Check if a response already exists for the given survey_id and question_id
    const responseMatch = await client.query(
      q.Let(
        {
          match: q.Match(q.Index('responses_by_survey_and_question'), [survey_id, question_id])
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Get(q.Var('match')),
          null
        )
      )
    );

    let response;
    if (responseMatch) {
      // Update existing response
      response = await client.query(
        q.Update(responseMatch.ref, {
          data: { selection, timestamp: q.Now() }
        })
      );
    } else {
      // Create new response
      response = await client.query(
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
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ id: response.ref.id }),
    };
  } catch (error) {
    return handleError(error, "Sorry, we couldn't save your response. Please try again or contact support if the problem persists.");
  }
};