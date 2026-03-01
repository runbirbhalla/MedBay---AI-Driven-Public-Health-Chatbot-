// frontend/app/about/page.js
'use client';

import React from 'react';
import { 
    Users, Crosshair, Cpu, Bot, ShieldCheck, HeartPulse, 
    MessageCircle, Ear, Database, Shield, Eye, BookOpen,
    Target, ArrowRight, Star, Calendar, Award, MapPin
} from 'lucide-react';
import Sidebar from '@/components/sidebar';

// Hero Section Component
const HeroSection = () => (
    <section className="relative py-16 lg:py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-gray-900/50 rounded-3xl"></div>
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
                <Target size={16} className="text-green-400" />
                <span className="text-green-300 text-sm">Smart India Hackathon 2025</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6">
                About <span className="text-green-400">MedBay</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Revolutionizing healthcare access in India through innovative technology solutions. 
                A project by <span className="text-green-400 font-semibold">Team Syn3rgy</span> for SIH 2025.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mt-10">
                <div className="flex items-center gap-3 text-green-300">
                    <Calendar className="text-green-400" size={20} />
                    <span>SIH 2025 Project</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                    <MapPin className="text-green-400" size={20} />
                    <span>Healthcare Innovation</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                    <Award className="text-green-400" size={20} />
                    <span>Made in India</span>
                </div>
            </div>
        </div>
    </section>
);

// Reusable component for Feature Cards
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 backdrop-blur-sm transition-all duration-300 hover:border-green-500/50 hover:bg-gray-800/60 h-full group hover:transform hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-3">
            <div className="text-green-400 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

// Reusable component for Team Member Cards
const TeamMemberCard = ({ name, role, specialization }) => (
    <div className="text-center bg-gray-900/50 p-6 rounded-lg border border-gray-800 transition-all duration-300 hover:border-green-500/30 hover:transform hover:-translate-y-1">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-gray-800 mx-auto mb-4 flex items-center justify-center group-hover:from-green-500/30">
            <Users size={40} className="text-green-400" />
        </div>
        <h4 className="text-lg font-semibold text-white mb-1">{name}</h4>
        <p className="text-green-400 text-sm font-medium">{role}</p>
        {specialization && (
            <p className="text-gray-500 text-xs mt-2">{specialization}</p>
        )}
    </div>
);

// Reusable component for a simple list item
const InfoListItem = ({ children }) => (
    <li className="bg-gray-900/50 border border-gray-800 rounded-md px-4 py-3 text-center text-sm text-gray-300 transition-all duration-300 hover:border-green-500/30 hover:text-green-300">
        {children}
    </li>
);

// Section Header Component
const SectionHeader = ({ title, subtitle, icon }) => (
    <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
            {icon && <div className="text-green-400">{icon}</div>}
            <h2 className="text-3xl lg:text-4xl font-bold text-white">{title}</h2>
        </div>
        {subtitle && (
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
            </p>
        )}
    </div>
);

// Main About Page Component
export default function AboutPage() {
    const teamMembers = [
        { name: "Irfan Hussain" },
        { name: "Avik Ray" },
        { name: "Mohamed Shohail Khan" },
        { name: "Om Dahikar" },
        { name: "Nilesh" },
        { name: "Hemashree" }
    ];

    const techStack = [
        "Next.js & React", "Tailwind CSS", "Python", "NLTK Library",
        "Twilio API", "ABDM API", "SupaBase", "SpeechRecognition"
    ];

    return (
        <div className="min-h-screen p-8 lg:p-12 overflow-y-auto">
            <Sidebar/>
            <div className="max-w-6xl mx-auto space-y-20">
                
                {/* Hero Section */}
                <HeroSection />

                {/* Mission Statement */}
                <section className="bg-gradient-to-r from-gray-900/50 to-green-900/20 rounded-2xl p-8 border border-green-500/20">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
                            To democratize healthcare access across India by leveraging cutting-edge technology, 
                            making quality health information and services available to every citizen, regardless of 
                            their location, literacy level, or socioeconomic status.
                        </p>
                    </div>
                </section>

                {/* Key Features Section */}
                <section>
                    <SectionHeader 
                        title="Key Features"
                        subtitle="Comprehensive healthcare solutions designed for India's diverse population"
                        icon={<Star size={32} />}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard 
                            icon={<HeartPulse size={24} />} 
                            title="Information Hub" 
                            description="Provides verified content on preventive care, hygiene, nutrition, and government schemes using advanced NLP." 
                        />
                        <FeatureCard 
                            icon={<ShieldCheck size={24} />} 
                            title="Vaccination Tracker" 
                            description="Sends timely, personalized reminders for immunizations for children and pregnant women." 
                        />
                        <FeatureCard 
                            icon={<Cpu size={24} />} 
                            title="Symptom Analyzer" 
                            description="An interactive system that guides users through symptoms and suggests nearby public health facilities." 
                        />
                        <FeatureCard 
                            icon={<Bot size={24} />} 
                            title="Real-Time Outbreak Alerts" 
                            description="Integrates with government databases (IDSP) to deliver hyper-local updates on disease outbreaks." 
                        />
                        <FeatureCard 
                            icon={<Ear size={24} />} 
                            title="Voice-First Interaction" 
                            description="Supports speech-to-text in native dialects, effectively removing literacy barriers for all users." 
                        />
                        <FeatureCard 
                            icon={<Users size={24} />} 
                            title="ASHA & PHC Support" 
                            description="Assists frontline health workers by automating FAQs, freeing up their valuable time for patient care." 
                        />
                    </div>
                </section>

                {/* Team Section */}
                <section>
                    <SectionHeader 
                        title="Meet The Team: Syn3rgy"
                        subtitle="A passionate team of innovators, developers, and healthcare enthusiasts committed to leveraging technology for social good."
                        icon={<Users size={32} />}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {teamMembers.map((member, index) => (
                            <TeamMemberCard 
                                key={index}
                                name={member.name}
                                role={member.role}
                                specialization={member.specialization}
                            />
                        ))}
                    </div>
                </section>

                {/* Technology Stack Section */}
                <section>
                    <SectionHeader 
                        title="Technology Stack"
                        subtitle="Built with modern technologies for scalability and performance"
                        icon={<Database size={32} />}
                    />
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {techStack.map((tech, index) => (
                            <InfoListItem key={index}>{tech}</InfoListItem>
                        ))}
                    </ul>
                </section>
                
                {/* Vision & Privacy Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900/30 p-8 rounded-2xl border border-gray-800">
                        <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                            <Eye className="text-green-400" /> Our Vision
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            To expand MedBay across India, integrating more regional languages, adding telehealth 
                            consultations, and providing detailed health analytics to empower communities and 
                            inform public policy.
                        </p>
                    </div>
                    <div className="bg-gray-900/30 p-8 rounded-2xl border border-gray-800">
                        <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                            <Shield className="text-green-400" /> Data Privacy & Ethics
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            We are committed to user privacy. All conversations are confidential, and any data 
                            used for analytics is fully anonymized. Your trust is our highest priority.
                        </p>
                    </div>
                </section>

                {/* Acknowledgments Section */}
                <section className="text-center border-t border-gray-800 pt-12">
                    <SectionHeader 
                        title="Acknowledgments"
                        icon={<BookOpen size={32} />}
                    />
                    <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        MedBay is built upon data and guidelines from trusted sources, including the National 
                        Health Portal (NHP) of India, the Ayushman Bharat Digital Mission (ABDM), and the 
                        Integrated Disease Surveillance Programme (IDSP).
                    </p>
                </section>

            </div>
        </div>
    );
}