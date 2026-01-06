const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    return response.json();
};

export const api = {
    auth: {
        signup: async (data: any) => {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        },
        login: async (data: any) => {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        },
        me: async () => {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) return null;
            return res.json();
        }
    },
    articles: {
        list: async (limit = 10, featured = false) => {
            let url = `${API_URL}/api/articles?limit=${limit}`;
            if (featured) url += '&featured=true';
            const res = await fetch(url);
            return handleResponse(res);
        },
        get: async (id: string) => {
            const res = await fetch(`${API_URL}/api/articles/${id}`);
            return handleResponse(res);
        },
        create: async (data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        },
        delete: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        update: async (id: string, data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/articles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        }
    },
    discussions: {
        list: async (limit = 10) => {
            const res = await fetch(`${API_URL}/api/discussions?limit=${limit}`);
            return handleResponse(res);
        },
        get: async (id: string) => {
            const res = await fetch(`${API_URL}/api/discussions/${id}`);
            return handleResponse(res);
        },
        create: async (data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/discussions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        },
        delete: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/discussions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        update: async (id: string, data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/discussions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        }
    },
    comments: {
        create: async (data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        }
    },
    categories: {
        list: async (limit = 6) => {
            const res = await fetch(`${API_URL}/api/categories?limit=${limit}`);
            if (!res.ok) throw await res.json();
            return res.json();
        }
    },
    profiles: {
        getRandom: async (count = 4) => {
            const res = await fetch(`${API_URL}/api/profiles/random?count=${count}`);
            if (!res.ok) throw await res.json();
            return res.json();
        },
        getBatch: async (userIds: string[]) => {
            const response = await fetch(`${API_URL}/api/profiles/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds }),
            });
            return handleResponse(response);
        },
        get: async (userId: string) => {
            // If getting current user's full profile, we might use /me or a specific endpoint.
            // For now, let's assume /me returns full profile for the logged in user,
            // but for others we might need a public profile endpoint.
            // As per schema, /me returns joined data.
            // Let's rely on /me for own profile.
            return null;
        },
        update: async (profileData: any) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/profiles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });
            return handleResponse(response);
        }
    },

    clubs: {
        list: async () => {
            const res = await fetch(`${API_URL}/api/clubs`);
            return handleResponse(res);
        },
        listUserClubs: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clubs/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return handleResponse(res);
        },
        join: async (clubId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        leave: async (clubId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        removeMember: async (clubId: string, userId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/members/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        getMembers: async (clubId: string) => {
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/members?_t=${Date.now()}`);
            return handleResponse(res);
        },
        isMember: async (clubId: string, userId: string) => {
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/members/check/${userId}?_t=${Date.now()}`);
            return handleResponse(res);
        },
        getPosts: async (clubId: string) => {
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/posts`);
            return handleResponse(res);
        },
        createPost: async (clubId: string, content: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clubs/${clubId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            return handleResponse(res);
        }
    },
    projects: {
        list: async (status = 'open') => {
            const res = await fetch(`${API_URL}/api/projects?status=${status}`);
            return handleResponse(res);
        },
        get: async (id: string) => {
            const res = await fetch(`${API_URL}/api/projects/${id}`);
            return handleResponse(res);
        },
        create: async (data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            return handleResponse(res);
        },
        apply: async (id: string, cover_note: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects/${id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cover_note }),
            });
            return handleResponse(res);
        }
    },
    messages: {
        listConversations: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        listMessages: async (partnerId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/${partnerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        send: async (receiverId: string, content: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId, content })
            });
            return handleResponse(res);
        },
        getUnreadCount: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        },
        markAsRead: async (partnerId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/${partnerId}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        }
    },
    templates: {
        list: async (owner_id?: string) => {
            let url = `${API_URL}/api/templates`;
            if (owner_id) {
                url += `?owner_id=${owner_id}`;
            } else {
                url += `?scope=global`;
            }
            const res = await fetch(url);
            return handleResponse(res);
        }
    },
    users: {
        list: async (limit = 20, offset = 0, q = '') => {
            let url = `${API_URL}/api/profiles?limit=${limit}&offset=${offset}`;
            if (q) url += `&q=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            return handleResponse(res);
        },

        delete: async (id: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        }
    },
    stats: {
        getUserGrowth: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/stats/users-growth`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return handleResponse(res);
        }
    }
};


