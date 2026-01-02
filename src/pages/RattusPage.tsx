import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Send, PlusCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../integrations/supabase/client'; // Removed

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const RattusPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    // if (!user) return;
    // Supabase logic disabled
    setConversations([]);
  };

  const fetchMessages = async (convoId: string) => {
    // Supabase logic disabled
    setMessages([]);
  };

  const handleNewConversation = async () => {
    // Supabase logic disabled
    console.log("New conversation (local only)");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic disabled for migration
    console.log("Send message (disabled)");
    alert("Rattus AI is coming soon!");
  };

  return (
    <Layout>
      <div className="relative flex h-[calc(100vh-80px)]">
        {/* Sidebar for Conversations */}
        <div className="w-1/4 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <Button onClick={handleNewConversation} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConversationId(convo.id)}
                  className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors ${activeConversationId === convo.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-200'
                    }`}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="truncate">{convo.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="w-3/4 flex flex-col">
          <div className="container mx-auto py-8 flex-1 flex flex-col">
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800">Rattus Rattus</h1>
              <p className="text-lg text-muted-foreground">Your Neuroscience-Focused AI Research Assistant</p>
            </header>
            <Card className="flex-1 flex flex-col shadow-lg">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6" ref={scrollAreaRef as any}>
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/logo.svg" alt="Rattus AI" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Rattus about neuroscience..."
                      className="flex-1"
                      disabled={isLoading || !activeConversationId}
                    />
                    <Button type="submit" size="icon" disabled={true}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800">Coming Soon</h2>
            <p className="text-lg text-muted-foreground mt-2">The Rattus AI assistant is under development.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RattusPage;
