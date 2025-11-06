// Fix: added .ts extension
import { Financials } from '../types.ts';

const LAST_BACKUP_TIMESTAMP_KEY = 'hadj-finance-last-backup-timestamp';

export const exportDataAsJson = (financials: Financials): { success: boolean, error?: string } => {
    try {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(financials, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `hadj-finance-backup-${date}.json`;

        link.click();

        // Update the last backup timestamp on successful export
        localStorage.setItem(LAST_BACKUP_TIMESTAMP_KEY, Date.now().toString());

        return { success: true };

    } catch (error) {
        console.error("Export failed:", error);
        return { success: false, error: "L'exportation a échoué." };
    }
};