import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
// Fix: added .ts extension
import { useFinancialsState } from '../hooks/useFinancials.ts';
// Fix: added .ts extension
import { ChatMessage } from '../types.ts';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';
import { createChatSession } from '../services/geminiService.ts';

const AiSpace: React.FC = () => {
    const financials = useFinancialsState();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Chat
    useEffect(() => {
        try {
            const totalIncome = financials.incomes.reduce((sum, item) => sum + item.amount, 0);
            const totalExpenses = financials.expenses.reduce((sum, item) => sum + item.amount, 0);
            const totalDebts = financials.debts.reduce((sum, item) => sum + item.amount, 0);
            const totalAssets = financials.investments.reduce((sum, item) => sum + item.amount, 0) + financials.zakatInfo.assets.reduce((sum, asset) => sum + asset.value, 0);
            const netWorth = totalAssets - totalDebts;

            const systemInstruction = `
                You are "Hadj", a wise and friendly financial advisor specializing in Sharia-compliant finance for users in a Canadian context, often with ties to Algeria.
                Your goal is to provide clear, actionable, and culturally sensitive financial advice.
                You are provided with the user's current financial summary as context. Do not mention that you have this data unless the user asks about their own finances.
                Base your answers on this data when relevant.

                User's Financial Summary:
                - Net Worth: ${netWorth.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                - Monthly Cash Flow: ${(totalIncome - totalExpenses).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                - Total Debts: ${totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                - Total Investments: ${financials.investments.reduce((sum, i) => sum + i.amount, 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
            `;
            
            chatRef.current = createChatSession(systemInstruction);

            setMessages([{ role: 'model', text: 'Bonjour! Je suis Hadj, votre conseiller financier IA. Comment puis-je vous aider à y voir plus clair dans vos finances aujourd\'hui?' }]);

        } catch (error) {
            console.error("Failed to initialize AI Space:", error);
            setMessages([{ role: 'model', text: 'Désolé, une erreur est survenue lors de l\'initialisation de l\'espace IA. Veuillez vérifier votre clé API et rafraîchir la page.' }]);
        }
    }, [financials]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card title="Espace IA - Votre Conseiller Financier Personnel">
            <div className="flex flex-col h-[70vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Posez une question sur vos finances..."
                        disabled={isLoading}
                        className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button onClick={handleSendMessage} disabled={isLoading} className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:bg-primary-300">
                        {isLoading ? <Spinner /> : 'Envoyer'}
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default AiSpace;