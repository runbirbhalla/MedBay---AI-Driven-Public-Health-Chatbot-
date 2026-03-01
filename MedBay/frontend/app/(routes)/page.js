// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import Sidebar from "../../components/sidebar";


// // --- MOCK API SERVICE ---
// const sendMessageToBot = (payload) => {
//   const lowerCaseText = payload.text.toLowerCase();
//   let botReply =
//     "I'm sorry, I can only provide information on a few topics right now. Please ask about the flu, diabetes, or burns.";

//   if (lowerCaseText.includes("flu")) {
//     botReply = `Common symptoms of the flu include:\n\n- Fever or feeling feverish/chills\n- Cough\n- Sore throat\n- Runny or stuffy nose\n- Muscle or body aches\n- Headaches\n- Fatigue (tiredness)`;
//   } else if (lowerCaseText.includes("diabetes")) {
//     botReply = `Type 2 diabetes is a chronic condition that affects how your body metabolizes sugar (glucose).\n\nKey management strategies include:\n1. Healthy eating\n2. Regular exercise\n3. Medication or insulin therapy\n4. Blood sugar monitoring`;
//   } else if (lowerCaseText.includes("burn")) {
//     botReply = `For a minor burn (first-degree or small second-degree):\n\n1. Cool the burn for ~10 minutes under cool running water.\n2. Remove rings or tight items before swelling.\n3. Don't break blisters.\n4. Apply aloe vera or a mild lotion.\n5. Cover with sterile, non-fluffy dressing.\n\nFor major burns, seek immediate medical help.`;
//   }

//   return new Promise((resolve) => {
//     setTimeout(() => resolve({ reply: botReply }), 900);
//   });
// };

// // --- small UI components (same as before) ---
// const SendIcon = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <line x1="22" y1="2" x2="11" y2="13" />
//     <polygon points="22 2 15 22 11 13 2 9 22 2" />
//   </svg>
// );

// const CopyIcon = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
//     <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
//   </svg>
// );

// const CheckIcon = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <polyline points="20 6 9 17 4 12" />
//   </svg>
// );

// const TypingIndicator = () => (
//   <div className="flex items-center space-x-1.5 p-4">
//     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
//     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
//     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
//   </div>
// );

// const SuggestedPrompt = ({ text, onClick }) => (
//   <button
//     onClick={() => onClick(text)}
//     className="bg-gray-800/80 text-gray-300 px-4 py-2 rounded-lg text-sm text-left hover:bg-gray-700 transition-colors"
//   >
//     {text}
//   </button>
// );

// const BotMessage = ({ text }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     });
//   };

//   return (
//     <div className="group relative">
//       <button
//         onClick={handleCopy}
//         className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
//         aria-label="Copy message"
//       >
//         {copied ? (
//           <CheckIcon className="h-4 w-4 text-green-500" />
//         ) : (
//           <CopyIcon className="h-4 w-4" />
//         )}
//       </button>
//       <div className="whitespace-pre-wrap break-words">{text}</div>
//     </div>
//   );
// };

// // --- MAIN PAGE ---
// export default function HomePage() {
//   const [messages, setMessages] = useState([
//     {
//       sender: "bot",
//       text: "Hello! I am MedBay. How can I assist with your health questions today?",
//       timestamp: new Date(),
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   const handleSend = async (messageText) => {
//     const textToSend = typeof messageText === "string" ? messageText : input;
//     if (!textToSend.trim()) return;

//     const userMessage = {
//       sender: "user",
//       text: textToSend,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsLoading(true);

//     try {
//       const response = await sendMessageToBot({ text: textToSend });
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: response.reply, timestamp: new Date() },
//       ]);
//     } catch (error) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: "Sorry, I am having trouble connecting. Please try again.",
//           timestamp: new Date(),
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     handleSend();
//   };

//   const showSuggestedPrompts = messages.length === 1;

//   return (
//     <>
//       <style jsx global>{`
//         @keyframes gradient-animation {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         .animated-gradient {
//           background: linear-gradient(-45deg, #0d1117, #161b22, #0d1117, #21262d);
//           background-size: 400% 400%;
//           animation: gradient-animation 15s ease infinite;
//         }
//         .chat-glass {
//   /* MORE SHOWY VERSION */
//   /* Background is more transparent (alpha 0.7 -> 0.5) and slightly lighter */
//   background: rgba(40, 48, 59, 0.5);
//   backdrop-filter: blur(16px) saturate(180%);
//   -webkit-backdrop-filter: blur(16px) saturate(180%);
//   /* Border is brighter (alpha 0.1 -> 0.2) */
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   /* Added a subtle inner glow for depth */
//   box-shadow: inset 0 0 200px rgba(255, 255, 255, 0.05);
//   will-change: backdrop-filter; 
//         /* Remove default margin and padding from body */
//         body {
//           margin: 0;
//           padding: 0;
//           overflow: hidden;
//         }
//       `}</style>

//       {/* Fixed the main container to prevent overflow */}
//       <div className="flex h-screen w-screen overflow-x-hidden text-gray-200 font-sans animated-gradient">

//         <Sidebar />
        
//         {/* Main content */}
//         <div className="flex-1 ml-16 h-full flex items-center justify-center p-4">
//           <div className="w-full max-w-7xl h-full max-h-[95vh] chat-glass border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
//             <header className="flex items-center justify-center px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-green-900/20 to-gray-800/30 relative overflow-hidden">
//   {/* Animated background effect */}
//   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-pulse-slow"></div>
  
//   <div className="relative z-10 text-center">
//     <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient-x">
//       ⚕️ MedBay <span className="text-white">AI</span> Health Assistant
//     </h2>
//     <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
//       <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
//       Powered by Advanced AI Technology
//     </p>
//   </div>
// </header>

//             <main className="flex-1 overflow-y-auto p-6">
//               <div className="space-y-4">
//                 {messages.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`flex flex-col ${
//                       msg.sender === "user" ? "items-end" : "items-start"
//                     }`}
//                   >
//                     <div
//                       className={`max-w-lg p-3.5 rounded-2xl text-sm message-enter ${
//                         msg.sender === "user"
//                           ? "bg-green-600 text-white rounded-br-none"
//                           : "bg-gray-800 text-gray-200 rounded-bl-none"
//                       }`}
//                     >
//                       {msg.sender === "bot" ? (
//                         <BotMessage text={msg.text} />
//                       ) : (
//                         msg.text
//                       )}
//                     </div>
//                     <span className="text-xs text-gray-500 mt-1.5 px-2">
//                       {msg.timestamp.toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                 ))}

//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-800 rounded-2xl rounded-bl-none">
//                       <TypingIndicator />
//                     </div>
//                   </div>
//                 )}

//                 {showSuggestedPrompts && !isLoading && (
//                   <div className="flex flex-col items-start gap-2 pt-4 border-t border-gray-800">
//                     <h3 className="text-sm font-semibold text-gray-400">
//                       Suggested Prompts:
//                     </h3>
//                     <SuggestedPrompt
//                       text="What are common symptoms of the flu?"
//                       onClick={handleSend}
//                     />
//                     <SuggestedPrompt
//                       text="Tell me about Type 2 diabetes."
//                       onClick={handleSend}
//                     />
//                     <SuggestedPrompt
//                       text="How do I perform first-aid for a minor burn?"
//                       onClick={handleSend}
//                     />
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </main>

//             <div className="p-4 border-t border-gray-800">
//               <form onSubmit={handleFormSubmit} className="relative">
//                 <input
//                   type="text"
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   placeholder="Ask a health question..."
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="submit"
//                   className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
//                   disabled={isLoading || !input.trim()}
//                   aria-label="Send message"
//                 >
//                   <SendIcon className="w-5 h-5" />
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }







"use client";

import Sidebar from "../../components/sidebar";
import Chat from "../../components/Chat"; // Import the new Chat component

export default function ChatPage() {
  return (
    <>
      <style jsx global>{`
        /* Your global styles can remain here */
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #0d1117, #161b22, #0d1117, #21262d);
          background-size: 400% 400%;
          animation: gradient-animation 15s ease infinite;
        }
        .chat-glass {
          background: rgba(40, 48, 59, 0.5);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 0 200px rgba(255, 255, 255, 0.05);
          will-change: backdrop-filter;
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>

      <div className="flex h-screen w-screen overflow-x-hidden text-gray-200 font-sans animated-gradient">
        <Sidebar />
        
        {/* Main content now simply renders the Chat component */}
        <div className="flex-1 ml-16 h-full flex items-center justify-center p-4">
          <Chat />
        </div>
      </div>
    </>
  );
}