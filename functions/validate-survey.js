const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
    const { surveyId } = JSON.parse(event.body);

    // Fetch the survey
    const survey = await client.query(
      q.Get(q.Match(q.Index('survey_by_id'), surveyId))
    );

    // If the survey exists, it will return successfully
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Survey is valid' })
    };
  } catch (error) {
    if (error.requestResult && error.requestResult.statusCode === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Survey does not exist' })
      };
    }
    return handleError(error, "Sorry, we couldn't validate the survey. Please try again or contact support if the problem persists.");
  }
};