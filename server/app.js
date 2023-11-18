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

let session_id = ''

app.post(`/api/chat`, async (req, res) => {

  // if(window.reload)

  // let session_id = req.session_id;

  const { messages } = req.body;

  if (!session_id) {
    // Make an HTTP POST request to initialize the resource
    // Set up the necessary headers
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${process.env.MED_AUTH_TOKEN}`, // Replace with your actual token
      "Content-Type": "application/json",
    };

    // Define the request payload for initialization
    const initializeRequest = {
      session_id: "",
    };

    // Make an HTTP POST request to initialize the resource
    try {
      const initializeResponse = await fetch(
        "https://medagentv1.excelus.ai/initialise",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(initializeRequest),
        }
      );

      if (initializeResponse.ok) {
        const initializeData = await initializeResponse.json();
        session_id = initializeData.details.session_id;
        agent_msg = initializeData.details.agent_response;
        console.log("Initialization successful. Session ID:", session_id);
        console.log("Agent_welcome_message:", agent_msg);
      } else {
        console.error(
          "Initialization request failed:",
          initializeResponse.status,
          initializeResponse.statusText
        );
        res.send("Initialization request failed");
      }
    } catch (error) {
      console.error("Error during initialization request:", error);
      res.send("Error during initialization request");
    }

  }

  const userInp = messages[messages.length - 1].content; // Assuming user input is in the last message

  try {
    const chatResponse = await fetch("https://medagentv1.excelus.ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MED_AUTH_TOKEN}`, // Replace with your actual token
      },
      body: JSON.stringify({
        session_id: session_id, // Replace with your session ID logic
        human_message: userInp,
      }),
    });

    if (!chatResponse.ok) {
      console.error(
        "Error from chat endpoint:",
        chatResponse.status,
        chatResponse.statusText
      );
      return res.status(500).json({ error: "Error from chat endpoint" });
    }

    const chatData = await chatResponse.json();
    console.log(chatData);

    // Extract the agent's response from chatData
    const agentResponse = chatData.details.agent_response;
    console.log(agentResponse);

    res.send(agentResponse);
  } catch (error) {
    console.error("Error making chat API request:", error);
    res.status(500).json({ error: "Error making chat API request" });
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
    // console.log(data, 'data');
    res.status(200).json({ title: data?.choices?.[0]?.text });

  } catch (error) {
    console.log(error, "Error in getting Title")
    res.status(500).json({ error: "Error in getting Title" });
  }

  

})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
