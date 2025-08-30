// express → A framework to build servers easily (instead of writing pure Node HTTP code).

// http → Node.js module to create a server (Express can handle this internally, but here we explicitly create it).

// dotenv/config → Loads environment variables from a .env file.

// cors → Middleware to allow requests from other domains (important if you’re building APIs).


import express from 'express';
import http from 'http';
import "dotenv/config";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);


//midleware
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.use("/api/status", (req, res) => {
  res.send("Server is running");
});


//routes
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
app.use('/api/messages', messageRouter);
app.use('/api/users', userRouter);

//connect to DB
import connectDB from './lib/db.js';
connectDB();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Add after other middleware
app.use(cookieParser());


