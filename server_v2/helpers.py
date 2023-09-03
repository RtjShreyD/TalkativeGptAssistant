from tika import parser
from jinja2 import Template

def extract_text_from_document(file_path):
    parsed = parser.from_file(file_path)
    extracted_text = parsed["content"]
    return extracted_text

def templating_to_jinja(filename):
    extracted_text = extract_text_from_document(filename)
    if extracted_text:
        extracted_text=extracted_text.strip()
        templated_text=Template(extracted_text)
        return templated_text
        #print(templated_text.render())
    else:
        return "Text extraction failed."