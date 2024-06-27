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
    const { personalId } = JSON.parse(event.body);
    const inviteId = Array(10).fill(0).map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

    const result = await client.query(
      q.Create(
        q.Collection('Invites'),
        { data: { personal_id: personalId, invite_id: inviteId, is_used: false } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Invite created successfully.",
        inviteId: result.ref.id
      })
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't create the invite. Please try again or contact support if the problem persists." })
    };
  }
};