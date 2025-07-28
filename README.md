# Interview Prep System

An agentic AI  tool for managing interview preparation content including generating and saving multiple study plans with % tracking and finding resources online for the suggested topic to study.


Instructions:

python3 -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows
pip install -r requirements.txt


Run the backend:

uvicorn app.main:app --reload
Backend runs at: http://127.0.0.1:8000

cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:3000

Create a .env file in backend/:

OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key      # (optional)
GOOGLE_CSE_ID=your_cse_id           # (optional)


## Screenshot

![App Screenshot](frontend/assets/app_screenshot.png)
