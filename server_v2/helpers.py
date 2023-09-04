from tika import parser
from jinja2 import Template

def parse_text_document(file_path):
    """Parse a text document and return the parsed content."""
    try:
        with open(file_path, 'r') as file:
            file_content = file.read()
    except FileNotFoundError:
            print(f"The file '{file_path}' does not exist.")
    return file_content

def parse_document_by_tika(file_path, service="all"):
    parsed = parser.from_file(file_path, service=service)
    if (service.lower()=="content"):
        extracted_text = parsed["content"]
    if (service.lower()=="metadata"):
        extracted_text = parsed["metadata"]
    if (service.lower()=="all"):
        extracted_text = parsed
    return extracted_text

def templating_to_jinja(filename):
    extracted_text = parse_document_by_tika(filename, "content")
    if extracted_text:
        extracted_text=extracted_text.strip()
        templated_text=Template(extracted_text)
        return templated_text
        #print(templated_text.render())
    else:
        return "Text extraction failed."