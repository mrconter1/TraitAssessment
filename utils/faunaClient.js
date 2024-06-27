require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

const getFaunaClient = () => {
  const secretKey = process.env.DB_KEY;
  if (!secretKey) {
    throw new Error("Oops! We couldn't find the database key. Please contact support.");
  }
  return new faunadb.Client({ secret: secretKey });
};

const handleError = (error, message) => ({
  statusCode: 500,
  body: JSON.stringify({ error: message }),
});

module.exports = { getFaunaClient, handleError, q };