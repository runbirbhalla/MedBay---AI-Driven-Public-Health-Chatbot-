'use client';

import { useState, useEffect, useRef } from 'react';
import { IoMdSend } from 'react-icons/io';
import { MapPin, Mic, Upload } from 'lucide-react';
import { sendMessageToBot } from '../services/api';
import HospitalCard from '@/components/HospitalCard';
import MessageBubble from '@/components/MessageBubble';
import XrayUpload from '@/components/XrayUpload';
import DocumentUpload from '@/components/DocumentUpload';
import axios from 'axios';



const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-3">
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
    </div>
);

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
});


export const queryDocument = async (payload) => {
    try {
      const response = await apiClient.post('/api/document/query/', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
          },
      });
      console.log("📥 QUERY SUCCESS:", response.data);  // 👈 add this
      return response.data;
    } catch (error) {
      console.error("❌ Error querying document:", error.response?.data || error.message);
      throw error.response?.data || error;
    }
  };
  

export default function Chat() {
    const [messages, setMessages] = useState([
        { id: Date.now(), sender: 'bot', text: 'Hello! I am MedBay, your personal health assistant. How can I help you today? \n\n  Please reply with a number from 1-4 to select your language. \n\n 🔤 Available options:\n 1️⃣ English \n 2️⃣ हिंदी (Hindi) \n 3️⃣ ଓଡ଼ିଆ (Odia) \n 4️⃣ தமிழ் (Tamil)'
 },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentIntent, setCurrentIntent] = useState('greeting');
    const [isListening, setIsListening] = useState(false);
    const [context, setContext] = useState(null);
    const [showXrayUpload, setShowXrayUpload] = useState(false);
    const [xrayContext, setXrayContext] = useState('');
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false); // <-- ADD: To show/hide the upload UI
    const [isDocumentContextActive, setIsDocumentContextActive] = useState(false);
    
    const utteranceRef = useRef(null);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const autoSendTimerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (textToSend) => {
        if (!textToSend.trim()) return;
        if (autoSendTimerRef.current) {
            clearTimeout(autoSendTimerRef.current);
            autoSendTimerRef.current = null;
        }

        const exit_keywords = ["end", "exit", "exit session", "end session"];

        const userMessage = { id: Date.now(), sender: 'user', text: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);



        try {
            if (isDocumentContextActive) {
                // --- Document Query Logic ---
                const formData = new FormData();
                formData.append('user_id', 'webapp_user_123');
                formData.append('question', textToSend);
                
                const responseData = await queryDocument(formData);
                
                const botMessage = { sender: 'bot', text: responseData.answer };
                setMessages((prev) => [...prev, botMessage]);
    
            } else {
                // --- General Chat & X-ray Logic ---
                const messagePayload = { 
                    message: {
                        user_id: 'webapp_user_123', 
                        text: textToSend, 
                        language: 'en',
                        context: context 
                    }
                };

            const responseData = await sendMessageToBot(messagePayload);
            if (responseData.data?.medical_report) {
                setContext({ xray_report: responseData.data.medical_report });
            }
            const botMessage = { id: Date.now() + 1, sender: 'bot', text: responseData.reply || null, data: responseData.data || null };
            setMessages((prev) => [...prev, botMessage]);
            // if (responseData.current_intent) setCurrentIntent(responseData.current_intent);
            if (responseData.current_intent) {
                // If switching to a non-xray topic, clear the context
                if (responseData.current_intent !== 'xray_followup' && responseData.current_intent !== 'xray_analysis') {
                    setContext(null);
                }
                if (responseData.current_intent === 'document_analysis') {
                    const uploadMessage = { sender: 'bot', type: 'document_upload' };
                    setMessages((prev) => [...prev, uploadMessage]);
                }
                setCurrentIntent(responseData.current_intent);
            }
        }
        }catch (error) {
            const errorMessage = { id: Date.now() + 1, sender: 'bot', text: 'Sorry, I am having trouble connecting. Please try again.' };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
        
    };


    const messageIdCounter = useRef(0); // Add this ref to your componen




    const handleFormSubmit = (e) => { e.preventDefault(); handleSend(input); };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: '📍 Using my current location...' }]);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleSend(`user_location::${latitude},${longitude}`);
                },
                (error) => {
                    setIsLoading(false);
                    setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Sorry, I could not access your location. Please grant permission.' }]);
                }
            );
        } else {
            setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Your browser doesn't support geolocation." }]);
        }
    };

    const handleXrayUploadClick = () => {
        setShowXrayUpload(!showXrayUpload);
        if (!showXrayUpload) {
            setMessages((prev) => [...prev, { 
                sender: 'bot', 
                text: 'Please upload your chest X-ray image for analysis. I\'ll provide a preliminary report based on AI analysis.' 
            }]);
        }
    };


    // const handleDocumentUploadComplete = (result) => {
    //     // This function is called after the DocumentUpload component succeeds
        
    //     // It should hide the upload UI
    //     // setShowDocumentUpload(false); 
        
    //     // THIS IS THE MOST IMPORTANT LINE - MAKE SURE IT EXISTS AND IS NOT COMMENTED OUT
    //     setIsDocumentContextActive(true); 

    //     console.log("UPLOAD COMPLETE: Setting document context to ACTIVE.");

        
    //     // It should then post the success message to the chat
    //     setMessages((prev) => [...prev, {
    //         id: Date.now(), // Or your unique ID logic
    //         sender: 'bot',
    //         text: "Your document has been processed. You can now ask me questions about it."
    //     }]);
    // };


    const handleDocumentUploadComplete = (result) => {
        // 1. Set the context to activate "document followup" mode on the backend
        setContext({ document_id: 'webapp_user_123' }); // Using user_id as a unique ID for the doc
    
        // 2. Add a confirmation message directly to the chat interface
        const successMessage = {
            id: Date.now(),
            sender: 'bot',
            text: "Your document has been processed. You can now ask me questions about it."
        };
        setMessages((prev) => [...prev, successMessage]);
    };



    
    // const handleDocumentUploadError = (error) => {
    //     // setShowDocumentUpload(false);
    //     setMessages((prev) => [...prev, {
    //         id: Date.now(),
    //         sender: 'bot',
    //         text: `Sorry, there was an error: ${error}`
    //     }]);
    // };


    const handleDocumentUploadError = (error) => {
        const errorMessage = {
            id: Date.now(),
            sender: 'bot',
            text: `Sorry, there was an error: ${error}`
        };
        setMessages((prev) => [...prev, errorMessage]);
    };



    const handleInputChange = (e) => {
        if (autoSendTimerRef.current) {
            clearTimeout(autoSendTimerRef.current);
            autoSendTimerRef.current = null;
        }
        setInput(e.target.value);
    };
    
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support voice recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); setIsListening(false); };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            autoSendTimerRef.current = setTimeout(() => handleSend(transcript), 5000);
        };
        recognition.start();
    };

    const handleSpeak = (message) => {
        if (!window.speechSynthesis) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }
        if (speakingMessageId === message.id) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }
        window.speechSynthesis.cancel();
        
        const cleanedText = message.text
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')   
            .replace(/#{1,6}\s/g, '')         
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/\n/g, ' ');            

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        
        // --- THIS IS THE NEW LOGIC ---
        // Find and set a female voice from the browser's available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a specific high-quality voice first
        let femaleVoice = voices.find(voice => voice.name === 'Google UK English Female' || voice.name === 'Microsoft Zira - English (United States)');
        
        // If not found, fall back to any Indian or US English female voice
        if (!femaleVoice) {
            femaleVoice = voices.find(voice => (voice.lang === 'en-IN' || voice.lang === 'en-US') && voice.gender === 'female');
        }
        
        // A broader fallback if the specific ones aren't available
         if (!femaleVoice) {
            femaleVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Female'));
        }
        
        // If a suitable voice is found, assign it to the utterance
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        // --- END OF NEW LOGIC ---

        utterance.lang = 'en-IN';
        utteranceRef.current = utterance;
        utterance.onstart = () => setSpeakingMessageId(message.id);
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utterance);
    };



    const handleXrayUploadComplete = (result) => {
        setShowXrayUpload(false);
        
        const analysisMessage = {
            id: Date.now(),
            sender: 'bot',
            text: `X-ray Analysis Complete for: ${result.filename}`,
            data: {
                type: 'xray_analysis',
                medical_report: result.medical_report,
                analysis_results: result.analysis_results,
                filename: result.filename,
                pdf_url: result.pdf_url
            }
        };
        setMessages((prev) => [...prev, analysisMessage]);
    
        if (result.medical_report) {
            // --- THIS IS THE CRITICAL STEP ---
            console.log("XRAY UPLOAD COMPLETE: Setting context with report data.");
            setContext({ xray_report: result.medical_report });
            
            const followUpMessage = {
                id: Date.now() + 1,
                sender: 'bot',
                text: "I've reviewed the findings. What would you like to know about the report?"
            };
            setMessages((prev) => [...prev, followUpMessage]);
        }
    };


    

    const handleXrayUploadError = (error) => {
        setShowXrayUpload(false);
        const errorMessage = { 
            sender: 'bot', 
            text: 'Sorry, I encountered an error while analyzing your X-ray image. Please try again or consult with a healthcare professional.' 
        };
        setMessages((prev) => [...prev, errorMessage]);
    };

    return (
        <div className="flex flex-col w-full max-w-3xl h-[87vh] min-h-[500px] bg-white dark:bg-gray-950 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="bg-green-400 text-white p-4 text-center font-bold text-lg">MedBay Assistant</div>
            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg) => {
                    if (msg.type === 'document_upload') {
                        return (
                            <DocumentUpload
                                key={msg.id}
                                onUploadComplete={handleDocumentUploadComplete}
                                onUploadError={handleDocumentUploadError}
                            />
                        );
                    }


                    if (msg.sender === 'bot' && msg.data?.hospitals && msg.data.hospitals.length > 0) {
                        return (
                            <div key={msg.id} className="flex justify-start">
                                <div className="space-y-3">
                                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                        Here are some hospitals I found nearby:
                                    </div>
                                    {msg.data.hospitals.map((hospital, hIndex) => (
                                        <HospitalCard key={hIndex} hospital={hospital} />
                                    ))}
                                </div>
                            </div>
                        );
                    }


                    if (msg.sender === 'bot' && msg.data?.type === 'xray_analysis') {
                        return (
                            <div key={msg.id} className="space-y-3">
                                <div className="flex justify-start">
                                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                        {msg.text}
                                    </div>
                                </div>
                                
                                {/* Medical Report */}
                                <div className="max-w-xs md:max-w-md p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl rounded-bl-none">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 text-sm">Medical Report</h4>
                                    <div className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                                        {msg.data.medical_report}
                                    </div>
                                </div>

                                {/* Analysis Results */}
                                <div className="max-w-xs md:max-w-md p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">Detailed Analysis</h4>
                                    <div className="space-y-2">
                                        {msg.data.analysis_results.slice(0, 5).map((result, rIndex) => (
                                            <div key={rIndex} className="flex justify-between items-center">
                                                <span className="text-xs text-gray-700 dark:text-gray-300">{result.label}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                    result.probability > 0.5 
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        : result.probability > 0.3
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                    {(result.probability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {msg.data.pdf_url && (
                                    <div className="flex justify-start pt-2">
                                        <a
                                            href={msg.data.pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"

                                            download={`MedBay-Report-${msg.data.filename.split('.')[0]}.pdf`}
                                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Download Full Report (PDF)
                                        </a>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="max-w-xs md:max-w-md p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl rounded-bl-none">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                        <strong>Disclaimer:</strong> This is a preliminary AI analysis for informational purposes only. 
                                        Always consult with a qualified healthcare professional for proper medical diagnosis and treatment.
                                    </p>
                                </div>
                            </div>
                        );
                    }



                    if (msg.text) {
                        return (
                            <MessageBubble 
                                key={msg.id} 
                                message={msg} 
                                onSpeak={handleSpeak} 
                                isSpeaking={speakingMessageId === msg.id}
                            />
                        );
                    }
                    return null;
                })}
                {isLoading && <div className="flex justify-start"><div className="bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-none"><TypingIndicator /></div></div>}


                {showXrayUpload && (
                    <div className="space-y-3">
                        <div className="flex justify-start">
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                Upload your chest X-ray image:
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="max-w-xs md:max-w-md">
                                <XrayUpload 
                                    onUploadComplete={handleXrayUploadComplete}
                                    onUploadError={handleXrayUploadError}
                                />
                            </div>
                        </div>
                    </div>
                )}


                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-center space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={input}
                        onChange={handleInputChange}
                        placeholder={isListening ? "Listening..." : "Ask a health question..."}
                        disabled={isLoading}
                    />
                    
                    {currentIntent === 'hospital_finder' && (
                        <button type="button" onClick={handleLocationClick} className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" disabled={isLoading} aria-label="Use current location">
                            <MapPin size={20} />
                        </button>
                    )}


                    {currentIntent === 'xray_analysis' && (
                        <button 
                            type="button" 
                            onClick={handleXrayUploadClick} 
                            className={`p-3 rounded-full transition-colors ${
                                showXrayUpload 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} 
                            disabled={isLoading} 
                            aria-label="Upload X-ray image"
                        >
                            <Upload size={20} />
                        </button>
                    )}

                    

                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        disabled={isLoading}
                        aria-label="Use voice input"
                    >
                        <Mic size={20} />
                    </button>

                    <button type="submit" className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled={isLoading || !input.trim()} aria-label="Send message">
                        <IoMdSend size={20} />
                    </button>

                    
                </div>
            </form>
        </div>
    );
}


