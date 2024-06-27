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

    const surveyId = Array(10).fill(0).map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

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
        surveyId: surveyId
      })
    };
  } catch (error) {
    if (error.requestResult && error.requestResult.statusCode === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Invite link does not exist' })
      };
    }
    console.error('Error starting survey:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't start the survey. Please try again or contact support if the problem persists." })
    };
  }
};