
import React, { useState } from 'react';
import Card from './Card.tsx';
import FormModal from './FormModal.tsx';
import { FormFieldConfig } from '../../types.ts';
import { useNotifier } from '../../contexts/NotificationContext.tsx';

interface EditableSectionProps<T extends { id: string }> {
    title: string;
    items: T[];
    fields: FormFieldConfig[];
    itemRenderer: (item: T, onEdit: (item: T) => void, onDelete: (id: string) => void) => React.ReactNode;
    onAdd: (item: Omit<T, 'id'>) => Promise<void>;
    onUpdate: (item: T) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    addModalTitle: string;
    editModalTitle: string;
    emptyStateMessage?: string;
}

const EditableSection = <T extends { id: string }>({
    title,
    items,
    fields,
    itemRenderer,
    onAdd,
    onUpdate,
    onDelete,
    addModalTitle,
    editModalTitle,
    emptyStateMessage = "Aucun élément à afficher."
}: EditableSectionProps<T>) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const notifier = useNotifier();

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: T) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
            try {
                await onDelete(id);
                notifier.success("Élément supprimé avec succès.");
            } catch (error) {
                notifier.error("Erreur lors de la suppression.");
            }
        }
    };

    const handleSubmit = async (data: T) => {
        try {
            if (editingItem) {
                await onUpdate({ ...editingItem, ...data });
                notifier.success("Élément mis à jour avec succès.");
            } else {
                await onAdd(data as Omit<T, 'id'>);
                notifier.success("Élément ajouté avec succès.");
            }
        } catch (error) {
            notifier.error("Erreur lors de la sauvegarde.");
        }
    };

    return (
        <>
            <Card title={title}>
                <div className="flex justify-end mb-4">
                    <button onClick={handleOpenAddModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                        Ajouter
                    </button>
                </div>
                <div className="space-y-3">
                    {items.length > 0 ? (
                        items.map(item => itemRenderer(item, handleOpenEditModal, handleDelete))
                    ) : (
                        <p className="text-center text-gray-500 py-4">{emptyStateMessage}</p>
                    )}
                </div>
            </Card>
            <FormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingItem}
                fields={fields}
                title={editingItem ? editModalTitle : addModalTitle}
            />
        </>
    );
};

export default EditableSection;
