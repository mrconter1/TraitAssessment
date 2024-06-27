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
      q.Get(q.Ref(q.Collection('Invites'), inviteId))
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
    console.error('Error validating invite:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't validate the invite. Please try again or contact support if the problem persists." })
    };
  }
};