const faunadb = require('faunadb')
const q = faunadb.query

const secretKey = process.env.FAUNADB_SERVER_SECRET;
if (!secretKey) {
  console.error("Error: FAUNADB_SERVER_SECRET environment variable is not set.");
  process.exit(1);
}

const client = new faunadb.Client({ secret: secretKey })

async function initDatabase() {
  try {
    console.log('Initializing database structure...')

    // Create Collections
    await client.query(q.CreateCollection({ name: 'Users' }))
    await client.query(q.CreateCollection({ name: 'Surveys' }))
    await client.query(q.CreateCollection({ name: 'Questions' }))
    await client.query(q.CreateCollection({ name: 'Responses' }))
    await client.query(q.CreateCollection({ name: 'Categories' }))
    await client.query(q.CreateCollection({ name: 'StandardizedAlternatives' }))

    // Create Indexes
    await client.query(
      q.CreateIndex({
        name: 'users_by_personal_id',
        source: q.Collection('Users'),
        terms: [{ field: ['data', 'personal_id'] }],
        unique: true
      })
    )

    await client.query(
      q.CreateIndex({
        name: 'surveys_by_user',
        source: q.Collection('Surveys'),
        terms: [{ field: ['data', 'user_ref'] }]
      })
    )

    await client.query(
      q.CreateIndex({
        name: 'responses_by_survey_and_question',
        source: q.Collection('Responses'),
        terms: [
          { field: ['data', 'survey_ref'] },
          { field: ['data', 'question_ref'] }
        ]
      })
    )

    await client.query(
      q.CreateIndex({
        name: 'questions_by_category',
        source: q.Collection('Questions'),
        terms: [{ field: ['data', 'category_ref'] }]
      })
    )

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
    ]
    for (let alt of alternatives) {
      await client.query(
        q.Create(q.Collection('StandardizedAlternatives'), { data: alt })
      )
    }

    // Add a Category
    const categoryRef = await client.query(
      q.Create(q.Collection('Categories'), {
        data: { name: 'Personal Traits and Interests' }
      })
    )

    // Add some sample Questions
    const questions = [
      {
        trait: "Wisdom",
        description: "Wisdom refers to the individual's ability to make sound decisions and judgments based on knowledge and experience.",
        id: "PTI-1"
      },
      {
        trait: "Arrogance",
        description: "Arrogance refers to an exaggerated sense of one's own importance or abilities.",
        id: "PTI-2"
      },
      {
        trait: "Resilience",
        description: "Resilience refers to the individual's ability to cope with stress and adversity.",
        id: "PTI-3"
      }
    ]

    for (let question of questions) {
      await client.query(
        q.Create(q.Collection('Questions'), {
          data: {
            ...question,
            category_ref: categoryRef.ref
          }
        })
      )
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()