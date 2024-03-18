from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pymongo
import gridfs
from pydantic import BaseModel
from typing import Any
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader


# Load environment variables from .env file (if any)
load_dotenv()

class Response(BaseModel):
    result: str | None

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client["file_storage"]
fs = gridfs.GridFS(db)

# Local folder path
local_folder = "uploads"


if not os.path.exists(local_folder):
    os.makedirs(local_folder)

@app.post("/predict", response_model = Response)
async def predict(file: UploadFile = File(...), question: str = Form(...)) -> Any:
    
    # Save file to local folder
    file_location = f"{local_folder}/{file.filename}"
    with open(file_location, "wb") as local_file:
        local_file.write(await file.read())

    # Save file to MongoDB
    with fs.new_file(filename=file.filename, content_type=file.content_type) as grid_file:
        grid_file.write(await file.read())

    

    try:
        # Create a unique directory for each request
        #directory = f"uploads/{file_id}"
        #os.makedirs(directory, exist_ok=True)

        # # Save the document to the unique directory
        #with open(f"{directory}/{file.filename}", "wb") as f:
            #f.write(file.file.read())

        # temp_filename = f"temp/{file_id}/{file.filename}"
        # os.mkdir(f"temp/{file_id}")
        # with open(temp_filename, "wb") as f:
        #     f.write(file.file.read())

        # Index the document with llama
        documents = SimpleDirectoryReader(f"uploads").load_data()
        index = VectorStoreIndex.from_documents(documents)

        #Get the response on the query asked by the user
        query_engine = index.as_query_engine()
        response = query_engine.query(question)
        if os.path.exists(file_location):
            os.remove(file_location)
        return JSONResponse(content={"response": str(response)}, status_code=200)
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)