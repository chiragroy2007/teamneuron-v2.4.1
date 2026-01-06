import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeRecipientId: string | null;
    openChat: (recipientId: string) => void;
    closeChat: () => void;
    unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Poll for unread count - DISABLED (chat feature removed)
    // React.useEffect(() => {
    //     const fetchUnread = async () => {
    //         try {
    //             // Only if logged in (token exists check implicitly or try/catch)
    //             const data = await api.messages.getUnreadCount();
    //             if (data) setUnreadCount(data.count);
    //         } catch (e) { } // silent fail
    //     };
    //     fetchUnread();
    //     const interval = setInterval(fetchUnread, 5000);
    //     return () => clearInterval(interval);
    // }, []);

    const openChat = (recipientId: string) => {
        setActiveRecipientId(recipientId);
        setIsOpen(true);
    };

    // When chat is open with activeRecipient, we should mark as read (this logic might be better in Drawer)

    const closeChat = () => {
        setIsOpen(false);
        setActiveRecipientId(null);
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, activeRecipientId, openChat, closeChat, unreadCount }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
