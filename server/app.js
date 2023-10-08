const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const port = 8000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  console.log(req.body);
  const data = {
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      ...messages,
    ],
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        ...data,
        messages: [...data.messages, ...messages],
      }),
    });

    response.body.on("data", (data) => {
      const lines = data
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        console.log(message, "message");

        if (message === "[DONE]") {
          return res.end();
        }

        const { choices } = JSON.parse(message);
        const { content } = choices[choices.length - 1].delta || {};

        if (content) {
          res.write(content);
        }
      }
    });
  } catch (error) {
    console.log(error.message, "error");
  }
});

app.use(express.json()); // Middleware to parse JSON requests

app.post("/api/call", async (req, res) => {
  try {
    console.log("hello");
    console.log("Received request with body:", req.body); 
    // console.log("Received request with prompt:",req.body.voiceInput);

    // const content  = "how are you";
    const content = req.body.messages[0].content;
    console.log("content value is : ",content)
    console.log("hello");
    // Define the conversation as an array of message objects
    const messages = [
      { role: "system", content: "You are a creative, funny, friendly and amusing AI assistant named Joanna. Please provide engaging but concise responses." },
      { role: "user", content: content },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Choose the appropriate model
        messages: messages, // Pass the conversation as messages
        max_tokens: 100, // Adjust as needed
        temperature: 0.7, // Adjust the temperature as needed
        n:1,
      }),
    });
  // console.log(completion.choices[0].message)
    const data = await response.json();
    console.log(data);
    console.log(data.choices[0].message)
    const generatedResponse = data?.choices?.[0]?.message;
    console.log(generatedResponse)


    // Send the generated response to respond.js
    // You can define your logic here to send it to respond.js as needed

    res.status(200).json({ response: generatedResponse });
  } catch (error) {
    console.error("Error in generating response:", error);
    res.status(500).json({ error: "Error in generating response" });
  }
});



app.post("/api/title", async (req, res) => {
  try {
    const { title } = req.body;

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-002",
        prompt: `Write a 3 words title for the following prompt but do not suggest title as prompt suggest in another way: ${title}`,
        max_tokens: 100,
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();
    res.status(200).json({ title: data?.choices?.[0]?.text });
  } catch (error) {
    console.log(error, "Error in getting Title");
    res.status(500).json({ error: "Error in getting Title" });
  }
});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
