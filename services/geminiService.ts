import { GoogleGenAI, Type, Chat } from "@google/genai";
// Fix: added .ts extension
import { Investment, Financials, HadjAnalysis, DashboardInsight } from '../types.ts';

// IMPORTANT: The API key is now securely managed via environment variables.
// Do not hardcode API keys in the source code.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const hadjAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        isRecommended: {
            type: Type.BOOLEAN,
            description: "L'investissement est-il recommandé pour cet utilisateur ?"
        },
        profitability: {
            type: Type.STRING,
            description: "Une brève analyse de la rentabilité potentielle de l'investissement."
        },
        risk: {
            type: Type.STRING,
            description: "Une brève analyse des risques encourus, adaptée au profil de l'utilisateur."
        },
        hadjRule: {
            type: Type.OBJECT,
            properties: {
                debtToEquity: { type: Type.STRING, description: "Analyse relative à la dette et aux capitaux propres, d'un point de vue de la Charia si applicable." },
                returnOnInvestment: { type: Type.STRING, description: "Commentaire sur le retour sur investissement attendu." },
                ribaFree: { type: Type.STRING, description: "Confirmation et notes sur le fait que l'investissement est exempt d'intérêt (Riba)." },
            },
            required: ['debtToEquity', 'returnOnInvestment', 'ribaFree']
        },
        recommendation: {
            type: Type.STRING,
            description: "Une recommandation finale et concise (par ex., 'Recommandé', 'Non Recommandé', 'Recommandé avec prudence')."
        },
    },
    required: ['isRecommended', 'profitability', 'risk', 'hadjRule', 'recommendation']
};

const dashboardInsightsSchema = {
    type: Type.OBJECT,
    properties: {
        insights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Un titre court et percutant pour l'aperçu." },
                    suggestion: { type: Type.STRING, description: "Une suggestion concise et actionnable (1-2 phrases)." },
                    type: { type: Type.STRING, enum: ['info', 'warning', 'success'], description: "Le type d'aperçu pour un affichage conditionnel." },
                },
                 required: ['title', 'suggestion', 'type']
            }
        }
    },
    required: ['insights']
};

export const analyzeInvestment = async (investment: Investment, financials: Financials): Promise<HadjAnalysis | null> => {
    
    const model = 'gemini-2.5-flash';

    const totalIncome = financials.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financials.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalDebts = financials.debts.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = financials.investments.reduce((sum, item) => sum + item.amount, 0) + financials.zakatInfo.assets.reduce((sum, asset) => sum + asset.value, 0);
    const netWorth = totalAssets - totalDebts;

    const prompt = `
        **Rôle**: Vous êtes un conseiller financier nommé "Hadj", spécialisé dans les investissements conformes à la Charia (Halal). Votre analyse doit être prudente, claire et culturellement adaptée pour un utilisateur ayant des liens avec le Canada et l'Algérie. La réponse doit être entièrement en français.

        **Résumé Financier de l'Utilisateur**:
        - Revenus Mensuels: ${totalIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Dépenses Mensuelles: ${totalExpenses.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Dettes Totales: ${totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Actifs Totaux (incluant investissements et épargnes): ${totalAssets.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Valeur Nette: ${netWorth.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}

        **Investissement à Analyser**:
        - Nom: ${investment.name}
        - Montant: ${investment.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Pays: ${investment.country}
        - Secteur: ${investment.sector}
        - Rendement Annuel Attendu: ${investment.expectedReturn}%
        - Durée: ${investment.duration} ans
        - Niveau de Risque: ${investment.riskLevel}
        - Notes de Conformité Charia: ${investment.shariaComplianceNotes || 'Non spécifié'}

        **Tâche**:
        Analysez cette opportunité d'investissement dans le contexte de la situation financière de l'utilisateur. Fournissez une analyse concise couvrant la rentabilité, le risque et la conformité à la Charia. Votre réponse DOIT être un objet JSON qui adhère au schéma fourni. N'incluez aucun formatage markdown comme \`\`\`json.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hadjAnalysisSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result: HadjAnalysis = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error analyzing investment with Gemini:", error);
        return null;
    }
};

export const getDashboardInsights = async (financials: Financials): Promise<DashboardInsight[]> => {
    const model = 'gemini-2.5-flash';

    const totalIncome = financials.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financials.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalDebts = financials.debts.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = financials.investments.reduce((sum, item) => sum + item.amount, 0) + financials.zakatInfo.assets.reduce((sum, asset) => sum + asset.value, 0);
    const netWorth = totalAssets - totalDebts;

     const prompt = `
        **Rôle**: Vous êtes "Hadj", un conseiller financier IA sage et proactif. Votre but est de fournir 2 à 3 aperçus actionnables et concis basés sur le résumé financier de l'utilisateur. La réponse doit être en français.

        **Résumé Financier de l'Utilisateur**:
        - Revenus Mensuels: ${totalIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Dépenses Mensuelles: ${totalExpenses.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Flux de Trésorerie Mensuel: ${(totalIncome - totalExpenses).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Dettes Totales: ${totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Actifs Totaux: ${totalAssets.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Valeur Nette: ${netWorth.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
        - Nombre d'investissements: ${financials.investments.length}

        **Tâche**:
        Identifiez les points les plus importants (positifs ou à améliorer) de cette situation financière. Générez entre 2 et 3 aperçus. Chaque aperçu doit avoir un titre, une suggestion concrète et un type ('info' pour un fait, 'warning' pour un point d'attention, 'success' pour un bon point).

        Exemples de réponses attendues:
        - { title: "Taux d'épargne élevé", suggestion: "Excellent ! Vous mettez de côté une part importante de vos revenus. Continuez ainsi.", type: 'success' }
        - { title: "Dette élevée", suggestion: "Vos dettes représentent une part importante de vos actifs. Pensez à une stratégie de remboursement accéléré.", type: 'warning' }
        - { title: "Diversification", suggestion: "Considérez diversifier vos investissements dans d'autres secteurs pour réduire les risques.", type: 'info' }

        Votre réponse DOIT être un objet JSON contenant une clé "insights" qui est un tableau d'objets, conformément au schéma fourni.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dashboardInsightsSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { insights: DashboardInsight[] };
        return result.insights || [];

    } catch (error) {
        console.error("Error getting dashboard insights from Gemini:", error);
        return [];
    }
}

export const createChatSession = (systemInstruction: string): Chat => {
     return ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};