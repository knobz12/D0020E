from typing import Any
from modules.ai.utils.llm import create_llm
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import  create_collection
#from summarizer import summarize_doc

def summarize_doc(id: str) -> str:
    llm = create_llm()
    vectorstore = create_collection()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs:

Text: {text}

Answer:""".format(text = text)
        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to improve the summary text. 
If you can't improve it simply return the old.
The new summary may only be up to four paragraphs but at least two paragraphs.
Don't directly refer to the context text, pretend like you already knew the context information.

Summary: {summary}

Context: {context}

Answer:""".format(summary = previous_summary,context=text)

        use_prompt = prompt if previous_summary == None else prompt_with_previous
        print(f"Summarizing doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result = llm(use_prompt)
        results.append(result)

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("Summary:")
    summary = results[-1].splitlines()[2:]
    return summary

from transformers import (
    TokenClassificationPipeline,
    AutoModelForTokenClassification,
    AutoTokenizer,
)
from transformers.pipelines import AggregationStrategy
import numpy as np

# Define keyphrase extraction pipeline
class KeyphraseExtractionPipeline(TokenClassificationPipeline):
    def __init__(self, model, *args, **kwargs):
        super().__init__(
            model=AutoModelForTokenClassification.from_pretrained(model),
            tokenizer=AutoTokenizer.from_pretrained(model),
            *args,
            **kwargs
        )

    def postprocess(self, all_outputs):
        results = super().postprocess(
            all_outputs=all_outputs,
            aggregation_strategy=AggregationStrategy.SIMPLE,
        )
        return np.unique([result.get("word").strip() for result in results])


def get_keywords(doc: str) -> list[str]:
    model_name = "ml6team/keyphrase-extraction-kbir-inspec"
    extractor = KeyphraseExtractionPipeline(model=model_name)
    from numpy import ndarray
    result: ndarray = extractor(doc)
    list_result:list[str] = result.tolist()
    return list_result

import guidance
from guidance import gen
from guidance import gen

@guidance()
def explanationGuide(lm, summary: str, keywords: list[str]):
    lm += f"""\
System: You are an assistant explaining topics to students.
Based on the following summary create a detailed text explaining each of the given keywords.
Your text must be at least two paragraphs per keyword.
Don't directly refer to the context text, pretend like you already knew the context information.
Not all keywords have to be explained, only the ones you consider worth explaining.
You don't have to answer with the keywords in the order you're provided. You can reorder them as you think is appropriate.

Summary: {summary}

Keywords: {", ".join(keywords)}

Answer:\n{gen(name="answer")}"""
    return lm

@guidance()
def explainKeyword(lm, summary: str, keyword: str):
    lm += f"""\
System: You are an assistant explaining topics to students.
Based on the following summary create a detailed text explaining the given keyword.
Write at least one paragraphs of text.
Don't directly refer to the context text, pretend like you already knew the context information.
You don't have to answer with the keywords in the order you're provided. You can reorder them as you think is appropriate.

Summary: {summary}

{keyword}:
{gen(name="explanation",max_tokens=150,stop="`")}
```"""
    return lm

import json
def create_explaination_old(id: str, amount: int = 10, custom_keywords: list = []) -> str:

    b = "banan"
    doc_id = "b53998910b5a91c141f890fa76fbcb7f"
    # summary = summarize_doc(doc_id)
    summary = "Separating an application into distinct layers can promote maintainability and scalability by allowing each layer to be modified independently. This approach, known as the Model-View-Controller (MVC) pattern, has gained popularity for designing web applications and GUIs. By separating an application into three interconnected components for data, presentation, and logic, developers can easily modify or replace individual components as needed, allowing for greater flexibility and adaptability in the application's development and maintenance. This approach enables scalability and resilience by allowing each service to be deployed independently, which is particularly useful when adopting new technologies. By using this pattern, developers can ensure that their applications remain responsive and adaptable to changing requirements, making it an effective solution for systems that require real-time responsiveness and adaptability."
    keywords = ["layers","banan"]
    #keywords: list[str] = list(set(get_keywords(summary)))
    print("-----------------------------")
    llm = create_llm_guidance()

    print("Keywords:", keywords)

    answers: list[dict[str,str]] = []
    for keyword in keywords[:1]:
        print("Explaining:",keyword)
        lm = llm + explainKeyword(summary=summary, keyword=keyword)
        answer = str(lm["explanation"]).strip()
        answers.append({keyword:answer})

    result = json.dumps(answers,indent=4)
    print("Result:")
    print(result)
    with open("result.json","w") as f:
        f.write(result)

    for answer in answers:
        (keyword, explanation) = answer
        print(keyword)
        print(explanation, end="\n\n")

    return json.dumps({"keywords":[{"keyword":"principles","explanation":"The SOLID Principles refer to a set of design principles that help in creating software that is more resilient, maintainable, and scalable. These principles are Single Responsibility Principle (SRP), Open-Closed Principle (OCP), Liskov Substitution Principle (LSP), Interface Segregation Principle (ISP), and Dependency Inversion Principle (DIP)."}]})


import json
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import *

import guidance
from guidance import select, gen

from modules.files.chunks import *



from pydantic import BaseModel
from typing import List

from llama_index.program import GuidancePydanticProgram


def calculate_questions_per_doc(total_docs: int, total_questions: int, doc_index: int):
    """
    Calculate the number of questions to generate for a specific document.

    Parameters:
    - total_docs (int): Total number of documents.
    - total_questions (int): Total number of questions to generate.
    - doc_index (int): Index of the current document (0-based).

    Returns:
    - int: Number of questions to generate for the specified document.
    """
    # Ensure that the inputs are valid
    if total_docs <= 0 or total_questions <= 0 or doc_index < 0 or doc_index >= total_docs:
        raise ValueError("Invalid input parameters")

    # Calculate the base number of questions for each document
    base_questions_per_doc = total_questions // total_docs

    # Calculate the remaining questions after distributing the base questions
    remaining_questions = total_questions % total_docs

    # Calculate the actual number of questions for the current document
    questions_for_current_doc = base_questions_per_doc + (1 if doc_index < remaining_questions else 0)

    return questions_for_current_doc


@guidance()
def generate_keywords(lm, context: str, keyword_count: int):

    def gen_keyword(idx: int):
        Keyword: str = f"""\
keyword: "{gen(f"keyword{idx}",stop='"')}"
explaination: "{gen(f"explanation{idx}", stop='"')}"
"""
        return Keyword

    KeywordsStr: str = ""
    for i in range(0, keyword_count):
        KeywordsStr += gen_keyword(i) + "\n"

        



    res = f"""\
The following is a keyword.
Generate an explanation based on the provided context. the explanation for each corresponding question must be true. keep the explanation concise.

Context: {context}

Keywords:

{KeywordsStr}
    """

    # print(res)
    lm += res 
    return lm


class Data(BaseModel):
    data: list[tuple[str, str]]


def create_explaination(id: str, amount: int = 10, custom_keywords: list = []) -> str:
    gllm = create_llm_guidance()
    vectorstore = create_collection()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})


    obj = {}
    obj["keywords"] = []

    for (i, doc) in enumerate(docs["metadatas"]):
        #qsts_count = calculate_questions_per_doc(len(docs["metadatas"]), questions, i)
        result = gllm + generate_keywords(doc["text"], 2)
        # print(result)

        for j in range(0, 2):
            keyword: str = result[f"question{j}"]
            explanation: str = result[f"answer{j}"]
            obj["keywords"].append({"keyword" : keyword, "explanation": explanation})



    json_result: str = json.dumps(obj)
    return json_result
