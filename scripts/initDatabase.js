const faunadb = require('faunadb');
const q = faunadb.query;
const fs = require('fs').promises;
const path = require('path');

const secretKey = process.env.DB_KEY;
if (!secretKey) {
    console.error("Error: DB_KEY environment variable is not set.");
    process.exit(1);
}

const client = new faunadb.Client({ secret: secretKey });

async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}

async function createCollectionIfNotExists(name) {
    const exists = await client.query(q.Exists(q.Collection(name)));
    if (!exists) {
        await client.query(q.CreateCollection({ name }));
        console.log(`Collection '${name}' created.`);
    }
}

async function createIndexIfNotExists(name, source, terms, unique = false) {
    const exists = await client.query(q.Exists(q.Index(name)));
    if (!exists) {
        await client.query(
            q.CreateIndex({
                name: name,
                source: q.Collection(source),
                terms: terms.map(t => ({ field: ['data', t] })),
                unique: unique
            })
        );
        console.log(`Index '${name}' created.`);
    }
}

async function isDatabaseEmpty() {
    const collections = await client.query(q.Paginate(q.Collections()));
    return collections.data.length === 0;
}

async function setupFaunaDB() {
    try {
        const isEmpty = await isDatabaseEmpty();
        if (!isEmpty) {
            console.log("Database is not empty. Setup aborted.");
            return;
        }

        const collections = ['Users', 'Surveys', 'Categories', 'Questions', 'Responses', 'StandardizedAlternatives', 'Invites'];
        for (const collection of collections) {
            await createCollectionIfNotExists(collection);
        }

        const indexes = [
            { name: 'users_by_personal_id', source: 'Users', terms: ['personal_id'], unique: true },
            { name: 'surveys_by_user', source: 'Surveys', terms: ['user_ref'] },
            { name: 'survey_by_id', source: 'Surveys', terms: ['survey_id'], unique: true },
            { name: 'questions_by_survey', source: 'Questions', terms: ['survey_ref'] },
            { name: 'questions_by_category', source: 'Questions', terms: ['category_ref'] },
            { name: 'responses_by_survey', source: 'Responses', terms: ['survey_ref'] },
            { name: 'responses_by_question', source: 'Responses', terms: ['question_ref'] },
            { name: 'responses_by_survey_and_question', source: 'Responses', terms: ['survey_id', 'question_id'], unique: true },
            { name: 'all_categories', source: 'Categories', terms: [] },
            { name: 'all_questions', source: 'Questions', terms: [] },
            { name: 'all_standardized_alternatives', source: 'StandardizedAlternatives', terms: [] },
            { name: 'all_invites', source: 'Invites', terms: [] },
            { name: 'invite_by_invite_id', source: 'Invites', terms: ['invite_id'], unique: true }
        ];

        for (const index of indexes) {
            await createIndexIfNotExists(index.name, index.source, index.terms, index.unique);
        }

        const alternatives = await readJSONFile(path.join(__dirname, 'data', 'alternatives.json'));
        await client.query(
            q.Map(
                alternatives,
                q.Lambda(
                    'alt',
                    q.Create(q.Collection('StandardizedAlternatives'), { data: q.Var('alt') })
                )
            )
        );
        console.log("StandardizedAlternatives added.");

        const questionsData = await readJSONFile(path.join(__dirname, 'data', 'questions.json'));
        for (const category of questionsData) {
            const categoryRef = await client.query(
                q.Create(q.Collection('Categories'), { data: { name: category.category } })
            );
            console.log(`Category '${category.category}' added.`);

            await client.query(
                q.Map(
                    category.traits,
                    q.Lambda(
                        'trait',
                        q.Create(q.Collection('Questions'), {
                            data: {
                                category_ref: categoryRef.ref,
                                trait: q.Select(['trait'], q.Var('trait')),
                                description: q.Select(['description'], q.Var('trait'))
                            }
                        })
                    )
                )
            );
            console.log(`Questions for category '${category.category}' added.`);
        }

        console.log("Database setup complete.");
    } catch (error) {
        console.error("Error setting up database:", error);
    }
}

setupFaunaDB().then(() => {
    console.log("Script execution completed.");
}).catch((error) => {
    console.error("Unhandled error during script execution:", error);
});