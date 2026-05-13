import { toast } from 'sonner';
import axios from 'axios';

/**
 * Centralized API error handler.
 * Shows a user-friendly toast notification for common API errors.
 */
export function handleApiError(error: unknown, fallbackMessage = 'Something went wrong'): void {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        const status = error.response?.status;

        // Never show toast for 401 — the auth interceptor handles redirects
        if (status === 401) return;

        // Try to extract a meaningful message from backend
        let message = fallbackMessage;
        if (data) {
            if (typeof data === 'string') {
                message = data;
            } else if (data.error) {
                message = data.error;
            } else if (data.detail) {
                message = data.detail;
            } else {
                // Grab first field error from DRF validation
                const firstKey = Object.keys(data)[0];
                if (firstKey && Array.isArray(data[firstKey])) {
                    message = `${firstKey}: ${data[firstKey][0]}`;
                }
            }
        }

        if (status === 429) {
            toast.warning(message || 'Too many requests — slow down a bit!');
        } else if (status && status >= 500) {
            toast.error('Server error — please try again later.');
        } else {
            toast.error(message);
        }
    } else {
        toast.error(fallbackMessage);
    }
}

/**
 * Show a success toast.
 */
export function showSuccess(message: string): void {
    toast.success(message);
}

/**
 * Show an informational toast.
 */
export function showInfo(message: string): void {
    toast.info(message);
}
