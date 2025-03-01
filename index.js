const express = require('express');
const cors = require("cors"); // Import CORS package
const OpenAI = require('openai');

const app = express();
const port = 3012;

app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Initialize an array to store conversation history
let history = [];

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

// Function to pause execution for a given number of milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// GET endpoint to handle chat requests
app.get('/chat', async (req, res) => {
  const { threadId, prompt } = req.query;

  // Check if threadId and prompt are provided
  if (!threadId || !prompt) {
    return res.status(400).json({ error: 'threadId and prompt are required' });
  }

  // Sleep for 5 seconds before proceeding
  await sleep(5000);

  // Find the thread by threadId
  const existingThread = history.find(thread => thread.threadId === threadId);

  // Get response from OpenAI API
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt, }],
      model: 'gpt-4o',
    });

    const responseMessage = chatCompletion.choices[0].message.content;
    //console.log(responseMessage)

    if (existingThread) {
      // If thread exists, add the new prompt and response to the conversation
      existingThread.conversations.push({ prompt, response: responseMessage, createdAt: new Date() });

      // Respond with the existing conversation
      return res.status(200).json({
        thread: existingThread,
      });
    }

    // If thread does not exist, create a new one
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
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to get response from OpenAI API' });
  }
});

// GET endpoint to fetch all conversation history
app.get('/history', (req, res) => {
  res.json(history);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
