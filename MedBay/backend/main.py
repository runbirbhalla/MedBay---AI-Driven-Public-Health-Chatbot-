import os
import re
import json
import httpx
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, constr
from twilio.twiml.messaging_response import MessagingResponse
import uuid
from fpdf import FPDF

# --- INITIAL SETUP ---
load_dotenv()
app = FastAPI(title="MedBay API", description="Backend API for the MedBay Public Health Chatbot", version="1.0.0")

# --- CORS MIDDLEWARE ---
origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- DATABASE & AI CLIENTS SETUP ---
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

gemini_api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)
safety_settings = [{"category": c, "threshold": "BLOCK_MEDIUM_AND_ABOVE"} for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]
gemini_model = genai.GenerativeModel('gemini-2.5-flash', safety_settings=safety_settings)

# --- PYDANTIC MODELS ---
class UserCreate(BaseModel):
    phone_number: constr(min_length=10, max_length=15)
    full_name: str | None = None
    language_preference: str = 'en'
    
class Message(BaseModel):
    user_id: str
    text: str
    language: str = 'en'
    context: dict | None = None

class WebMessage(BaseModel):
    message: Message

class Coordinates(BaseModel):
    latitude: float
    longitude: float


class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'MedBay - AI Chest X-Ray Analysis Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        
    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 5, body)
        self.ln()

    def analysis_table(self, results):
        self.set_font('Arial', 'B', 11)
        self.cell(150, 10, 'Condition Detected', 1, 0, 'C')
        self.cell(40, 10, 'Probability', 1, 1, 'C')
        self.set_font('Arial', '', 11)
        for item in results[:5]: # Top 5 results
            self.cell(150, 10, item['label'], 1, 0)
            self.cell(40, 10, f"{item['probability'] * 100:.1f}%", 1, 1, 'C')
        self.ln()



def generate_and_upload_pdf_report(filename: str, report_text: str, analysis_results: list) -> str:
    """Generates a PDF report, uploads it to Supabase, and returns the public URL."""
    pdf = PDF()
    pdf.add_page()
    
    # Split the text report into sections based on bolded titles
    # This regex handles numbered and non-numbered titles
    report_sections = re.split(r'(\*\*(?:\d\.\s)?.*?\*\*)', report_text)
    
    # Process sections, skipping the initial empty string from split
    i = 1
    while i < len(report_sections):
        if report_sections[i].startswith('**'):
            title = report_sections[i].replace('**', '').strip()
            # The body is the text that follows the title
            body = report_sections[i+1].strip()
            pdf.chapter_title(title)
            pdf.chapter_body(body)
            i += 2 # Move to the next title-body pair
        else:
            i += 1

    pdf.chapter_title("Detailed Analysis Results")
    pdf.analysis_table(analysis_results)
    
    # --- THIS IS THE FIX ---
    # pdf.output() with dest='S' already returns bytes, so no .encode() is needed.
    pdf_bytes = bytes(pdf.output(dest='S'))
    
    # IMPORTANT: Ensure you have a public Supabase bucket named 'medbay-reports'
    # Sanitize filename for the URL
    safe_filename = filename.rsplit('.', 1)[0]
    file_path = f"xray_reports/{uuid.uuid4()}_{safe_filename}.pdf"

    try:
        # The supabase client expects bytes directly
        supabase.storage.from_('medbay-reports').upload(
            file=pdf_bytes,
            path=file_path,
            file_options={"content-type": "application/pdf"}
        )
        return supabase.storage.from_('medbay-reports').get_public_url(file_path)
    except Exception as e:
        print(f"Error uploading PDF to Supabase: {e}")
        return None


# --- STATE MANAGEMENT ---
conversation_state = {}

# --- LANGUAGE MAPPINGS ---
LANGUAGE_OPTIONS = {
    "1": "en",
    "2": "hi", 
    "3": "od",
    "4": "ta"
}

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi", 
    "od": "Odia",
    "ta": "Tamil"
}

# Menu options in different languages
MENU_OPTIONS = {
    "en": {
        "welcome": "Select your language(1-4).\n\n🔤 Available options:\n1️⃣ English\n2️⃣ हिंदी (Hindi)\n3️⃣ ଓଡ଼ିଆ (Odia)\n4️⃣ தமிழ் (Tamil)",
        "menu": "🩺 How can I help you today?\n\n1️⃣ General Health Question\n2️⃣ Symptom Checker\n3️⃣ Find a Hospital\n4️⃣ Vaccination Schedule\n5️⃣ Outbreak Alerts\n6️⃣ X-ray Analysis\n7️⃣ Health Myth Buster\n8️⃣ Analyze Medical Document\n9️⃣ Health Awareness Quiz\n\n💬 Reply with a number (1-9)."
    },
    "hi": {
        "welcome": "🏥 MedBay में आपका स्वागत है! 🏥\n\nकृपया अपनी पसंदीदा भाषा चुनें:\n\n1️⃣ English\n2️⃣ हिंदी (Hindi)\n3️⃣ ଓଡ଼ିଆ (Odia)\n4️⃣ தமிழ் (Tamil)\n\n💬 जारी रखने के लिए संख्या (1-4) के साथ उत्तर दें।",
        "menu": "🩺 आज मैं आपकी कैसे मदद कर सकता हूं?\n\n1️⃣ सामान्य स्वास्थ्य प्रश्न\n2️⃣ लक्षण जांचकर्ता\n3️⃣ अस्पताल खोजें\n4️⃣ टीकाकरण कार्यक्रम\n5️⃣ प्रकोप अलर्ट\n6️⃣ एक्स-रे विश्लेषण\n7️⃣ स्वास्थ्य मिथक बस्टर\n8️⃣ चिकित्सा दस्तावेज़ का विश्लेषण\n9️⃣ स्वास्थ्य जागरूकता प्रश्नोत्तरी\n\n💬 संख्या (1-9) के साथ उत्तर दें।"
    },
    "od": {
        "welcome": "🏥 MedBay ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ! 🏥\n\nଦୟାକରି ଆପଣଙ୍କର ପସନ୍ଦର ଭାଷା ଚୟନ କରନ୍ତୁ:\n\n1️⃣ English\n2️⃣ हिंदी (Hindi)\n3️⃣ ଓଡ଼ିଆ (Odia)\n4️⃣ தமிழ் (Tamil)\n\n💬 ଆଗକୁ ଯିବାକୁ ସଂଖ୍ୟା (1-4) ସହିତ ଉତ୍ତର ଦିଅନ୍ତୁ।",
        "menu": "🩺 ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?\n\n1️⃣ ସାଧାରଣ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନ\n2️⃣ ଲକ୍ଷଣ ଯାଞ୍ଚକାରୀ\n3️⃣ ଡାକ୍ତରଖାନା ଖୋଜନ୍ତୁ\n4️⃣ ଟୀକାକରଣ ସୂଚୀ\n5️⃣ ପ୍ରାଦୁର୍ଭାବ ଆଲର୍ଟ\n6️⃣ ଏକ୍ସ-ରେ ବିଶ୍ଳେଷଣ\n7️⃣ ସ୍ୱାସ୍ଥ୍ୟ ମିଥ୍ ବଷ୍ଟର\n8️⃣ ଚିକିତ୍ସା ଦଲିଲ ବିଶ୍ଳେଷଣ\n9️⃣ ସ୍ୱାସ୍ଥ୍ୟ ସଚେତନତା କୁଇଜ୍\n\n💬 ସଂଖ୍ୟା (1-9) ସହିତ ଉତ୍ତର ଦିଅନ୍ତୁ।"
    },
    "ta": {
        "welcome": "🏥 MedBay இல் உங்களை வரவேற்கிறோம்! 🏥\n\nதயவுசெய்து உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்:\n\n1️⃣ English\n2️⃣ हिंदी (Hindi)\n3️⃣ ଓଡ଼ିଆ (Odia)\n4️⃣ தமிழ் (Tamil)\n\n💬 தொடர எண் (1-4) உடன் பதிலளிக்கவும்।",
        "menu": "🩺 இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?\n\n1️⃣ பொது சுகாதார கேள்வி\n2️⃣ அறிகுறி சரிபார்ப்பாளர்\n3️⃣ மருத்துவமனையைக் கண்டறியவும்\n4️⃣ தடுப்பூசி அட்டவணை\n5️⃣ வெடிப்பு எச்சரிக்கைகள்\n6️⃣ எக்ஸ்-ரே பகுப்பாய்வு\n7️⃣ சுகாதார மூடநம்பிக்கை உடைப்பான்\n8️⃣ மருத்துவ ஆவணம் பகுப்பாய்வு\n9️⃣ சுகாதார விழிப்புணர்வு வினாடி வினா\n\n💬 எண் (1-9) உடன் பதிலளிக்கவும்।"
    }
}

# --- BOT TOOLS (Functions the AI can use) ---
def find_hospitals_data(location_query: str) -> str:
    """Finds real hospitals using Google Places API."""
    print(f"TOOL: Searching for real hospitals with query: {location_query}")
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        return json.dumps({"error": "Google Places API key is not configured."})
    is_coords = "user_location::" in location_query
    if is_coords:
        coords = location_query.split('::')[1]
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {"location": coords, "radius": 10000, "type": "hospital", "key": api_key, "region": "IN"}
    else:
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {"query": f"hospitals near {location_query}", "key": api_key, "region": "IN"}
    try:
        with httpx.Client() as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        if data.get("status") == "OK" and data.get("results"):
            hospitals = []
            for place in data["results"][:4]:
                hospitals.append({
                    "name": place.get("name"), "address": place.get("vicinity") or place.get("formatted_address", "N/A"),
                    "rating": place.get("rating", "N/A"), "total_ratings": place.get("user_ratings_total", 0)
                })
            return json.dumps({"hospitals": hospitals})
        else:
            return json.dumps({"hospitals": [], "message": f"Sorry, I couldn't find any hospitals for that location."})
    except Exception as e:
        print(f"An unexpected error in find_hospitals_data: {e}")
        return json.dumps({"error": "An unexpected error occurred."})

def get_vaccination_schedule_data(age_in_weeks: int) -> str:
    """Fetches vaccination data from the Supabase database for a given age."""
    print(f"TOOL: Getting vaccination schedule for age: {age_in_weeks} weeks")
    try:
        data, count = supabase.table('vaccination_schedules').select('vaccine_name, description').lte('age_due_in_weeks', age_in_weeks).order('age_due_in_weeks', desc=True).limit(5).execute()
        if count and len(data[1]) > 0:
            return json.dumps(data[1])
        return json.dumps([{"message": "No vaccination information found for that specific age."}])
    except Exception as e:
        print(f"Database error in get_vaccination_schedule_data: {e}")
        return json.dumps([{"error": "Could not fetch vaccination data."}])

def get_outbreak_alerts_data(location: str) -> str:
    """Checks for public health outbreak alerts. (MOCK IMPLEMENTATION)"""
    print(f"TOOL: Checking for outbreaks near: {location}")
    if "chennai" in location.lower():
        return json.dumps({"alert": "Dengue Fever advisory issued for Chennai. Please take precautions."})
    return json.dumps({"alert": "No major outbreak alerts for your location."})

# --- PERSONA PROMPTS (UPDATED) ---
PERSONAS = {
    "general_qna": """
    You are MedBay, a knowledgeable and clear AI health educator. Your personality is that of a trusted doctor explaining a topic.
    Your primary goal is to make the user knowledgeable about the topic they ask about in a single, comprehensive response.
    IMPORTANT: Keep your entire response concise and under 150 words.

    Use the following structure for your answer:
    1.  **Overview:** A simple, direct summary of the topic.
    2.  **Key Points:** A bulleted list of the most important details (symptoms, causes, etc.).
    3.  **Prevention/Management:** An actionable paragraph on prevention or general home care.
    4.  **Disclaimer:** ALWAYS end with: "For medical advice tailored to your specific situation, please consult a healthcare professional."
    """,
    "symptom_checker": """
    You are MedBay's Health Advisor, an empathetic, direct, and safety-focused virtual doctor persona. Your goal is to provide a possible explanation for a user's symptoms and advise them within a maximum of two messages.
    When responding, always use the following structure:
    Acknowledgment – Briefly restate the symptoms to show understanding.
    **Possible Explanations –** List 2–3 common or possible conditions that could explain the symptoms.
    **Relief Guidance –** Suggest broad categories of supportive care (e.g., "rest," "hydration," "pain relievers").
    **Next Step –** Provide a clear suggestion on what the user should do next (e.g., monitor symptoms, seek medical care if they worsen).
    Rules: Keep the entire interaction within a maximum of two messages. You may ask only one clarifying question if absolutely necessary.
    """,
    "hospital_finder": """
    You are an AI assistant whose only job is to extract a location from the user's message to find a hospital.
    RULES: If the message contains ANY plausible location (like a city, neighborhood, landmark, pincode, or coordinates), you MUST extract it and respond ONLY with a JSON object.
    If the message contains NO location information, you MUST ask the user for their location.
    EXAMPLES:
    - User message: "Chennai" -> Your JSON response: {"tool_needed": "find_hospitals", "argument": "Chennai"}
    - User message: "find hospitals near VIT Chennai, Kelambakam" -> Your JSON response: {"tool_needed": "find_hospitals", "argument": "VIT Chennai, Kelambakam"}
    - User message: "user_location::12.84,80.22" -> Your JSON response: {"tool_needed": "find_hospitals", "argument": "user_location::12.84,80.22"}
    - User message: "yes please" -> Your response: "To find a hospital, I'll need your location. You can type a city or use the location button."
    """,
    "vaccination_schedule": """
    You are MedBay's Vaccination Specialist. Your only goal is to get the patient's age to provide a schedule.
    RULES:
    1.  If the user's message clearly states an age (e.g., "12 years old", "6 weeks"), you MUST respond ONLY with a JSON object like this: {"tool_needed": "get_vaccination_schedule", "argument": "THE_AGE"}.
    2.  If the conversation history shows you have ALREADY asked for the age, you MUST assume the user's new message is the age and respond with the JSON object.
    3.  If the message does NOT contain an age and you have NOT yet asked for it, your ONLY response should be to ask for the age.
    """,
    "outbreak_alerts": """
    You are MedBay's Public Health Officer. Your ONLY goal is to get the user's location to check for alerts.
    If you get a location, respond with a JSON object: {"tool_needed": "get_outbreak_alerts", "argument": "LOCATION"}.
    If not, ask for the location.
    """,
    # --- NEW PERSONA ADDED ---
    "myth_buster": """
    You are MedBay's Health Myth Buster. Your personality is that of a witty, slightly sarcastic, and no-nonsense doctor who has heard it all before. You get straight to the point.
    Your goal is to debunk health myths quickly and memorably. Your entire response MUST be under 120 words.

    When the user states a myth, you MUST respond in the following structure:
    1.  **The Myth:** State the myth clearly. Use Markdown for bolding: "**Myth:** [The user's belief]".
    2.  **The Fact:** Provide the scientifically accurate fact with a witty or sarcastic edge. Use Markdown for bolding: "**Fact:** [The scientific fact]".
    3.  **The Reality Check:** A short, direct explanation of why the myth is wrong.

    EXAMPLE:
    User: "Do detox diets cleanse your body?"
    Your Response:
    Ah, the magical "detox" diet. Let's get into it.

    **Myth:** Special detox diets and expensive juices are needed to cleanse your body of toxins.
    **Fact:** Your body already has a world-class, 24/7 detox system. It's called your liver and kidneys, and they work for free.

    **The Reality Check:** Those fancy cleanses mostly just "cleanse" your wallet. Your organs are pros at filtering waste. Instead of buying a pricey juice subscription, just drink water and eat some vegetables. Your liver will thank you for not making its job harder. It's always best to stick with what science actually supports.
    """,
    "xray_analysis": """
    You are MedBay's X-ray Analysis Specialist. Your goal is to help users upload and analyze chest X-ray images.
    
    RULES:
    1. If the user mentions wanting to upload an X-ray or analyze a chest X-ray image, guide them to upload their image.
    2. Explain that this is a preliminary AI analysis and professional medical consultation is always required.
    3. Keep responses concise and focused on the upload process.
    
    EXAMPLES:
    - User message: "I want to analyze my chest X-ray" -> Your response: "I can help you analyze your chest X-ray image. Please upload your X-ray image and I'll provide a preliminary analysis. Remember, this is for informational purposes only and you should always consult with a healthcare professional for proper medical interpretation."
    - User message: "upload X-ray" -> Your response: "Please upload your chest X-ray image using the upload button. I'll analyze it and provide you with preliminary findings. Keep in mind that professional medical consultation is essential for accurate diagnosis."
    """,
    "xray_followup": """
    You are MedBay, a helpful AI health assistant. Your ONLY task is to answer the user's questions based on the chest X-ray report provided in the conversation history.
    RULES:
    1.  **Use Only the Report:** Base all your answers strictly on the information within the X-ray report.
    2.  **Do Not Diagnose:** Do not provide any new medical advice, diagnosis, or interpretations beyond what is written in the report.
    3.  **Explain Simply:** If the user asks what a term means (e.g., "What is infiltration?"), provide a simple, general definition but immediately relate it back to what the report says.
    4.  **Always Remind:** Conclude every answer by gently reminding the user to consult a qualified healthcare professional for a proper diagnosis and treatment plan.
    5.  **Be Empathetic:** Acknowledge that medical reports can be confusing and maintain a supportive tone.
    """,
    "health_quiz": """
    You are MedBay's Quiz Master. Your goal is to start a health awareness quiz.
    Your ONLY response should be: "Let's test your health awareness! Please answer with the letter of your choice (A, B, C, or D)."
    """,

    "document_analysis": """
    You are MedBay's Document Analysis Specialist. Your goal is to help users upload a medical document (like a lab report or prescription) for analysis.

    RULES:
    1.  Guide the user to upload their PDF document using the upload button.
    2.  Explain that they will be able to ask questions about the document's content after the upload is complete.
    3.  Keep the tone helpful and direct.

    EXAMPLE:
    Your response: "I can help you analyze a medical document. Please upload your PDF file (e.g., lab report, prescription), and I'll prepare it so you can ask questions about its contents."
    """,
    "document_followup": """
    You are MedBay, an AI health assistant. Your ONLY task is to answer the user's questions based on an uploaded document's context that will be provided to you.
    RULES:
    1. Base all your answers strictly on the information from the document.
    2. Do not provide any new medical advice or diagnosis beyond what is in the document.
    3. If the information is not in the document, state that clearly.
    4. ALWAYS remind the user to consult a healthcare professional.
    """
}

FORMATTING_PERSONA = """
You are MedBay, an AI health assistant. Your only job is to take the following JSON data and present it to the user in a clear, friendly, and well-formatted summary.
RULES:
1.  **Identify the main topic.** For example, if all items are for the "Typhoid Vaccine", make that the main heading using bold Markdown (`**`).
2.  **Summarize, don't just list.** Briefly explain what the data represents.
3.  **Group and list the details.** Use a clean, bulleted list (`*`) for the different descriptions or options available.
4.  **Be concise and user-friendly.** Add a concluding sentence advising the user to consult a doctor.
"""

# --- CORE CONVERSATIONAL ENGINE ---
def get_intent_from_menu(text: str) -> str | None:
    """Parses the user's menu selection."""
    clean_text = text.strip()
    if "1" in clean_text: return "general_qna"
    if "2" in clean_text: return "symptom_checker"
    if "3" in clean_text: return "hospital_finder"
    if "4" in clean_text: return "vaccination_schedule"
    if "5" in clean_text: return "outbreak_alerts"
    if "6" in clean_text: return "xray_analysis"
    if "7" in clean_text: return "myth_buster"
    if "8" in clean_text: return "document_analysis"
    if "9" in clean_text: return "health_quiz"
    return None

def check_for_intent_change(text: str, current_intent: str) -> str | None:
    """Uses the LLM to see if the user wants to switch topics."""
    if not text or len(text) < 5:
        return None

    # This new prompt is much more explicit about how to handle follow-up modes.
    prompt = f"""
    You are an expert intent detection AI. Your task is to determine if a user's message indicates a desire to switch to a COMPLETELY DIFFERENT TASK.

    The user is currently in the '{current_intent}' task.
    The user's new message is: "{text}"

    --- CRITICAL INSTRUCTIONS ---
    1. If the current task is 'xray_followup' or 'document_followup', the user is in a special Q&A mode about a specific report they just uploaded.
    2. In this special mode, you MUST assume their message is a question about that report unless they explicitly ask for a completely different task using action words.
    3. For example, if the current task is 'xray_followup' and the user asks "What does this report say?", this is a CONTINUATION. Your response MUST be {{"new_intent": "None"}}.
    4. ONLY if they ask "find a hospital" or "check my symptoms" should you switch the intent.

    --- AVAILABLE TASKS ---
    - 'hospital_finder': User wants to find a clinic, doctor, or hospital.
    - 'symptom_checker': User wants to describe their symptoms.
    - 'xray_analysis': User wants to START A NEW ANALYSIS by uploading an x-ray scan or x-ray image.
    - 'document_analysis': User wants to START A NEW ANALYSIS by uploading a lab report.
    - 'vaccination_schedule': User asks about vaccine for children.
    - 'myth_buster': User asks if a health belief is true.
    - 'general_qna': User asks a general health question not covered by other tasks.

    Does the user's new message clearly indicate they want to switch to a new task from the list above?
    Your response MUST be ONLY a valid JSON object like {{"new_intent": "the_new_intent_name"}} or {{"new_intent": "None"}}.
    """
    try:
        response = gemini_model.generate_content(prompt)
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if not json_match: return None
        decision = json.loads(json_match.group(0))
        new_intent = decision.get("new_intent")

        # --- HARDCODED RULE TO PREVENT SWITCHING FROM FOLLOWUP TO ANALYSIS ---
        # This is a safety net in case the AI still gets it wrong.
        if (current_intent == "xray_followup" and new_intent == "xray_analysis"):
            return None
        if (current_intent == "document_followup" and new_intent == "document_analysis"):
            return None

        if new_intent and new_intent != "None" and new_intent in PERSONAS:
            return new_intent
        return None
    except Exception as e:
        print(f"INTENT_SWITCH_ERROR: {e}")
        return None



def process_message(user_id: str, text: str, language: str = 'en', context: dict = None) -> tuple:
    """
    The conversational engine, returns a tuple of (response_text, current_intent, data_payload).
    """
    if user_id not in conversation_state:
        conversation_state[user_id] = {"current_intent": "language_selection", "history": [], "selected_language": None}
    
    user_session = conversation_state[user_id]
    current_intent = user_session.get("current_intent", "language_selection")
    history = user_session.get("history", [])
    selected_language = user_session.get("selected_language", None)

    exit_keywords = ["end", "exit", "exit session", "end session", "menu", "start"]
    greeting_keywords = ["hi", "hello", "hey", "menu", "start"]

    # --- 1. HANDLE SESSION RESET ---
    if text.lower().strip() in exit_keywords:
        print(f"SESSION RESET for user {user_id}")
        if user_id in conversation_state:
            del conversation_state[user_id]
        return process_message(user_id, "hello", language, context=None)

    # --- 2. HANDLE CONTEXT OVERRIDES ---
    active_context_intent = None
    if context:
        if "document_id" in context:
            active_context_intent = "document_followup"
        elif "xray_report" in context:
            active_context_intent = "xray_followup"
            user_session["current_intent"] = "xray_followup"

    intent_to_check_against = active_context_intent or current_intent
    new_intent = check_for_intent_change(text, intent_to_check_against)

    if new_intent and new_intent != intent_to_check_against:
        print(f"SWITCHING INTENT from {intent_to_check_against} to {new_intent}")
        user_session["current_intent"] = new_intent
        user_session["history"] = []
        current_intent = new_intent
        active_context_intent = None
    else:
        current_intent = intent_to_check_against

    # --- 3. HANDLE FOLLOW-UP CONTEXTS ---
    if active_context_intent == "document_followup":
        pdf_response = query_pdf_service_sync(user_id, text)
        response_text = pdf_response.get("answer", "Sorry, I couldn't get an answer from the document.")
        return response_text, "document_followup", None

    if active_context_intent == "xray_followup" and context and "xray_report" in context:
        report_content = context["xray_report"]
        persona = PERSONAS["xray_followup"]
        prompt = (f"{persona}\n---\nPROVIDED X-RAY REPORT:\n{report_content}\n---\n"
                  f"USER'S QUESTION:\n\"{text}\"")
        try:
            response = gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            return response_text, "xray_followup", None
        except Exception as e:
            print(f"Error during X-ray follow-up: {e}")
            return "I'm sorry, I had trouble processing that question about the report.", "xray_followup", None

    # --- 4. MENU SELECTION ---
    if current_intent == "greeting" and len(history) > 0:
        chosen_intent = get_intent_from_menu(text)
        if chosen_intent:
            user_session["current_intent"] = chosen_intent
            current_intent = chosen_intent
            history.append({'role': 'user', 'parts': [text]})

            # --- Extra Twilio check for xray_analysis ---
            is_twilio_user = user_id.startswith("whatsapp:")
            if chosen_intent == 'xray_analysis' and is_twilio_user:
                response_text = "I can provide a preliminary analysis of a chest X-ray. Please send the image to me now."
                history.append({'role': 'model', 'parts': [response_text]})
                return response_text, current_intent, None

            persona = PERSONAS[chosen_intent]
            # Use selected language for the conversation
            user_language = selected_language or "en"
            prompt = f"{persona}\nYour response must be in '{user_language}' language.\n---\nThe user has selected this topic. Please provide your opening message."
            try:
                response = gemini_model.generate_content(prompt)
                response_text = response.text.strip()
                history.append({'role': 'model', 'parts': [response_text]})
                return response_text, chosen_intent, None
            except Exception as e:
                print(f"Error getting opening message: {e}")
                return "I'm sorry, I had trouble starting that topic.", "greeting", None
        else:
            # Show error in selected language
            user_language = selected_language or "en"
            if user_language == "hi":
                error_msg = "❌ गलत चयन। कृपया मेनू से एक संख्या (1-9) के साथ उत्तर दें।"
            elif user_language == "od":
                error_msg = "❌ ଭୁଲ ଚୟନ। ଦୟାକରି ମେନୁରୁ ଏକ ସଂଖ୍ୟା (1-9) ସହିତ ଉତ୍ତର ଦିଅନ୍ତୁ।"
            elif user_language == "ta":
                error_msg = "❌ தவறான தேர்வு। தயவுசெய்து மெனுவிலிருந்து ஒரு எண் (1-9) உடன் பதிலளிக்கவும்।"
            else:
                error_msg = "❌ Invalid selection. Please reply with a number (1-9) from the menu."
            return error_msg, "greeting", None

    # --- 5. HEALTH QUIZ HANDLING ---
    if current_intent == "health_quiz":
        quiz_state = user_session.get("quiz")
        response_text = ""

        if quiz_state:
            last_question_index = quiz_state['current_question_index']
            user_answer = text.strip()
            quiz_state['user_answers'].append(user_answer)

            if last_question_index < len(quiz_state['questions']):
                last_question = quiz_state['questions'][last_question_index]
                if user_answer.upper() == last_question['correct']:
                    quiz_state['score'] += 1
                    response_text += "Correct! ✅\n\n"
                else:
                    response_text += f"Not quite. The correct answer was {last_question['correct']}. ❌\n\n"
            
            quiz_state['current_question_index'] += 1
        else:
            new_quiz_questions = generate_health_quiz()
            if not new_quiz_questions:
                return "I'm sorry, I couldn't create a quiz right now. Please try again later.", "greeting", None
            
            user_session['quiz'] = {
                'score': 0,
                'current_question_index': 0,
                'questions': new_quiz_questions,
                'user_answers': []
            }
            quiz_state = user_session['quiz']
            
            persona = PERSONAS['health_quiz']
            prompt = f"{persona}\n---\n The user has just selected this topic. Please provide your opening message."
            try:
                opening_response = gemini_model.generate_content(prompt)
                response_text += opening_response.text.strip() + "\n\n"
            except Exception:
                response_text += "Let's test your health awareness!\n\n"

        if quiz_state['current_question_index'] >= len(quiz_state['questions']):
            final_score = quiz_state['score']
            awareness_summary = generate_quiz_summary(
                score=final_score,
                questions=quiz_state['questions'],
                user_answers=quiz_state['user_answers']
            )
            response_text += (
                f"Quiz complete! 🧠\n\n"
                f"Your final score is {final_score} out of 5.\n\n"
                f"{awareness_summary}\n\n"
                f"Type 'hello' to return to the main menu."
            )
            del user_session['quiz']
            user_session['current_intent'] = 'greeting'
            history.extend([{'role': 'user', 'parts': [text]}, {'role': 'model', 'parts': [response_text]}])
            return response_text, 'greeting', None

        next_q_data = quiz_state['questions'][quiz_state['current_question_index']]
        options_text = "\n".join([f"{key}. {value}" for key, value in next_q_data['options'].items()])
        response_text += f"{next_q_data['question']}\n{options_text}"

        history.extend([{'role': 'user', 'parts': [text]}, {'role': 'model', 'parts': [response_text]}])
        return response_text, current_intent, None

    # --- 6. LANGUAGE SELECTION HANDLER ---
    if current_intent == "language_selection":
        if text.strip() in LANGUAGE_OPTIONS:
            selected_lang = LANGUAGE_OPTIONS[text.strip()]
            user_session["selected_language"] = selected_lang
            user_session["current_intent"] = "greeting"
            
            # Show menu in selected language
            menu_message = f"✅ Language selected: {LANGUAGE_NAMES[selected_lang]}\n\n{MENU_OPTIONS[selected_lang]['menu']}"
            history.append({'role': 'user', 'parts': [text]})
            history.append({'role': 'model', 'parts': [menu_message]})
            return menu_message, "greeting", None
        else:
            error_message = "❌ Invalid selection. Please reply with a number from 1-4 to select your language.\n\n🔤 Available options:\n1️⃣ English\n2️⃣ हिंदी (Hindi)\n3️⃣ ଓଡ଼ିଆ (Odia)\n4️⃣ தமிழ் (Tamil)"
            return error_message, "language_selection", None

    # --- 7. FIRST MESSAGE HANDLER ---
    if text.lower().strip() in greeting_keywords or text.lower().strip() in exit_keywords:
        # Always start with language selection
        welcome_message = MENU_OPTIONS["en"]["welcome"]
        user_session["current_intent"] = "language_selection"
        user_session["selected_language"] = None
        history.append({'role': 'user', 'parts': [text]})
        history.append({'role': 'model', 'parts': [welcome_message]})
        return welcome_message, "language_selection", None

    # --- 8. DEFAULT HANDLER (General Q&A and Tools) ---
    persona = PERSONAS.get(current_intent, PERSONAS["general_qna"])
    user_language = selected_language or language or "en"
    prompt = f"{persona}\nYour response must be in '{user_language}'.\n---\nCONVERSATION HISTORY:\n{history}\n---\nUSER'S NEW MESSAGE:\n\"{text}\"\n---\nYOUR RESPONSE:"

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()

        tool_command = None
        try:
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match: tool_command = json.loads(json_match.group(0))
        except json.JSONDecodeError:
            tool_command = None

        if tool_command and "tool_needed" in tool_command:
            tool_name = tool_command["tool_needed"]
            argument = tool_command["argument"]
            
            if tool_name == "find_hospitals":
                hospitals_data = find_hospitals_data(argument)
                structured_response = json.loads(hospitals_data)
                history.append({'role': 'user', 'parts': [text]})
                history.append({'role': 'model', 'parts': [json.dumps(structured_response)]})
                return "Here are some hospitals I found:", current_intent, structured_response

            tool_result_data = ""
            if tool_name == "get_vaccination_schedule":
                age_argument = str(argument).lower()
                age_in_weeks = 0
                nums = re.findall(r'\d+', age_argument)
                if nums:
                    age_val = int(nums[0])
                    if "year" in age_argument or (age_val > 1 and "month" not in age_argument and "week" not in age_argument): age_in_weeks = age_val * 52
                    elif "month" in age_argument: age_in_weeks = age_val * 4
                    else: age_in_weeks = age_val
                tool_result_data = get_vaccination_schedule_data(age_in_weeks)
            elif tool_name == "get_outbreak_alerts":
                tool_result_data = get_outbreak_alerts_data(argument)
            
            if tool_result_data:
                formatting_prompt = f"{FORMATTING_PERSONA}\nYou received this data: {tool_result_data}.\nPresent it to the user in '{user_language}'."
                final_response = gemini_model.generate_content(formatting_prompt)
                response_text = final_response.text
        
        history.append({'role': 'user', 'parts': [text]})
        history.append({'role': 'model', 'parts': [response_text]})
        return response_text, current_intent, None

    except Exception as e:
        print(f"Error in conversational engine: {e}")
        import traceback
        traceback.print_exc()
        return "I'm sorry, I encountered a technical issue. Please try rephrasing.", current_intent, None










# In main.py (place this with your other functions)

def generate_health_quiz() -> list | None:
    """Uses Gemini to generate a 5-question health quiz and returns it as a list of dicts."""
    prompt = """
    You are an AI assistant that creates educational health quizzes.
    Your task is to generate a random set of 5 multiple-choice questions about general health awareness. The topics should be suitable for a general audience and cover areas like nutrition, common diseases, first aid, and healthy habits.

    You MUST return the quiz in a valid JSON format. The format should be a JSON array, where each element is an object representing a question.
    Each question object must have three keys:
    1. "question": A string containing the question text.
    2. "options": An object with four keys ("A", "B", "C", "D"), where each value is a string for the option text.
    3. "correct": A single character string ("A", "B", "C", or "D") indicating the correct answer.

    Do not include any text, explanation, or markdown formatting before or after the JSON array. Your entire response must be only the JSON data.
    """
    try:
        response = gemini_model.generate_content(prompt)
        # Clean up the response to extract only the JSON part
        json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if json_match:
            quiz_data = json.loads(json_match.group(0))
            # Basic validation to ensure we got 5 questions
            if isinstance(quiz_data, list) and len(quiz_data) == 5:
                print("Successfully generated new health quiz.")
                return quiz_data
        print("Failed to parse or validate quiz JSON from LLM.")
        return None
    except Exception as e:
        print(f"Error generating health quiz from Gemini: {e}")
        return None

# In main.py (place this with your other functions)

def generate_quiz_summary(score: int, questions: list, user_answers: list) -> str:
    """Uses Gemini to generate a personalized summary of the user's quiz performance."""
    
    # Format the detailed results for the prompt
    formatted_results = ""
    for i, q in enumerate(questions):
        user_ans = user_answers[i] if i < len(user_answers) else "No Answer"
        status = "Correct" if user_ans.strip().upper() == q['correct'] else "Incorrect"
        formatted_results += f"- Question: {q['question']}\n  - Status: {status}\n"

    prompt = f"""
    You are an AI health assistant providing feedback. A user just scored {score}/5 on a health quiz.

    Here are the questions and how they answered:
    {formatted_results}

    Based on these results, write a personalized, encouraging summary of their health awareness in about 30 words.
    Do not repeat their score. You can mention topics they seem to know well or could improve on.
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating quiz summary: {e}")
        # Fallback to a generic summary if the LLM fails
        if score <= 2:
            return "You have a good start! There's a great opportunity to learn more about some key health topics."
        else:
            return "Great job! You have a strong foundational knowledge of important health and wellness topics."


# In main.py

# ... (place this near your other helper functions)

# In main.py

# ... (keep other code the same)

async def process_xray_from_url(image_url: str) -> str:
    """Downloads an image from a URL using Twilio Auth and following redirects, analyzes it, and returns a text report."""
    try:
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        auth = (account_sid, auth_token)

        # --- THE FIX: Initialize the client to automatically follow redirects ---
        async with httpx.AsyncClient(follow_redirects=True) as client:
            
            # 1. Download the image. The client will now handle the 307 redirect automatically.
            print(f"Downloading image from: {image_url}")
            image_response = await client.get(image_url, auth=auth, timeout=30.0)
            
            image_response.raise_for_status() # This will now check the status of the FINAL URL (which should be 200 OK)
            image_data = image_response.content
            content_type = image_response.headers.get("content-type", "image/jpeg")

            # 2. Send the downloaded image to your analysis service
            xray_service_url = "http://localhost:8001/predict"
            files = {"file": ("whatsapp_xray.jpg", image_data, content_type)}
            analysis_response = await client.post(xray_service_url, files=files, timeout=60.0)
            analysis_response.raise_for_status()
            xray_results = analysis_response.json()
            
            # 3. Generate the text-based medical report
            analysis_data = xray_results.get("results", [])
            if not analysis_data:
                return "The analysis did not return any findings. Please ensure you sent a clear chest X-ray image."

            text_report = generate_xray_medical_report(analysis_data)
            return text_report
            
    except httpx.HTTPStatusError as e:
        print(f"HTTP Error downloading image: {e.response.status_code}")
        return "I couldn't access the image from WhatsApp. It might have expired or there's a permission issue. Please try sending it again."
    except Exception as e:
        print(f"Error processing X-ray from URL: {e}")
        return "I'm sorry, an error occurred while analyzing the image. Please ensure it's a valid chest X-ray file and try again."

# --- WEBHOOK ENDPOINTS ---
@app.post("/webhook/web")
def handle_web_message(web_input: WebMessage):
    response_text, current_intent, data_payload = process_message(
        web_input.message.user_id, 
        web_input.message.text, 
        web_input.message.language, 
        web_input.message.context
    )

    if data_payload:
        return {"data": data_payload, "current_intent": current_intent, "reply": response_text}
    # Otherwise, return the standard text reply
    else:
        return {"reply": response_text, "current_intent": current_intent}





@app.post("/webhook/twilio")
async def handle_twilio_message(
    Body: str = Form(), 
    From: str = Form(), 
    NumMedia: int = Form(0), 
    MediaUrl0: str = Form(None)
):
    final_response_text = ""
    try:
        # Check if the incoming message contains an image
        if NumMedia > 0 and MediaUrl0:
            final_response_text = await process_xray_from_url(MediaUrl0)
        else:
            # If no image, process it as a regular text message
            response_text, current_intent, data_payload = process_message(From, Body, 'en')
            final_response_text = response_text

            # Format data payload if it exists (e.g., for hospitals)
            if data_payload and "hospitals" in data_payload and data_payload.get("hospitals"):
                hospital_list_text = "\n\nHere are some hospitals I found nearby:\n"
                for hospital in data_payload["hospitals"]:
                    rating = hospital.get('rating', 'N/A')
                    hospital_list_text += f"\n- {hospital['name']} (Rating: {rating})\n  Address: {hospital['address']}\n"
                final_response_text += hospital_list_text
    
    except Exception as e:
        print(f"Error in Twilio webhook: {e}")
        final_response_text = "I'm sorry, a critical error occurred. Please try again later."

    # Create and send the TwiML response for WhatsApp
    response = MessagingResponse()
    response.message(final_response_text)
    return Response(content=str(response), media_type="application/xml")



# --- OTHER ENDPOINTS ---
@app.get("/")
def read_root(): return {"Project": "MedBay", "Status": "Healthy"}
@app.get("/health")
def health_check(): return {"status": "ok"}
@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    try:
        data, count = supabase.table('users').insert(user.dict()).execute()
        if count and len(data[1]) > 0: return {"message": "User created successfully", "user": data[1][0]}
        else: raise HTTPException(status_code=400, detail="Could not create user.")
    except Exception as e: raise HTTPException(status_code=400, detail=str(e))

@app.get("/users/phone/{phone_number}")
def get_user_by_phone(phone_number: str):
    try:
        data, count = supabase.table('users').select('*').eq('phone_number', phone_number).execute()
        if count and len(data[1]) > 0: return {"user": data[1][0]}
        else: raise HTTPException(status_code=404, detail="User not found.")
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
        
@app.get("/vaccination-schedules")
def get_all_vaccination_schedules():
    try:
        data, count = supabase.table('vaccination_schedules').select('*').order('age_due_in_weeks').execute()
        return {"schedules": data[1]}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/xray-upload")
async def upload_xray_image(file: UploadFile = File(...)):
    """
    Uploads an X-ray, gets analysis, generates a text and PDF report, 
    and returns URLs and data.
    """
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file.")
        
        image_data = await file.read()
        xray_service_url = "http://localhost:8001/predict"
        
        async with httpx.AsyncClient() as client:
            files = {"file": (file.filename, image_data, file.content_type)}
            response = await client.post(xray_service_url, files=files, timeout=60.0)
            response.raise_for_status()
            xray_results = response.json()
        
        analysis_data = xray_results.get("results", [])
        
        text_report = generate_xray_medical_report(analysis_data)
        pdf_url = generate_and_upload_pdf_report(file.filename, text_report, analysis_data)
        
        return {
            "status": "success",
            "filename": file.filename,
            "analysis_results": analysis_data,
            "medical_report": text_report,
            "pdf_url": pdf_url
        }
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"X-ray analysis service is unavailable: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Error from X-ray analysis service: {e.response.text}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while processing the X-ray image.")




def generate_xray_medical_report(results):
    """
    Generates a medical report based on X-ray analysis results using Gemini AI.
    """
    try:
        # Format the results for the AI
        conditions_text = "\n".join([
            f"- {result['label']}: {result['probability']:.2%} probability"
            for result in results[:5]  # Top 5 conditions
        ])
        
        prompt = f"""
        You are a medical AI assistant analyzing chest X-ray results. Based on the following analysis results, provide a clear, professional medical report:

        Analysis Results:
        {conditions_text}

        Please provide:
        1. A brief summary of the findings
        2. The most significant conditions detected (if any with >30% probability)
        3. General recommendations for follow-up
        4. Important disclaimers about the limitations of AI analysis

        Keep the report concise (under 200 words) and use professional medical language while remaining accessible to patients.
        Always emphasize that this is a preliminary analysis and professional medical consultation is required.
        """
        
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Error generating medical report: {e}")
        return "Unable to generate detailed report at this time. Please consult with a healthcare professional for proper interpretation of your X-ray results."



@app.post("/api/reverse-geocode")
def reverse_geocode(coords: Coordinates):
    """Converts latitude and longitude into a more specific, human-readable address."""
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured.")
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"latlng": f"{coords.latitude},{coords.longitude}", "key": api_key}
    try:
        with httpx.Client() as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        if data["status"] == "OK" and data["results"]:
            first_result = data["results"][0]
            locality, sublocality, state = "", "", ""
            for component in first_result.get("address_components", []):
                if "sublocality_level_1" in component["types"]: sublocality = component["long_name"]
                elif "locality" in component["types"]: locality = component["long_name"]
                elif "administrative_area_level_1" in component["types"]: state = component["short_name"]
            if sublocality and locality: display_name = f"{sublocality}, {locality}"
            elif locality and state: display_name = f"{locality}, {state}"
            else: display_name = first_result.get("formatted_address", "Unknown Location")
            return {"displayName": display_name}
        else:
            error_message = data.get("error_message", "No results found.")
            print(f"GOOGLE GEOCODE API ERROR: Status was '{data.get('status')}'. Message: {error_message}")
            return {"displayName": "Unknown Location"}
    except Exception as e:
        print(f"Error in reverse_geocode: {e}")
        raise HTTPException(status_code=500, detail="Error contacting geocoding service.")



@app.post("/api/document/upload/")
async def forward_document_upload(user_id: str = Form(...), file: UploadFile = File(...)):
    """
    Forwards the PDF and user_id to the separate PDF analysis service.
    """
    pdf_service_url = "http://localhost:8002/upload-pdf/" # URL of your PDF microservice
    
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    file_data = await file.read()
    
    # Prepare the data and file for forwarding
    files = {'file': (file.filename, file_data, file.content_type)}
    data = {'user_id': user_id}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(pdf_service_url, files=files, data=data, timeout=60.0)
            response.raise_for_status() # Raise an exception for 4xx or 5xx status codes
            return response.json()
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="PDF analysis service is unavailable.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Error from PDF analysis service: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.post("/api/document/query")
async def forward_document_query(user_id: str = Form(...), question: str = Form(...)):
    """
    Forwards the user's question to the separate PDF analysis service.
    """
    pdf_service_url = "http://localhost:8002/chat/" # URL of your PDF microservice
    data = {'user_id': user_id, 'question': question}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(pdf_service_url, data=data, timeout=30.0)
            response.raise_for_status()
            return response.json()
            
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="PDF analysis service is unavailable.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Error from PDF analysis service: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

def query_pdf_service_sync(user_id: str, question: str) -> dict:
    """Synchronously calls the PDF query service."""
    pdf_service_url = "http://localhost:8002/chat/"
    data_to_forward = {'user_id': user_id, 'question': question}
    try:
        with httpx.Client() as client:
            # CHANGE: Use data= to send as form data instead of json=
            response = client.post(pdf_service_url, data=data_to_forward, timeout=30.0)
            
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Exception in query_pdf_service_sync: {e}")
        return {"answer": "Sorry, I was unable to connect to the document analysis service."}
# This is where your existing @app.post("/api/xray-upload") endpoint starts...