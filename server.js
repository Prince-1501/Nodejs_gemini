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

var question = "what is the value of pie in maths ?";
const generate = async (question) => {
  try {
    const prompt = question;
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.log("response error", error);
  }
};
 
// generate(question);

app.post('/api/content', async (req, res) => {
    let data = req.body.question;
    var result = await generate(data);
    console.log(result);
    res.json({"result" : result});
})

function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }
  const prompt = "Describe what is this ?";

  const imagePart = fileToGenerativePart(
    `./chips.jpg`,
    "image/jpeg",
  );
  
const imageFunction = async() => {
    try {
        const result =  await geminiModel.generateContent([prompt, imagePart]);
        console.log(result.response.text());
    }catch (err) {
        console.log(err);
    }
}  
// imageFunction();

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const { prompt } = req.body;
      const imagePath = path.join(__dirname, 'uploads', req.file.filename);
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
  
      const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
      
      // Simulating result for demo purposes
      const result =  await geminiModel.generateContent([prompt, imagePart]);
      console.log(result.response.text());
        
      // Clean up uploaded file
      fs.unlinkSync(imagePath);
  
      res.json({ message: result.response.text() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });




  
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})