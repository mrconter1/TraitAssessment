const faunadb = require('faunadb');
const q = faunadb.query;

const secretKey = process.env.DB_KEY;
if (!secretKey) {
    console.error("Error: DB_KEY environment variable is not set.");
    process.exit(1);
}

const client = new faunadb.Client({ secret: secretKey });

const questionsData = [
  {
    "category": "Personal Traits and Interests",
    "traits": [
      {
        "trait": "Wisdom",
        "description": "Wisdom refers to the individual's ability to make sound decisions and judgments based on knowledge and experience."
      },
      {
        "trait": "Arrogance",
        "description": "Arrogance refers to an exaggerated sense of one's own importance or abilities."
      },
      // ... other traits ...
    ]
  },
  // ... other categories ...
];

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

async function setupFaunaDB() {
    try {
        const collections = ['Users', 'Surveys', 'Categories', 'Questions', 'Responses', 'StandardizedAlternatives'];
        for (const collection of collections) {
            await createCollectionIfNotExists(collection);
        }

        const indexes = [
            { name: 'users_by_personal_id', source: 'Users', terms: ['personal_id'], unique: true },
            { name: 'surveys_by_user', source: 'Surveys', terms: ['user_ref'] },
            { name: 'questions_by_survey', source: 'Questions', terms: ['survey_ref'] },
            { name: 'questions_by_category', source: 'Questions', terms: ['category_ref'] },
            { name: 'responses_by_survey', source: 'Responses', terms: ['survey_ref'] },
            { name: 'responses_by_question', source: 'Responses', terms: ['question_ref'] }
        ];

        for (const index of indexes) {
            await createIndexIfNotExists(index.name, index.source, index.terms, index.unique);
        }

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

        // Add categories and questions
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