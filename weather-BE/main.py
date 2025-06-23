from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Load the OpenWeatherMap API key
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise RuntimeError("API_KEY is not set in the .env file")

app = FastAPI()

# CORS Configuration: Allow only your deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lasya-weather-app.vercel.app"],  # ✅ YOUR FRONTEND
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/weather")
def get_weather(city: str):
    if not city:
        raise HTTPException(status_code=400, detail="City name is required.")

    # Build OpenWeatherMap API URL
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"q={city}&appid={API_KEY}&units=metric"
    )

    try:
        response = requests.get(url)
        data = response.json()

        if response.status_code != 200 or "main" not in data:
            raise HTTPException(status_code=404, detail="City not found")

        return {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
