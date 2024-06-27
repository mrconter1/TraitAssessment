const { getFaunaClient, q } = require('../utils/faunaClient');

exports.handler = async (event) => {
    try {
        const client = getFaunaClient();
        const { personalId } = JSON.parse(event.body);

        // Check if a personal survey already exists for this user
        const personalSurveyExists = await client.query(
            q.Exists(q.Match(q.Index('personal_surveys_by_user'), q.Ref(q.Collection('Users'), personalId)))
        );

        if (personalSurveyExists) {
            const personalSurvey = await client.query(
                q.Get(q.Match(q.Index('personal_surveys_by_user'), q.Ref(q.Collection('Users'), personalId)))
            );
            return {
                statusCode: 200,
                body: JSON.stringify({ surveyId: personalSurvey.ref.id }),
            };
        }

        // Create a new personal survey for the user
        const survey = await client.query(
            q.Create(q.Collection('PersonalSurveys'), {
                data: {
                    user_ref: q.Ref(q.Collection('Users'), personalId),
                    created_at: q.Now(),
                },
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ surveyId: survey.ref.id }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create personal survey.' }),
        };
    }
};