const { getFaunaClient, handleError, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
  try {
    const client = getFaunaClient();
    const { survey_id } = JSON.parse(event.body);

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

    const responses = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index('responses_by_survey'), survey_id)),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        categories: categories.data.map(cat => ({ id: cat.ref.id, ...cat.data })),
        questions: questions.data.map(q => ({ id: q.ref.id, ...q.data })),
        standardizedAlternatives: standardizedAlternatives.data.map(alt => ({ id: alt.ref.id, ...alt.data })),
        responses: responses.data.map(res => ({ question_id: res.data.question_id, selection: res.data.selection }))
      })
    };
  } catch (error) {
    return handleError(error, "Sorry, we couldn't fetch the questions. Please try again or contact support if the problem persists.");
  }
};