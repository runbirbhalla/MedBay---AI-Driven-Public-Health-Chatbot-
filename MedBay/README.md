
-----

# MedBay - AI-Driven Public Health Chatbot (SIH 2025)

**MedBay** is a multilingual, AI-powered chatbot developed for the Smart India Hackathon 2025 (Problem Statement ID25049). It's designed to educate rural and semi-urban populations about preventive healthcare, disease symptoms, vaccination schedules, and more, bridging the healthcare information gap.

The application features a modern, responsive web interface built with Next.js, a powerful FastAPI backend, and is powered by Google's Gemini AI for intelligent, context-aware conversations.

-----

## 🚀 Core Features

MedBay is more than a simple Q\&A bot. It's a comprehensive health assistant with a suite of powerful, accessible features:

  * **Multilingual Menu-Driven Chat:** Users can interact in multiple languages, starting from a clear, easy-to-understand menu.
  * **Intelligent Conversational AI:**
      * **Symptom Checker:** Guides users through their symptoms to provide safe, preliminary advice.
      * **General Health Q\&A:** Provides detailed, well-structured answers to general health questions.
      * **Health Myth Buster:** Debunks common health misinformation with witty, factual, and concise explanations.
  * **Real-World Data Integration:**
      * **Find a Hospital:** Uses the Google Places API to find nearby hospitals, either by typed location or by using the device's current GPS location.
      * **Vaccination Schedules:** Connects to a Supabase database to provide official vaccination schedules based on age.
      * **Outbreak Alerts:** Architected to connect with government health databases for real-time alerts.
  * **Advanced AI Analysis:**
      * **X-Ray Analysis:** Users can upload a chest X-ray image for a preliminary AI analysis, complete with a downloadable PDF report.
      * **Document Analysis:** Users can upload medical documents (like lab reports) and ask specific questions about their content.
  * **High Accessibility:**
      * **Voice Input:** Users can speak their questions directly into the chat.
      * **Read Out Loud:** Every bot response can be read aloud with a single click.
      * **Multi-Platform:** Designed for both web and WhatsApp (via Twilio integration).
  * **Modern User Experience:**
      * A clean, minimalist UI with a responsive sidebar and dark mode.
      * Context-aware buttons, like the location button appearing only when needed.

-----

## 🛠️ Technology Stack

Our system is built on a modern, scalable, and robust architecture.

  * **Frontend:** **Next.js** & **Tailwind CSS** (for a responsive and modern user interface).
  * **Backend:** **FastAPI** (Python) (for a high-performance, asynchronous API).
  * **AI & Language Model:** **Google Gemini** (for conversational logic, persona management, and report generation).
  * **Database:** **Supabase** (PostgreSQL) (for storing vaccination schedules, user data, and generated reports).
  * **External APIs:**
      * **Google Places API:** For the "Find a Hospital" feature.
      * **Google Geocoding API:** For converting coordinates to human-readable addresses.
      * **Twilio API:** For WhatsApp and SMS integration.

-----

## ⚙️ Setup and Installation

To get MedBay running on your local machine, you'll need to set up the backend and frontend separately.

### Prerequisites

  * Python 3.10+
  * Node.js 18.0+
  * Access keys for:
      * Google (Gemini, Places, Geocoding)
      * Supabase
      * Twilio (optional, for WhatsApp)

### 1\. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Create and configure your .env file
#    Create a file named '.env' in the 'backend' directory
#    and add your API keys:
#
#    SUPABASE_URL="YOUR_SUPABASE_URL"
#    SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"
#    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
#    GOOGLE_PLACES_API_KEY="YOUR_GOOGLE_API_KEY"

# 5. Run the FastAPI server
uvicorn main:app --reload
```

Your backend will now be running on `http://127.0.0.1:8000`.

### 2\. Frontend Setup

```bash
# 1. Navigate to the frontend directory in a new terminal
cd frontend

# 2. Install the required Node.js packages
npm install

# 3. Run the Next.js development server
npm run dev
```

Your frontend will now be running on `http://localhost:3000`. Open this URL in your browser to start using MedBay.

-----

## 🔮 Future Scope

Our vision for MedBay is to evolve it into a fully integrated public health platform. Future enhancements include:

  * **Direct Government Database Integration:** For automated, real-time outbreak alerts.
  * **Expanded Language Support:** Adding more regional Indian languages to increase accessibility.
  * **Personalized Health Profiles:** Allowing users to securely track their health records and receive personalized reminders.
  * **Telemedicine Integration:** Connecting users directly with healthcare professionals for consultations.