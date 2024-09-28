const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const express = require('express')
const axios = require('axios')
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs')
const path = require('path');
const app = express()
const port = process.env.PORT || 3000
app.use(bodyParser.json());
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})



const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});


/* ----------------------------------------------- */

const prompt = "Write a story about a magic backpack.";

const streamFunction = async (prompt) => {
    const result = await geminiModel.generateContentStream(prompt);
    
    // Print text as it comes in.
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        // console.log(chunkText);
        process.stdout.write(chunkText);
    }
}

app.post('/api/stream', async(req, res)=>{
  let prompt = req.body.prompt;

  // Set headers to indicate streaming response
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    let result = await geminiModel.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      res.write(chunkText);  // Write each chunk to the response
      // res.send(chunkText);
      // process.stdout.write(chunkText);
    }
    res.end();  // End the response once streaming is complete
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).send('Internal Server Error');
  }

});

// streamFunction(prompt);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})