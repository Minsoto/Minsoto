export const getMediaUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;

    // Remove /api suffix if present to get the root URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
};
