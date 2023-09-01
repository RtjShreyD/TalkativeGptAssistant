class Analyser:
    def step1():
        
        import os
        import openai
        from langchain.llms import OpenAI
        from dotenv import load_dotenv
        from PyPDF2 import PdfReader
        from langchain.embeddings.openai import OpenAIEmbeddings
        from langchain.text_splitter import CharacterTextSplitter
        from langchain.vectorstores import FAISS
        from langchain.chains.question_answering import load_qa_chain
        from typing_extensions import Concatenate
        from tika import parser
        from jinja2 import Template

        load_dotenv()

        openai.api_key = os.getenv("OPENAI_API_KEY")

        def extract_text_from_document(file_path):
            parsed = parser.from_file(file_path)
            extracted_text = parsed["content"]
            return extracted_text
        
        document_path = "Cristiano Filho - Resume.pdf"
        extracted_text = extract_text_from_document(document_path)
        if extracted_text:
            extracted_text=extracted_text.strip()
            resume_template=Template(extracted_text)
            #print(resume_template.render())
        else:
            print("Text extraction failed.")


        # Get user input for the template fields
        position_title = input("Enter Position Title: ")
        duration = input("Enter Duration in Years: ")
        industry = input("Enter Industry: ")
        primary_skills = input("Enter Primary Skills (comma-separated): ")
        secondary_skills = input("Enter Secondary Skills (comma-separated): ")
        degree = input("Enter Degree: ")
        field_of_study = input("Enter Field of Study: ")
        project_keywords = input("Enter Project Keywords (comma-separated): ")
        misc_keywords = input("Enter Miscellaneous Keywords (comma-separated): ")
        location_preference = input("Enter Preferred Location: ")
        language_proficiencies = input("Enter Language Proficiencies (comma-separated): ")

        # Render the template with user inputs
        filled_template = resume_template.render(
            position_title=position_title,
            duration=duration,
            industry=industry,
            primary_skills=primary_skills,
            secondary_skills=secondary_skills,
            degree=degree,
            field_of_study=field_of_study,
            project_keywords=project_keywords,
            misc_keywords=misc_keywords,
            location_preference=location_preference,
            language_proficiencies=language_proficiencies
        )

        prompt = filled_template + "\n\n" + """Action- 
                Generate a prompt based on the provided details to query from the provided resume, whether the profile is suitable or not. Return only JSON output. Json output should contain the following fields-
                { is_shortlisted: True/False ,
                  percentage_matching : string percentage value ,
                  characterstics_matched : list of keywords matched
                }

                -is_shortlisted should only tell TRUE only if the percentage_matching is greater than 60%.
                -percentage_matching should be deduced on the basis of your prior experience in filtering resumes on the basis of certain characteristics. 
                -characterstics_matched should be list of keywords which have matched in the resume."""
        #print(prompt)


        response = openai.Completion.create(
            engine="text-davinci-003",  # You can use other engines as well
            prompt=prompt,
            max_tokens=150,  # Adjust as needed
            stop=None  # You can add stopping criteria if required
        )

        query=response.choices[0].text.strip()
        print(query)
