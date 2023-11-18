import os
from tika import parser
from dotenv import load_dotenv

load_dotenv()

def extract_text_from_document(file_path):
    parsed = parser.from_file(file_path)
    extracted_text = parsed["content"]
    return extracted_text

if __name__ == "__main__":
    document_path = "media/resumes/Cristiano Filho - Resume.pdf"  # Replace with the path to your document
    extracted_text = extract_text_from_document(document_path)

    if extracted_text:
        print(extracted_text)
    else:
        print("Text extraction failed.")
