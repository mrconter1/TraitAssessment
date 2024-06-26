const faunadb = require('faunadb');
const q = faunadb.query;

const secretKey = process.env.FAUNADB_SERVER_SECRET;
if (!secretKey) {
    console.error("Error: FAUNADB_SERVER_SECRET environment variable is not set.");
    process.exit(1);
}

console.log("Using FaunaDB Secret:", secretKey.substring(0, 5) + "..." + secretKey.substring(secretKey.length - 5));

const client = new faunadb.Client({ secret: secretKey });

async function setupFaunaDB() {
    try {
        // Check if the collection already exists
        const collectionName = 'users3';
        const exists = await client.query(q.Exists(q.Collection(collectionName)));
        
        if (!exists) {
            // Create the collection
            const createResult = await client.query(q.CreateCollection({ name: collectionName }));
            console.log("Collection creation result:", createResult);
            console.log(`Collection '${collectionName}' created successfully.`);
        } else {
            console.log(`Collection '${collectionName}' already exists.`);
        }

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