import React, { useState } from 'react';
import Card from './shared/Card.tsx';
// Fix: added .ts extension
import { TaxDetails } from '../types.ts';

// 2024 Tax Brackets and Rates (Simplified for simulator)
const FED_BRACKETS = [
    { limit: 55867, rate: 0.15 },
    { limit: 111733, rate: 0.205 },
    { limit: 173205, rate: 0.26 },
    { limit: 246752, rate: 0.29 },
    { limit: Infinity, rate: 0.33 },
];

const QC_BRACKETS = [
    { limit: 51780, rate: 0.14 },
    { limit: 103545, rate: 0.19 },
    { limit: 126000, rate: 0.24 },
    { limit: Infinity, rate: 0.2575 },
];

const BASIC_PERSONAL_AMOUNT_FED = 15705;
const BASIC_PERSONAL_AMOUNT_QC = 18056;
const SPOUSAL_AMOUNT_FED = 15705;
const SPOUSAL_AMOUNT_QC = 18056;
const CANADA_EMPLOYMENT_AMOUNT = 1433;

const QPP_RATE = 0.0595;
const QPP_MAX_EARNINGS = 68500;
const QPP_EXEMPTION = 3500;
const QPP_MAX_CONTRIBUTION = (QPP_MAX_EARNINGS - QPP_EXEMPTION) * QPP_RATE;

const EI_RATE_QC = 0.0132;
const EI_MAX_EARNINGS = 63200;
const EI_MAX_CONTRIBUTION_QC = EI_MAX_EARNINGS * EI_RATE_QC;

const QPIP_RATE = 0.00494;
const QPIP_MAX_EARNINGS = 94000;
const QPIP_MAX_CONTRIBUTION = QPIP_MAX_EARNINGS * QPIP_RATE;

const Taxes: React.FC = () => {
    const [grossIncome, setGrossIncome] = useState('');
    const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
    const [spouseWorks, setSpouseWorks] = useState(true);
    const [rrsp, setRrsp] = useState('');
    const [donations, setDonations] = useState('');
    const [medical, setMedical] = useState('');
    
    const [taxDetails, setTaxDetails] = useState<TaxDetails | null>(null);

    const calculateProgressiveTax = (income: number, brackets: { limit: number, rate: number }[]) => {
        let tax = 0;
        let lowerBound = 0;
        for (const bracket of brackets) {
            if (income > lowerBound) {
                const taxableInBracket = Math.min(income, bracket.limit) - lowerBound;
                tax += taxableInBracket * bracket.rate;
                lowerBound = bracket.limit;
            } else {
                break;
            }
        }
        return tax;
    };


    const handleCalculate = () => {
        const income = parseFloat(grossIncome) || 0;
        const rrspDed = parseFloat(rrsp) || 0;
        const donationCred = parseFloat(donations) || 0;
        const medicalCred = parseFloat(medical) || 0;

        // --- Calculate Contributions ---
        const qppContribution = Math.min(QPP_MAX_CONTRIBUTION, Math.max(0, income - QPP_EXEMPTION) * QPP_RATE);
        const eiContribution = Math.min(EI_MAX_CONTRIBUTION_QC, income * EI_RATE_QC);
        const qpipContribution = Math.min(QPIP_MAX_CONTRIBUTION, income * QPIP_RATE);
        const totalContributions = qppContribution + eiContribution + qpipContribution;

        // --- Calculate final tax liability based on ALL deductions ---
        const taxableIncomeFinal = Math.max(0, income - rrspDed);
        
        // Federal Credits
        let fedCreditsAmount = BASIC_PERSONAL_AMOUNT_FED + CANADA_EMPLOYMENT_AMOUNT;
        if (maritalStatus === 'married' && !spouseWorks) {
            fedCreditsAmount += SPOUSAL_AMOUNT_FED;
        }
        const fedContributionCredits = (qppContribution + eiContribution) * 0.15;
        const fedDonationCredit = donationCred * 0.15; // Simplified
        const fedMedicalCredit = Math.max(0, medicalCred - (income * 0.03)) * 0.15;
        const totalFedCredits = (fedCreditsAmount * 0.15) + fedContributionCredits + fedDonationCredit + fedMedicalCredit;

        const grossFedTax = calculateProgressiveTax(taxableIncomeFinal, FED_BRACKETS);
        const fedTaxAfterCredits = Math.max(0, grossFedTax - totalFedCredits);
        const finalFederalTax = fedTaxAfterCredits * (1 - 0.165); // Quebec Abatement
        
        // Quebec Credits
        let qcCreditsAmount = BASIC_PERSONAL_AMOUNT_QC;
         if (maritalStatus === 'married' && !spouseWorks) {
            qcCreditsAmount += SPOUSAL_AMOUNT_QC;
        }
        const qcContributionCredits = (qppContribution + eiContribution + qpipContribution) * 0.14;
        const qcDonationCredit = donationCred * 0.14; // Simplified
        const qcMedicalCredit = Math.max(0, medicalCred - (income * 0.03)) * 0.14;
        const totalQcCredits = (qcCreditsAmount * 0.14) + qcContributionCredits + qcDonationCredit + qcMedicalCredit;
        
        const grossQcTax = calculateProgressiveTax(taxableIncomeFinal, QC_BRACKETS);
        const finalProvincialTax = Math.max(0, grossQcTax - totalQcCredits);
        
        const finalTotalIncomeTax = finalFederalTax + finalProvincialTax;

        // --- Estimate Tax Withheld at Source (simulates payroll deduction) ---
        // This calculation ignores optional deductions like RRSP, donations, medical.
        const taxableIncomeForWithholding = Math.max(0, income);
        const grossFedTaxWithheld = calculateProgressiveTax(taxableIncomeForWithholding, FED_BRACKETS);
        const fedWithheldTaxAfterCredits = Math.max(0, grossFedTaxWithheld - (BASIC_PERSONAL_AMOUNT_FED + CANADA_EMPLOYMENT_AMOUNT) * 0.15 - fedContributionCredits);
        const estimatedFedWithholding = fedWithheldTaxAfterCredits * (1 - 0.165);

        const grossQcTaxWithheld = calculateProgressiveTax(taxableIncomeForWithholding, QC_BRACKETS);
        const estimatedQcWithholding = Math.max(0, grossQcTaxWithheld - (BASIC_PERSONAL_AMOUNT_QC * 0.14) - qcContributionCredits);
        
        const totalEstimatedWithholding = estimatedFedWithholding + estimatedQcWithholding;

        // --- Final Balance ---
        const finalBalance = totalEstimatedWithholding - finalTotalIncomeTax;
        
        const totalDeductions = finalTotalIncomeTax + totalContributions;
        const netIncome = income - totalDeductions;
        
        setTaxDetails({
            grossIncome: income,
            totalContributions,
            federalTax: finalFederalTax,
            provincialTax: finalProvincialTax,
            totalIncomeTax: finalTotalIncomeTax,
            totalDeductions,
            netIncome,
            finalBalance,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Simulateur de déclaration de revenus">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">1. Informations Personnelles</h3>
                    <div>
                        <label className="block text-sm font-medium">Revenu brut annuel</label>
                        <input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} placeholder="ex: 75000" className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">État civil</label>
                        <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as any)} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                            <option value="single">Célibataire</option>
                            <option value="married">Marié(e)</option>
                        </select>
                    </div>
                    {maritalStatus === 'married' && (
                        <div>
                            <label className="block text-sm font-medium">Votre conjoint(e) travaille?</label>
                            <select value={spouseWorks.toString()} onChange={e => setSpouseWorks(e.target.value === 'true')} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                <option value="true">Oui</option>
                                <option value="false">Non</option>
                            </select>
                        </div>
                    )}
                    
                    <h3 className="text-lg font-semibold mt-4">2. Déductions & Crédits Annuels</h3>
                     <div>
                        <label className="block text-sm font-medium">Cotisations REER</label>
                        <input type="number" value={rrsp} onChange={e => setRrsp(e.target.value)} placeholder="ex: 5000" className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Dons de charité</label>
                        <input type="number" value={donations} onChange={e => setDonations(e.target.value)} placeholder="ex: 500" className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Frais médicaux</label>
                        <input type="number" value={medical} onChange={e => setMedical(e.target.value)} placeholder="ex: 1500" className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>

                    <button onClick={handleCalculate} className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                        Calculer l'estimation finale
                    </button>
                </div>
            </Card>

            {taxDetails && (
                <Card title="Résultats de l'Estimation">
                     <div className="space-y-4">
                        <div className={`p-4 rounded-lg text-center ${taxDetails.finalBalance >= 0 ? 'bg-secondary-100 dark:bg-secondary-900' : 'bg-red-100 dark:bg-red-900'}`}>
                           <h4 className={`text-lg font-semibold ${taxDetails.finalBalance >= 0 ? 'text-secondary-800 dark:text-secondary-200' : 'text-red-800 dark:text-red-200'}`}>
                                {taxDetails.finalBalance >= 0 ? 'Remboursement Estimé' : 'Solde à Payer Estimé'}
                            </h4>
                            <p className={`text-3xl font-extrabold mt-2 ${taxDetails.finalBalance >= 0 ? 'text-secondary-600 dark:text-secondary-400' : 'text-red-600 dark:text-red-400'}`}>
                                {Math.abs(taxDetails.finalBalance).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                            </p>
                        </div>

                         <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Cette estimation compare l'impôt retenu à la source (calculé sans vos déductions optionnelles) avec votre impôt final.
                        </div>

                        <hr className="dark:border-gray-700"/>

                        <h4 className="font-semibold">Résumé Annuel</h4>
                        <p className="flex justify-between"><span>Revenu brut</span> <strong>{taxDetails.grossIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</strong></p>
                        <p className="flex justify-between text-red-500"><span>(-) Impôt sur le revenu total</span> <span>({taxDetails.totalIncomeTax.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })})</span></p>
                         <p className="flex justify-between text-red-500"><span>(-) Cotisations (RRQ, AE, RQAP)</span> <span>({taxDetails.totalContributions.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })})</span></p>
                        <hr className="dark:border-gray-700"/>
                        <p className="flex justify-between font-bold text-lg"><span>Revenu Net Estimé</span> <strong>{taxDetails.netIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</strong></p>

                     </div>
                </Card>
            )}
        </div>
    );
};

export default Taxes;