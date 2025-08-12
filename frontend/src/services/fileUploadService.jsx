const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.uploadId) {
            return result.uploadId;
        } else {
            throw new Error('Erreur lors de l’import du fichier');
        }
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
