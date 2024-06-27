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

    const result = await client.query(
      q.Create(
        q.Collection('Users'),
        { data: { personal_id: personalId } }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User created successfully.",
        id: result.ref.id
      })
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't create the user. Please try again or contact support if the problem persists." })
    };
  }
};