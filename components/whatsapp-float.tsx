"use client";

import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ type: 'bot' | 'user', text: string, time: string }>>([
    { type: 'bot', text: 'How can I help you? :)', time: '22:18' }
  ]);

  useEffect(() => {
    // Set visible after component mounts to avoid hydration mismatch
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  const phoneNumber = "919820590353"; // EstateBANK.in WhatsApp support number
  
  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message to chat
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setMessages([...messages, { type: 'user', text: message, time }]);
      
      // Open WhatsApp after a brief delay
      setTimeout(() => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
      }, 300);
      
      setMessage("");
      // Keep chat open
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden max-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle size={20} className="fill-white text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">EstateBANK.in</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100 space-y-3 min-h-60">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg px-4 py-2.5 ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write your message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all hover:shadow-lg"
                aria-label="Send message"
              >
                <Send size={18} className="fill-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={32} className="fill-white" />
      </button>
    </div>
  );
}
