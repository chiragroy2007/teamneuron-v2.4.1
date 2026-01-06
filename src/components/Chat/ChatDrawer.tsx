import React, { useEffect, useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'; // Assuming generic sheet or drawer
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useChat } from '../../contexts/ChatContext';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Send, X, MessageCircle, ChevronLeft, User } from 'lucide-react';

export const ChatDrawer: React.FC = () => {
    const { isOpen, setIsOpen, activeRecipientId, openChat, closeChat } = useChat();
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isChatView = !!activeRecipientId;

    // Poll for messages/conversations
    useEffect(() => {
        if (!isOpen) return;

        const poll = async () => {
            if (isChatView) {
                await fetchMessages();
            } else {
                await fetchConversations();
            }
        };

        poll(); // Initial fetch
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [isOpen, isChatView, activeRecipientId]);

    const fetchConversations = async () => {
        try {
            const data = await api.messages.listConversations();
            setConversations(data || []);
        } catch (e) { console.error(e); }
    };

    const fetchMessages = async () => {
        if (!activeRecipientId) return;
        try {
            const data = await api.messages.listMessages(activeRecipientId);
            setMessages(data || []);
            // Only scroll to bottom if near bottom or first load? For now just auto scroll
            // scrollToBottom(); 
            // Better UX: Scroll only on new message or first load. 
        } catch (e) {
            console.error(e);
        }
    };

    // Auto-scroll on messages change (simple ver)
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, isChatView]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRecipientId) return;
        const tempContent = newMessage;
        setNewMessage('');

        try {
            await api.messages.send(activeRecipientId, tempContent);
            fetchMessages();
            // Refresh conversation list too if we went back
        } catch (e) {
            console.error(e);
            setNewMessage(tempContent);
        }
    };

    const handleBack = () => {
        openChat(''); // Switch to list view
    };

    if (!user) return null;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[100] flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300 font-sans">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 backdrop-blur-sm h-16">
                <div className="flex items-center gap-3">
                    {isChatView ? (
                        <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 px-2 text-neutral-500 hover:text-neutral-900">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    ) : (
                        <div className="bg-neutral-100 rounded-full p-2">
                            <MessageCircle className="w-4 h-4 text-neutral-900" />
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-neutral-900 leading-none">
                            {isChatView ? 'Chat' : 'Inbox'}
                        </h3>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                            {isChatView ? 'Conversation' : `${conversations.length} conversations`}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => closeChat()} className="text-neutral-400 hover:text-neutral-900">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-white">

                {/* VIEW: CONVERSATION LIST */}
                {!isChatView && (
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {conversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center opacity-60">
                                <div className="bg-neutral-50 p-4 rounded-full mb-3">
                                    <MessageCircle className="w-8 h-8 text-neutral-300" />
                                </div>
                                <p className="text-sm font-medium text-neutral-900">No messages yet</p>
                                <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                                    Start a conversation from the Collaborate page.
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.user_id}
                                    onClick={() => openChat(conv.user_id)}
                                    className="w-full p-3 flex items-start gap-3 hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-100 text-left group"
                                >
                                    <Avatar className="h-10 w-10 border border-neutral-100 group-hover:border-neutral-200 transition-colors">
                                        <AvatarImage src={conv.avatar_url} />
                                        <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs font-semibold">
                                            {(conv.full_name || conv.username || '?').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="text-sm font-semibold text-neutral-900 truncate">
                                                {conv.full_name || conv.username}
                                            </span>
                                            {conv.last_message_at && (
                                                <span className="text-[10px] text-neutral-400 shrink-0">
                                                    {new Date(conv.last_message_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate group-hover:text-neutral-700">
                                            {conv.is_me ? 'You: ' : ''}{conv.last_message}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* VIEW: CHAT THREAD */}
                {isChatView && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-400 opacity-50">
                                    <p className="text-xs">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe
                                                    ? 'bg-neutral-900 text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-neutral-100 text-neutral-900 rounded-2xl rounded-tl-sm'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-neutral-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex gap-2 items-end bg-neutral-50 p-1.5 rounded-xl border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-200 transition-all"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-sm placeholder:text-neutral-400 h-auto min-h-[40px] max-h-32"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    className="h-9 w-9 p-0 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white shrink-0 disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
