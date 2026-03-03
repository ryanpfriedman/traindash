"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Hi there! I am the TrainDash support AI. How can I help you automate your training today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-support-chat', handleOpenChat);
        return () => window.removeEventListener('open-support-chat', handleOpenChat);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const apiMessages = [...messages, { role: 'user', content: userMsg }].map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the support server right now. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* The Footer Trigger Button (Hidden visually here, typically triggered by external, but we provide a floating button fallback) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 z-50 group"
                    aria-label="Open Support Chat"
                >
                    <MessageCircle size={24} className="group-hover:animate-pulse" />
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-full max-w-[380px] h-[550px] max-h-[85vh] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">TrainDash Support</h3>
                                <p className="text-indigo-200 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    AI Assistant Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-indigo-200 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                                    <span className="text-xs">Typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 pt-3">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question..."
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-full transition-colors"
                            >
                                <Send size={16} className={input.trim() ? 'translate-x-[-1px]' : ''} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                            <Bot size={10} /> Powered by TrainDash AI
                        </p>
                    </div>

                </div>
            )}
        </>
    );
}
