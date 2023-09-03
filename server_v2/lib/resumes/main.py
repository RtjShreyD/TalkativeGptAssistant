from lib.OpenAI_Lib.main import *
from helpers import *

class Analyser:
    def __init__(self, **kwargs):
        self.model = kwargs.get('model_name')
        pass

    def evaluate_characterstics(jinja_templated_resume_text=""):

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
        filled_template = jinja_templated_resume_text.render(
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
                { 
                    is_shortlisted: True/False ,
                    percentage_matching : string percentage value ,
                    characterstics_matched : list of keywords matched
                }

                -is_shortlisted should only tell TRUE only if the percentage_matching is greater than 60%.
                -percentage_matching should be deduced on the basis of your prior experience in filtering resumes on the basis of certain characteristics.
                -characterstics_matched should be list of keywords which have matched in the resume."""
        
        response_from_prompt = fetch_response_from_openAI(prompt)
        query_response=response_from_prompt.choices[0].text.strip()

        print(query_response)
