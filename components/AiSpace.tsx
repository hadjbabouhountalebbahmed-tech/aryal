import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext.tsx';
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { createChatSession } from '../services/geminiService.ts';
import { Chat } from '@google/genai';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';

interface Message {
    sender: 'user' | 'model';
    text: string;
}

const AiSpace: React.FC = () => {
    const { ai, isApiAvailable, openApiKeyModal } = useApi();
    const financials = useFinancialsState();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ai && financials && isApiAvailable) {
            const systemInstruction = `
                Vous êtes "Hadj", un conseiller financier IA bienveillant, spécialisé dans la finance islamique et personnelle pour un public francophone. Vous avez accès au résumé financier de l'utilisateur.
                Votre ton est encourageant, éducatif et prudent. N'inventez jamais d'informations. Si vous ne savez pas, dites-le.
                Voici le contexte financier de l'utilisateur (ne le divulguez pas directement, mais utilisez-le pour personnaliser vos réponses) :
                - Revenus mensuels: ${financials.incomes.reduce((s, i) => s + i.amount, 0)} CAD
                - Dépenses mensuelles: ${financials.expenses.reduce((s, e) => s + e.amount, 0)} CAD
                - Dettes totales: ${financials.debts.reduce((s, d) => s + d.amount, 0)} CAD
                - Investissements totaux: ${financials.investments.reduce((s, i) => s + i.amount, 0)} CAD
                - Objectifs: ${financials.goals.map(g => `${g.name} (${g.currentAmount}/${g.targetAmount} CAD)`).join(', ')}
            `;
            setChat(createChatSession(ai, systemInstruction));
        }
    }, [ai, financials, isApiAvailable]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.sender === 'model') {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { ...lastMessage, text: modelResponse };
                        return newMessages;
                    }
                    return [...prev, { sender: 'model', text: modelResponse }];
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { sender: 'model', text: "Désolé, une erreur est survenue." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isApiAvailable) {
        return (
            <Card title="Espace IA non disponible">
                 <div className="text-center p-4">
                    <p className="mb-4">Le service IA n'a pas pu être initialisé. Veuillez configurer votre clé API.</p>
                    <button onClick={openApiKeyModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                        Configurer la clé API
                    </button>
                </div>
            </Card>
        );
    }
    
    return (
        <Card title="Discutez avec Hadj" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <p style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length-1]?.sender === 'user' && (
                     <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                            <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez une question sur vos finances..."
                        className="flex-1 p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300" disabled={isLoading || !input.trim()}>
                        Envoyer
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default AiSpace;
