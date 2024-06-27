const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
    const { inviteId } = JSON.parse(event.body);

    // Fetch the invite
    const invite = await client.query(
      q.Get(q.Match(q.Index('invite_by_invite_id'), inviteId))
    );

    if (invite.data.is_used) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invite link has already been used' })
      };
    }

    const surveyId = Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

    // Create the survey
    await client.query(
      q.Create(
        q.Collection('Surveys'),
        { data: { survey_id: surveyId, user_ref: invite.data.personal_id } }
      )
    );

    // Mark the invite as used
    await client.query(
      q.Update(q.Ref(q.Collection('Invites'), invite.ref.id), { data: { is_used: true } })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Survey created successfully.",
        surveyId
      })
    };
  } catch (error) {
    if (error.requestResult && error.requestResult.statusCode === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Invite link does not exist' })
      };
    }
    return handleError(error, "Sorry, we couldn't start the survey. Please try again or contact support if the problem persists.");
  }
};