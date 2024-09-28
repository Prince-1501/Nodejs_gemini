const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express')
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express()
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


// BMI calculation function
function calculateBMI(weight, height) {
    const heightInMeters = height / 100; // Convert height from centimeters to meters
    const bmi = weight / (heightInMeters * heightInMeters); // BMI formula: weight (kg) / [height (m)]^2
    return bmi.toFixed(2); // return BMI rounded to two decimal places
}

const getDietPlan = async (bmi) => {
    let statement = 
    `My bmi is ${bmi} and can you give me a meal plan, 
    according to my BMI value, 
    and the response should be in JSON format as shown below
    
    {
    "BMI": 26,
    "meal_plan": {
        "breakfast": "Oatmeal with fresh fruits and a handful of nuts, or a smoothie with spinach, banana, and almond milk.",
        "lunch": "Grilled chicken or tofu salad with quinoa, mixed greens, avocado, and a light vinaigrette.",
        "dinner": "Baked salmon or lentils with steamed vegetables and brown rice, along with a side of mixed greens."
        }
    }
    
    and i need only JSON response nothing else`
    
    ;
    return await generate(statement);
}

app.post('/calculate-bmi', async (req, res) => {
    const { weight, height } = req.body;

    // Input validation
    if (!weight || !height) {
        return res.status(400).json({ error: "Please provide both weight and height." });
    }

    if (isNaN(weight) || isNaN(height)) {
        return res.status(400).json({ error: "Invalid input. Weight and height should be numbers." });
    }

    // Calculate BMI
    const bmi = calculateBMI(weight, height);

    // Determine the BMI category
    let category = '';
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 24.9) {
        category = 'Normal weight';
    } else if (bmi >= 25 && bmi < 29.9) {
        category = 'Overweight';
    } else {
        category = 'Obesity';
    }

    // Send response with BMI and category
    // res.json({
    //     bmi: bmi,
    //     category: category
    // });

    let dietPlan = await getDietPlan(bmi);
    res.json({dietPlan});
    // res.json({
    //     "diet": dietPlan
    // });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});