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
