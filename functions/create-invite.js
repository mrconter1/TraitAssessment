const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
    const { personalId } = JSON.parse(event.body);
    const inviteId = Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

    await client.query(
      q.Create(
        q.Collection('Invites'),
        { data: { personal_id: personalId, invite_id: inviteId, is_used: false } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Invite created successfully.", inviteId })
    };
  } catch (error) {
    return handleError(error, "Sorry, we couldn't create the invite. Please try again or contact support if the problem persists.");
  }
};