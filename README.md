# Full Project Setup Guide

**Run the following commands in order**:

   ```bash
   # Backend Setup
   cd backend
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux; use .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   flask db init
   flask run &  # Runs Flask server in the background

   # Frontend Setup
   cd ..
   cd frontend
   npm i
   npm start

