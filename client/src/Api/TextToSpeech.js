const TextToSpeech = async (aiRes) => {

  const API_KEY = process.env.REACT_APP_ELEVEN_LABS_API_KEY;
  const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

  const options = {
    method: "POST",
    headers: {
      accept: "audio/mpeg",
      "content-type": "application/json",
      "xi-api-key": API_KEY,
    },
    body: JSON.stringify({
      text: aiRes,
    }),
  };

  try {
    // Sending the API request using Fetch and waiting for the response.
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      options
    );


    if (!response.ok) {
      throw new Error("Network response was not ok");
    }


    const audioData = await response.arrayBuffer();

    console.log("Text to speech");

    // Return the binary audio data received from the API response.
    // console.log(audioData);
    return audioData;
  } catch (error) {
    console.log(error.message);
    console.error("Error fetching data:", error);
  }
};

export default TextToSpeech;
