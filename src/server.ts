import app from './app';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port number:`, PORT);
  connectToDatabase(); 
});

console.log(`ACCESS_TOKEN_SECRET: ${process.env.ACCESS_TOKEN_SECRET ? 'Loaded' : 'Not Loaded'}`);
console.log(`REFRESH_TOKEN_SECRET: ${process.env.REFRESH_TOKEN_SECRET ? 'Loaded' : 'Not Loaded'}`);
