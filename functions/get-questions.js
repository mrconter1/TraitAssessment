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
    const categories = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('Categories'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    const questions = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('Questions'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    const standardizedAlternatives = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('StandardizedAlternatives'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    const response = {
      categories: categories.data.map(cat => ({ id: cat.ref.id, ...cat.data })),
      questions: questions.data.map(q => ({ id: q.ref.id, ...q.data })),
      standardizedAlternatives: standardizedAlternatives.data.map(alt => ({ id: alt.ref.id, ...alt.data }))
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, we couldn't fetch the questions. Please try again or contact support if the problem persists." })
    };
  }
};