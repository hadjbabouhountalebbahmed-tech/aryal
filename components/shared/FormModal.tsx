

import React, { useState, useEffect } from 'react';
import { FormFieldConfig } from '../../types.ts';
import Spinner from './Spinner.tsx';

export interface FormModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: T) => void;
    initialData: T | null;
    fields: FormFieldConfig[];
    title: string;
    children?: React.ReactNode;
}

const FormModal = <T extends { id?: string }>({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    fields,
    title,
    children,
}: FormModalProps<T>) => {
    const [formData, setFormData] = useState<Partial<T>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
        }
    }, [isOpen, initialData]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number = value;
        if (type === 'number' && (e.target as HTMLInputElement).step === '0.01') {
            // Allow empty string for temporary state, process to number on submit
             processedValue = value === '' ? '' : parseFloat(value);
        } else if (type === 'number') {
            processedValue = value === '' ? '' : parseInt(value, 10);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // If children are provided, the parent component is responsible for its own state and submission format.
        const dataToSubmit = children ? e.currentTarget : formData;

        // This processing is for the fields-based approach
        const processFormData = (data: any) => {
            return Object.entries(data).reduce((acc, [key, value]) => {
                const fieldConfig = fields.find(f => f.name === key);
                if (fieldConfig?.type === 'number' && value === '') {
                     (acc as any)[key] = 0; // default to 0 if number is empty
                } else if (fieldConfig?.type === 'number' && typeof value === 'string') {
                    (acc as any)[key] = parseFloat(value);
                }
                 else {
                    (acc as any)[key] = value;
                }
                return acc;
            }, {} as Partial<T>);
        }
        
        const processedFormData = children ? dataToSubmit : processFormData(formData);

        try {
            await onSubmit(processedFormData as T);
            onClose();
        } catch (error) {
            console.error("Submission failed", error);
            // Optionally show an error to the user
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {children ? children : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {fields.map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium mb-1" htmlFor={field.name}>{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            id={field.name}
                                            name={field.name}
                                            value={(formData[field.name as keyof T] as string) || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {field.options?.map(opt => {
                                                const value = typeof opt === 'string' ? opt : opt.value;
                                                const label = typeof opt === 'string' ? opt : opt.label;
                                                return <option key={value} value={value}>{label}</option>
                                            })}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            value={(formData[field.name as keyof T] as string) || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            rows={field.rows || 3}
                                            className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    ) : (
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            value={(formData[field.name as keyof T] as any) ?? ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            min={field.min}
                                            step={field.step}
                                            className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                        >
                            {isSaving ? <><Spinner /> <span className="ml-2">Sauvegarde...</span></> : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormModal;