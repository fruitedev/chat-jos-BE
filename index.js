const express = require('express');
const app = express();
const port = 3000;
const cors = require("cors"); // Import CORS package

app.use(cors());


// Middleware to parse incoming JSON requests
app.use(express.json());

// Initialize an array to store conversation history
let history = [];

// GET endpoint to handle chat requests
app.get('/chat', (req, res) => {
  const { threadId, prompt } = req.query;

  // Check if threadId and prompt are provided
  if (!threadId || !prompt) {
    return res.status(400).json({ error: 'threadId and prompt are required' });
  }

  // Find the thread by threadId
  const existingThread = history.find(thread => thread.threadId === threadId);

  if (existingThread) {
    // If thread exists, add the new prompt and response to the conversation
    const responseMessage = 'Continuing conversation response for ' + prompt;
    existingThread.conversations.push({ prompt, response: responseMessage, createdAt: new Date() });

    // Respond with the existing conversation
    return res.status(200).json({
      thread: existingThread,
    });
  }

  // If thread does not exist, create a new one
  const responseMessage = 'New conversation started with prompt ' + prompt;
  const newThread = {
    threadId,
    conversations: [{ prompt, response: responseMessage, createdAt: new Date() }],
  };
  
  // Save the new thread to the history
  history.push(newThread);

  // Respond with the new conversation
  res.status(201).json({
    thread: newThread,
  });
});

// GET endpoint to fetch all conversation history
app.get('/history', (req, res) => {
  res.json(history);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
