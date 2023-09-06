from tika import parser
from jinja2 import Template
import os
import json

def parse_text_document(file_path):     #This function takes the file path of a .txt document then returns its content as a string
    """Parse a text document and return the parsed content."""
    try:
        with open(file_path, 'r') as file:
            file_content = file.read()
    except FileNotFoundError:
        print(f"The file '{file_path}' does not exist.")
    return file_content

def parse_json_document(json_file_path):    #This function takes the file path of a .json document then returns its content as a dictionary string
    try:
        with open(json_file_path, 'r') as file:
            json_string = json.load(file)
        return(json_string)
    except FileNotFoundError:
        return(f"The file '{json_file_path}' does not exist.")

def parse_document_by_tika(file_path, service="all"):   #This function takes the file path of wide range of documents to return its content/metadata/or both
    try:
        parsed = parser.from_file(file_path, service=service)
        if (service.lower()=="content"):
            extracted_text = parsed["content"]
        if (service.lower()=="metadata"):
            extracted_text = parsed["metadata"]
        if (service.lower()=="all"):
            extracted_text = parsed
        return extracted_text
    except FileNotFoundError:
        print(f"The file '{file_path}' does not exist.")

def templating_to_jinja(file_path):     #This function takes the file path of a document then returns its content as a Jinja templated string
    extracted_text = parse_document_by_tika(file_path, "content")
    if extracted_text:
        extracted_text=extracted_text.strip()
        templated_text=Template(extracted_text)
        return templated_text
        #print(templated_text.render())
    else:
        return "Text extraction failed."
    
def extract_variables_from_response(response_text):
    # Split the response text into lines and iterate through them
    lines = response_text.splitlines()
    
    extracted_variables = {}
    
    for line in lines:
        line = line.strip() # Remove leading and trailing whitespace
        if not line:
            continue        # Skip empty lines

        parts = line.split(':')     # Split each line into key and value pairs using ':'
        
        if len(parts) == 2:     # Ensure we have a key and a value
            key = parts[0].strip()
            value = parts[1].strip()
            
            if value.startswith('"') and value.endswith('"'):        # Remove double quotes from string values
                value = value[1:-1]
            
            if value == "True":             # Convert boolean-like strings to actual booleans
                value = True
            elif value == "False":
                value = False
            
            extracted_variables[key] = value
    
    return extracted_variables

from langchain.agents.agent_toolkits import create_python_agent
from langchain.tools.python.tool import PythonAstREPLTool
from langchain.python import PythonREPL
from langchain.llms.openai import OpenAI
from langchain.llms import OpenAI
def query_from_langchain(model="text-davinci-003", query="hi"):
    openai = OpenAI(
            model_name=model,
            verbose=True
        )
    response = openai(query)
    return response