from lib.OpenAI_Lib.main import *
from lib.resumes.main import *

# Testing openai
#resp = fetch_response_from_openAI("Who is the prime minister of India?")
#print(resp)

# Test resumes
document_path = "server_v2/media/resumes/Cristiano Filho - Resume.pdf"
resume_template=templating_to_jinja(document_path)

resume_instance = Analyser
resume_instance.evaluate_characterstics(resume_template)