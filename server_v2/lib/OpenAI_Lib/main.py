import openai
from configs.config import configs

openai.api_key = configs['OPENAI_API_KEY']

def fetch_response_from_openAI(engine="text-davinci-003" ,prompt="Hello", token=150, **kwargs): #service parameter='content', 'all'
    response = openai.Completion.create(
            engine=engine,  # You can use other engines as well
            prompt=prompt,
            max_tokens=token,  # Adjust as needed
            stop=None  # You can add stopping criteria if required
        )
    return response