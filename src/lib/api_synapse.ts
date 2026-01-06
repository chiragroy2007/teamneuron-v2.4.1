const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || response.statusText);
    }
    return response.json();
};

export const api_synapse = {
    onboarding: async (data: {
        teachSkills: string[],
        learnSkills: string[],
        bio?: string,
        role?: string,
        education?: string,
        linkedin_url?: string
    }) => {
        const response = await fetch('/api/synapse/onboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    getProfile: async () => {
        const response = await fetch('/api/synapse/profile', {
            headers: getAuthHeader()
        });
        return handleResponse(response);
    },

    getMatches: async () => {
        const response = await fetch('/api/synapse/matches', {
            headers: getAuthHeader()
        });
        return handleResponse(response);
    },

    getExplore: async () => {
        const response = await fetch('/api/synapse/explore', {
            headers: getAuthHeader()
        });
        return handleResponse(response);
    }
};
