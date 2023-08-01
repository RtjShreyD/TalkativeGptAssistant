import React, { useCallback, useEffect, useState } from "react";
import "../Css/Chat.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import AudioPlayer from "../components/AudioPlayer";

const tds = {
  start() {
    this.decoder = new TextDecoder(this.encoding, this.options);
  },
  transform(chunk, controller) {
    controller.enqueue(this.decoder.decode(chunk));
  },
};
let _jstds_wm = new WeakMap(); /* info holder */
class TextDecoderStream extends TransformStream {
  constructor(encoding = "utf-8", { ...options } = {}) {
    let t = { ...tds, encoding, options };

    super(t);
    _jstds_wm.set(this, t);
  }
  get encoding() {
    return _jstds_wm.get(this).decoder.encoding;
  }
  get fatal() {
    return _jstds_wm.get(this).decoder.fatal;
  }
  get ignoreBOM() {
    return _jstds_wm.get(this).decoder.ignoreBOM;
  }
}

const examples = [
  "How to use Tailwind CSS",
  "What is the best way for web development?",
  "How to use Tailwind CSS in React",
  "Do you have any tips on how I can improve?",
  "How to use Tailwind CSS in Gatsby",
  "How to use Tailwind CSS in Angular",
  "How to use Tailwind CSS in Next.js",
  "How to use Tailwind CSS in Vue",
];

const Chat = () => {
  const [userChat, setChat] = useState([]);

  const [chatHistory, setchatHistory] = useState([]);

  const [title, setTitle] = useState("");

  const [input, setInput] = useState("");

  const { transcript, listening, resetTranscript } = useSpeechRecognition();


  const startListening = useCallback(() => {
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    console.log("start listening");
  }, []);

  const stopListening = useCallback(() => {
    console.log("stop listening");
    console.log(transcript);
    SpeechRecognition.stopListening();
    setInput(transcript);
    // resetTranscript(); // clear the text in microphone after recording is done
  }, [transcript]);

  const handleSend = useCallback(
    async () => {
      if (input.trim()) {
        setChat([...userChat, { role: "user", content: input }]);
        setInput("");
        resetTranscript();
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...userChat,
              {
                role: "user",
                content: input,
              },
            ],
          }),
        });

        // Show typing effect while waiting for the audio URL
        setChat([
          ...userChat,
          { role: "user", content: input },
          { role: "assistant", content: "Loading..." },
        ]);

        const readData = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let aiRes = "";

        console.log(readData);

        while (true) {
          const { done, value } = await readData.read();
          if (done) {
            break;
          }
          aiRes += value;

        }

        // Delay before calling the AudioPlayer to simulate typing effect
        const typingDelay = 30; // 0.1 second delay (adjust as needed)

        // Get the audio URL from AudioPlayer
        const audioUrl = await AudioPlayer(aiRes);

        const audio = new Audio(audioUrl);
        audio.play();
        
        for (let i = 0; i < aiRes.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, typingDelay));
          const partialAIRes = aiRes.substring(0, i + 1);
          setChat([
            ...userChat,
            { role: "user", content: input },
            { role: "assistant", content: partialAIRes },
          ]);
        }

        if (!title) {
          const createTitle = await fetch("http://localhost:8000/api/title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: input,
            }),
          });

          const title = await createTitle.json();
          setTitle(title?.title);
          setchatHistory([...chatHistory, title]);
        }
      }
    },
    [input,
    chatHistory,
    title,
      userChat,
    resetTranscript]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        // console.log("Control + B / Command + B pressed");
        startListening();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        // console.log("Control + M / Command + M pressed");
        stopListening();
        // resetTranscript();
      } else if (e.key === "Enter") {
        // console.log("Enter Pressed");
        handleSend();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSend, stopListening, startListening]);

  return (
    <div className="chat-container h-screen w-screen flex">
      <div className="left-part w-[20%] h-screen p-4">
        <div className="h-[5%]">
          <button
            className=" w-full h-[50px] border rounded "
            onClick={() => {
              setChat([]);
              setTitle("");
            }}
          >
            + New Chat
          </button>
        </div>
        <div className="chat-history h-[70%] shadow-lg overflow-scroll mb-4 hide-scroll-bar">
          {chatHistory.map((item, index) => (
            <div
              className="chat-item flex items-center py-3 text-center rounded mt-4 text-lg font-light px-8"
              key={index}
            >
              <span className=" mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-message"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M8 9h8"></path>
                  <path d="M8 13h6"></path>
                  <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"></path>
                </svg>
              </span>

              <span className=" text-left">{item.title}</span>
            </div>
          ))}
        </div>

        <div className="settings overflow-scroll shadow-lg h-[20%] border-t hide-scroll-bar">
          {[1, 2, 3].map((item, index) => (
            <div
              className="chat-item flex items-center py-3 text-center rounded mt-4 text-lg font-light px-8"
              key={index}
            >
              <span className=" mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-settings-code"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11.482 20.924a1.666 1.666 0 0 1 -1.157 -1.241a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.312 .318 1.644 1.794 .995 2.697"></path>
                  <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                  <path d="M20 21l2 -2l-2 -2"></path>
                  <path d="M17 17l-2 2l2 2"></path>
                </svg>
              </span>
              Code Settings
            </div>
          ))}
        </div>
      </div>

      <div className="right-part">
        {userChat?.length > 0 ? (
          <div className=" h-[80%] overflow-scroll hide-scroll-bar pt-8">
            {userChat?.map((item, index) => (
              <div
                className={` w-[60%] mx-auto p-6 text-white flex ${
                  item.role === "assistant" && " bg-slate-900 rounded"
                }`}
              >
                <span className=" mr-8 p-2 bg-slate-500 text-white rounded-full h-full">
                  {item.role === "user" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-user-circle"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                      <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                      <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-robot"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-3l-1 -1v-3l1 -1v-1a2 2 0 0 1 2 -2z"></path>
                      <path d="M10 16h4"></path>
                      <circle
                        cx="8.5"
                        cy="11.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <circle
                        cx="15.5"
                        cy="11.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <path d="M9 7l-1 -4"></path>
                      <path d="M15 7l1 -4"></path>
                    </svg>
                  )}
                </span>

                <div
                  className=" leading-loose"
                  style={{ whiteSpace: "break-spaces" }}
                >
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gpt-app text-white">
            <div className="text-4xl font-bold mb-8">App GPT</div>

            <div className=" flex flex-wrap justify-around max-w-[900px]">
              {examples.map((item, index) => (
                <div
                  className=" text-lg font-light mt-4 min-w-[400px] p-4 border rounded cursor-pointer hover:bg-slate-800"
                  onClick={() => setInput(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className=" h-[20%]">
          <div className=" flex flex-col items-center text-white justify-center w-full h-full">
            <div className=" w-[60%] flex justify-center relative">
              <input
                type="text"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                className=" w-full bg-slate-800 text-white rounded-lg p-4 pr-16"
                placeholder="Type your message here..."
              />

              <div className=" absolute right-4 top-2 flex cursor-pointer">
                
                {/* RECORD, STOP Button */}
                {/* Toggle Button */}

                {listening ? (
                  <span className=" p-2" onClick={stopListening}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-player-stop"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path>
                    </svg>
                  </span>
                ) : (
                  <span className=" p-2" onClick={startListening}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-microphone"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"></path>
                      <path d="M5 10a7 7 0 0 0 14 0"></path>
                      <path d="M8 21l8 0"></path>
                      <path d="M12 17l0 4"></path>
                    </svg>
                  </span>
                )}

                {/* Send Button */}

                <span
                  className=" p-2"
                  onClick={() => (input.trim() ? handleSend() : undefined)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-send"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 14l11 -11"></path>
                    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
                  </svg>
                </span>
              </div>
            </div>

            <small className=" text-slate-500 mt-2">
              Ai is becoming Powerfull.
            </small>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chat;
