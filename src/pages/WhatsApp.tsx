import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WhatsApp: React.FC = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center py-16 px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    {/* WhatsApp Icon */}
                    <div className="flex justify-center">
                        <div className="bg-[#25D366] p-6 rounded-full shadow-lg">
                            <MessageCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-neutral-900">Join Our Community</h1>
                        <p className="text-neutral-600 leading-relaxed">
                            Connect with TeamNeuron members, share ideas, and collaborate in real-time through our WhatsApp community.
                        </p>
                    </div>

                    {/* Join Button */}
                    <a
                        href="https://chat.whatsapp.com/CjmRqNVRiR55xElxs9dZaY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <Button
                            size="lg"
                            className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-8 py-6 text-base shadow-md rounded-full"
                        >
                            Join WhatsApp Community
                        </Button>
                    </a>

                    {/* Footer Note */}
                    <p className="text-xs text-neutral-400 pt-4">
                        You'll be redirected to WhatsApp to join the group
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default WhatsApp;
