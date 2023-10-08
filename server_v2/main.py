# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # import httpx
# # from typing import List

# # app = FastAPI()

# # # CORS Middleware
# # origins = ["*"]  # You can specify specific origins here
# # app.add_middleware(
# #     CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"]
# # )


# # @app.get("/")
# # def read_root():
# #     return "Hello World"


# # @app.post("/api/chat")
# # async def chat(messages: List[dict]):
# #     try:
# #         data = {
# #             # "model": "gpt-3.5-turbo",
# #             # "messages": [
# #             #     {"role": "system", "content": "You are a helpful assistant."},
# #             #     *messages,
# #             # ],
# #             {
# #                 "messages": [
# #                     {"role": "user", "content": "hi"},
# #                     {"role": "assistant", "content": "Hello, how can I assist you?"},
# #                 ]
# #             }
# #         }

# #         async with httpx.AsyncClient() as client:
# #             response = await client.post(
# #                 "https://api.openai.com/v1/chat/completions",
# #                 headers={
# #                     "Content-Type": "application/json",
# #                     # "Authorization": f"Bearer {YOUR_OPENAI_API_KEY}",
# #                     "Authorization": f"Bearer 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",
# #                 },
# #                 json=data,
# #             )

# #             response.raise_for_status()

# #             content = ""
# #             async with response.stream() as s:
# #                 async for chunk in s.iter_bytes():
# #                     message = chunk.decode().replace("data: ", "").strip()
# #                     if message == "[DONE]":
# #                         break
# #                     content += message

# #             return content

# #     except httpx.HTTPError as e:
# #         raise HTTPException(status_code=500, detail="Error communicating with OpenAI")


# # @app.post("/api/title")
# # async def generate_title(title: str):
# #     try:
# #         data = {
# #             "model": "text-davinci-002",
# #             "prompt": f"Write a 3 words title for the following prompt but do not suggest title as prompt suggest in another way: {title}",
# #             "max_tokens": 100,
# #             "temperature": 0.7,
# #             "n": 1,
# #         }

# #         async with httpx.AsyncClient() as client:
# #             response = await client.post(
# #                 "https://api.openai.com/v1/completions",
# #                 headers={
# #                     "Content-Type": "application/json",
# #                     "Authorization": f"Bearer {YOUR_OPENAI_API_KEY}",
# #                 },
# #                 json=data,
# #             )

# #             response.raise_for_status()

# #             json_data = response.json()
# #             generated_title = json_data["choices"][0]["text"]
# #             return {"title": generated_title}

# #     except httpx.HTTPError:
# #         raise HTTPException(status_code=500, detail="Error generating title")


# # if __name__ == "__main__":
# #     import uvicorn

# #     uvicorn.run(app, host="127.0.0.1", port=8000)


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List
import json

app = FastAPI()

origins = ["http://localhost:3000"]  # Update with your frontend URL
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.post("/api/chat")
async def process_chat(messages: List[dict]):
    data = {
        "model": "gpt-3.5-turbo",
        "stream": True,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            *messages
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            json=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer ${OPEN_API_KEY}"
            }
        )

        response.raise_for_status()
        content = json.loads(response.text)

        async def generate_content():
            async with httpx.AsyncResponse(content_iter=response.aiter_raw) as r:
                async for chunk in r.aiter_bytes():
                    yield chunk.decode()

        return generate_content()

@app.post("/api/title")
async def generate_title(title: str):
    try:
        data = {
            "model": "text-davinci-002",
            "prompt": f"Write a 3 words title for the following prompt but do not suggest title as prompt suggest in another way: {title}",
            "max_tokens": 100,
            "temperature": 0.7,
            "n": 1
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/completions",
                json=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer ${OPEN_API_KEY}"
                }
            )

            response.raise_for_status()
            title_data = json.loads(response.text)
            generated_title = title_data["choices"][0]["text"]
            return {"title": generated_title}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error in getting title")


# from fastapi import FastAPI, Form, HTTPException
# import openai

# # Set your OpenAI API key here
# openai.api_key = "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"

# app = FastAPI()

# @app.post("/chat")
# async def chat_with_gpt(prompt: str = Form(...)):
#     try:
#         response = openai.Completion.create(
#             engine="text-davinci-003",  # You can use other engines as well
#             prompt=prompt,
#             max_tokens=50,  # Adjust the number of tokens as needed
#         )
#         return {"response": response.choices[0].text.strip()}
#     except openai.error.OpenAIError as e:
#         raise HTTPException(status_code=500, detail="Failed to communicate with GPT-3")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
