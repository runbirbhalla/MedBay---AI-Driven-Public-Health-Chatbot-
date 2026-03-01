# MedBay-AI-Driven-Public-Health-Chatbot
MedBay is a multilingual, AI-powered chatbot .The application features a modern, responsive web interface built with Next.js, a powerful FastAPI backend, and is powered by Google's Gemini AI for intelligent, context-aware conversations.

MedBay — AI-Driven Public Health Chatbot (SIH 2025)

MedBay is a multilingual, AI-powered public health assistant developed for Smart India Hackathon 2025 (Problem Statement ID25049). The system is designed to improve healthcare awareness among rural and semi-urban populations by providing accessible, reliable, and easy-to-understand medical guidance.

The platform combines a modern web interface with a scalable backend and advanced language intelligence to deliver preventive healthcare education, symptom guidance, vaccination information, and healthcare accessibility services.

Overview

MedBay addresses the healthcare information gap by offering a conversational interface that simplifies complex medical information and delivers it in a structured and user-friendly manner. The system supports multiple interaction modes including text, voice, and document analysis, making it suitable for users with varying levels of digital literacy.

The application architecture consists of:

Frontend: Responsive web interface for user interaction

Backend: High-performance API handling logic and integrations

AI Layer: Context-aware conversational intelligence

Database: Storage for schedules, reports, and structured health data

External Services: Location, messaging, and analysis integrations

Core Features
Multilingual Menu-Driven Chat

Users interact through a clear guided menu available in multiple languages to ensure accessibility for diverse populations.

Intelligent Conversational Assistance

Symptom Checker: Provides safe preliminary guidance based on reported symptoms

General Health Q&A: Structured answers to health-related questions

Health Myth Buster: Identifies and corrects common misinformation

Real-World Data Integration

Find a Hospital: Locates nearby hospitals using typed location or device GPS

Vaccination Schedules: Age-based official immunization guidance from database records

Outbreak Alerts: Designed for integration with government health databases

AI-Based Medical Analysis

Chest X-Ray Analysis: Upload X-ray images and receive a preliminary AI-generated report with downloadable PDF

Medical Document Analysis: Upload lab reports and ask contextual questions

Accessibility Features

Voice input for queries

Text-to-speech playback of responses

Web and WhatsApp compatibility

User Experience

Responsive interface

Context-aware interaction controls

Dark mode support

Technology Stack
Frontend

Next.js

Tailwind CSS

Backend

FastAPI (Python)

Artificial Intelligence

Google Gemini for conversational reasoning and report generation

Database

Supabase (PostgreSQL)

External APIs

Google Places API (hospital search)

Google Geocoding API (location conversion)

Twilio API (WhatsApp and SMS communication)

Local Setup
Prerequisites

Python 3.10+

Node.js 18+

API keys for:

Google (Gemini, Places, Geocoding)

Supabase

