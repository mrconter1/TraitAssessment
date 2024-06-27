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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Invite is valid' })
    };
  } catch (error) {
    if (error.requestResult && error.requestResult.statusCode === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Invite link does not exist' })
      };
    }
    return handleError(error, "Sorry, we couldn't validate the invite. Please try again or contact support if the problem persists.");
  }
};