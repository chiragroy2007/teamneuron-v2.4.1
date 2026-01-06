import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const Synapse: React.FC = () => {
    const [hypeCount, setHypeCount] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Fetch initial hype count
        fetch('/api/hype/synapse')
            .then(res => res.json())
            .then(data => setHypeCount(data.count || 0))
            .catch(err => console.error('Failed to fetch hype:', err));
    }, []);

    const handleHype = async () => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']
        });

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        // Optimistic update
        setHypeCount(prev => prev + 1);

        // Send to backend
        try {
            await fetch('/api/hype/synapse', { method: 'POST' });
        } catch (error) {
            console.error('Failed to hype:', error);
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col justify-center items-center bg-white px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-8 flex flex-col items-center">

                    {/* Header */}
                    <div className="flex flex-col items-start w-full space-y-4">
                        <img
                            src="/synapse.logo.png"
                            alt="Synapse"
                            className="h-16 w-16 object-contain mb-2"
                        />
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                                Synapse
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                                <span>Powered by</span>
                                <div className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded-full">
                                    <img src="/logo-black.png" alt="TeamNeuron" className="h-3 w-3" />
                                    <span className="text-xs text-neutral-900">TeamNeuron</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-neutral-600 space-y-4 text-sm md:text-base leading-relaxed text-justify w-full max-w-xl">
                        <p className="font-medium text-neutral-900">
                            A state of the art, free to use tool for skill matchmaking.
                        </p>
                        <p>
                            We are building Synapse to solve a pretty basic problem in our community: actually finding the right people to work with.
                        </p>
                        <p>
                            Most networking happens by chance, or you are just limited to who you already know. Synapse fixes that by giving you a structured way to find collaborators who have exactly what you need. Say you want to learn a specific tech stack, well, Synapse connects you with someone who knows it and, ideally, wants to learn something you already know.
                        </p>
                        <p>
                            It is also fully integrated with the TeamNeuron ecosystem, so your existing account, profile, and reputation will auto sync instantly. No need to sign up for yet another thing.
                        </p>
                        <p className="text-neutral-400 text-xs italic pt-2">
                            Currently under active development.
                        </p>
                    </div>

                    {/* Hype Section */}
                    <div className="pt-8 flex flex-col items-center space-y-3">
                        <Button
                            variant="outline"
                            onClick={handleHype}
                            className={`rounded-full px-6 py-6 border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${isAnimating ? 'border-red-500 text-red-500 bg-red-50' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                        >
                            <span className="text-lg font-medium flex items-center gap-2">
                                <Heart className={`h-5 w-5 ${isAnimating ? 'fill-current' : ''}`} />
                                Hype us
                            </span>
                        </Button>
                        <div className="text-xs text-neutral-400 font-mono">
                            {hypeCount.toLocaleString()} hypes so far
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Synapse;
