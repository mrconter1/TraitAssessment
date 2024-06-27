const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async () => {
  try {
    const client = getFaunaClient();
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        categories: categories.data.map(cat => ({ id: cat.ref.id, ...cat.data })),
        questions: questions.data.map(q => ({ id: q.ref.id, ...q.data })),
        standardizedAlternatives: standardizedAlternatives.data.map(alt => ({ id: alt.ref.id, ...alt.data }))
      })
    };
  } catch (error) {
    return handleError(error, "Sorry, we couldn't fetch the questions. Please try again or contact support if the problem persists.");
  }
};