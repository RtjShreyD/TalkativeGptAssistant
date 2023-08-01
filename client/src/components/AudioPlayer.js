import TextToSpeech from "../Api/TextToSpeech";

const AudioPlayer = async (aiRes) => {

  // Call the textToSpeech function to generate the audio data for the text "Hello welcome"
  const data = await TextToSpeech(aiRes);

  // Create a new Blob object from the audio data with MIME type 'audio/mpeg'
  const blob = new Blob([data], { type: "audio/mpeg" });

  // Create a URL for the blob object
  const url = URL.createObjectURL(blob);


  return url;
};

export default AudioPlayer;