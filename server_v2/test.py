from lib.OpenAI_Lib.main import *
from lib.resumes.main import *

# Testing openai
#resp = fetch_response_from_openAI("Who is the prime minister of India?")
#print(resp)

# parse_text_document(file_path) test-
#text=parse_text_document(file_path="server_v2/templates/resume/input/software_dev.txt")
#print(text)

# Tika Testcases
#text=parse_document_by_tika("server_v2/media/resumes/Cristiano Filho - Resume.pdf", "content")
#print(text, "\n\n")
#print(Template(text))
#print(Template(text).render())

# Test resumes
document_path = "server_v2/media/resumes/Cristiano Filho - Resume.pdf"
resume_template=templating_to_jinja(document_path)

resume_instance = Analyser
resume_instance.evaluate_characterstics(resume_template)