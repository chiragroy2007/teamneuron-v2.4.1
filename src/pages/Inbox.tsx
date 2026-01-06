import React, { useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import { useChat } from '../contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const InboxPage: React.FC = () => {
    const { setIsOpen } = useChat();

    useEffect(() => {
        // When visiting /inbox, we automatically open the chat drawer
        // This allows us to reuse the existing chat UI without reimplementing a full page for now
        // If the user wants a full page later, we can move ChatDrawer logic to a shared component
        setIsOpen(true);
    }, [setIsOpen]);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center mt-20">
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Inbox</h1>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            Your conversations are managed in the chat drawer. It should be open on the right side of your screen.
                        </p>
                        <Button onClick={() => setIsOpen(true)}>
                            Open Chat
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InboxPage;
