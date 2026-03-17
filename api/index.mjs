import serverless from 'serverless-http';
import app from '../app.js';
import { connectDB } from '../config/db.js';

let dbConnection;

const ensureDB = async () => {
  if (!dbConnection) {
    dbConnection = connectDB();
  }
  return dbConnection;
};

const handler = serverless(app);

export const config = {
  api: {
    bodyParser: false, // let Express handle parsing
  },
};

export default async function vercelHandler(req, res) {
  await ensureDB();
  return handler(req, res);
}
