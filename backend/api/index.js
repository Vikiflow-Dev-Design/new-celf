const app = require('../src/server');
const database = require('../src/config/database');

let dbInitPromise = null;
async function ensureDatabaseConnection() {
  try {
    if (!database.isConnected && !dbInitPromise) {
      dbInitPromise = database.connect().catch((err) => {
        console.warn('MongoDB connection failed in serverless environment:', err.message);
        dbInitPromise = null;
      });
    }
    // Await the ongoing initialization if present
    if (dbInitPromise) {
      await dbInitPromise;
    }
  } catch (err) {
    console.warn('Database init error:', err.message);
  }
}

module.exports = async (req, res) => {
  // Attempt to initialize DB on cold start / first request
  await ensureDatabaseConnection();
  // Delegate handling to the Express app
  return app(req, res);
};