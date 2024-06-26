const faunadb = require('faunadb');
const q = faunadb.query;

const secretKey = process.env.DB_KEY;
if (!secretKey) {
    console.error("Error: DB_KEY environment variable is not set.");
    process.exit(1);
}

console.log("Using FaunaDB Secret:", secretKey.substring(0, 5) + "..." + secretKey.substring(secretKey.length - 5));

const client = new faunadb.Client({ secret: secretKey });

async function createCollectionIfNotExists(name) {
    const exists = await client.query(q.Exists(q.Collection(name)));
    if (!exists) {
        await client.query(q.CreateCollection({ name }));
        console.log(`Collection '${name}' created successfully.`);
    } else {
        console.log(`Collection '${name}' already exists.`);
    }
}

async function createIndexIfNotExists(name, source, terms, unique = false) {
    const exists = await client.query(q.Exists(q.Index(name)));
    if (!exists) {
        await client.query(q.CreateIndex({
            name,
            source: q.Collection(source),
            terms: terms.map(t => ({ field: ['data', t] })),
            unique
        }));
        console.log(`Index '${name}' created successfully.`);
    } else {
        console.log(`Index '${name}' already exists.`);
    }
}

async function setupFaunaDB() {
    try {
        // Create Collections
        await createCollectionIfNotExists('Users');
        await createCollectionIfNotExists('Surveys');
        await createCollectionIfNotExists('Categories');
        await createCollectionIfNotExists('Questions');
        await createCollectionIfNotExists('Responses');
        await createCollectionIfNotExists('StandardizedAlternatives');

        // Create Indexes
        await createIndexIfNotExists('users_by_personal_id', 'Users', ['personal_id'], true);
        await createIndexIfNotExists('surveys_by_user', 'Surveys', ['user_ref']);
        await createIndexIfNotExists('questions_by_survey', 'Questions', ['survey_ref']);
        await createIndexIfNotExists('questions_by_category', 'Questions', ['category_ref']);
        await createIndexIfNotExists('responses_by_survey', 'Responses', ['survey_ref']);
        await createIndexIfNotExists('responses_by_question', 'Responses', ['question_ref']);

        // Add StandardizedAlternatives
        const alternatives = [
            { value: -1, description: "I prefer not to answer" },
            { value: 0, description: "Well below average" },
            { value: 1, description: "Below average" },
            { value: 2, description: "Slightly below average" },
            { value: 3, description: "Average" },
            { value: 4, description: "Slightly above average" },
            { value: 5, description: "Above average" },
            { value: 6, description: "Well above average" }
        ];

        for (let alt of alternatives) {
            await client.query(
                q.Create(q.Collection('StandardizedAlternatives'), { data: alt })
            );
        }
        console.log("StandardizedAlternatives added successfully.");

        // List all collections
        const allCollections = await client.query(q.Paginate(q.Collections()));
        console.log("All collections:", allCollections.data);

        console.log("Database setup and verification complete!");
    } catch (error) {
        console.error("Error setting up or verifying database:", error);
        if (error.description) {
            console.error("Error description:", error.description);
        }
    }
}

setupFaunaDB().then(() => {
    console.log("Script execution completed.");
}).catch((error) => {
    console.error("Unhandled error during script execution:", error);
});