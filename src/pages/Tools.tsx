import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tools = [
    {
        title: 'Synapse',
        description: "Skill match-making and collaboration platform.",
        logo: '/synapse.logo.png',
        link: '/synapse',
        category: 'Networking'
    },
    {
        title: 'Polymerase-go',
        description: "Organism engineering workbench powered by 'Poly' and 'Go'.",
        logo: 'https://raw.githubusercontent.com/bebop/presskit/main/gopher.png',
        link: 'https://polymerase-go.tools.teamneuron.blog',
        category: 'Engineering'
    },
    {
        title: 'CV Generator',
        description: "Open source resume builder with real-time preview and PDF export.",
        logo: 'https://www.chirag404.me/cvgen_logo.png',
        link: 'https://cv-generator.tools.teamneuron.blog',
        category: 'Productivity'
    }
];

const Tools = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-background py-10 md:py-16">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Header */}
                    <div className="mb-12 border-b border-neutral-200 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-neutral-100 rounded-lg">
                                <Wrench className="h-5 w-5 text-neutral-900" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                                Tools
                            </h1>
                        </div>
                        <p className="text-neutral-500 max-w-2xl text-lg">
                            Free, open-source utilities designed to support your work.
                        </p>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tools.map((tool, index) => {
                            const isInternal = tool.link.startsWith('/');
                            const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                                isInternal ? (
                                    <Link to={tool.link} className="group block h-full focus:outline-none">{children}</Link>
                                ) : (
                                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="group block h-full focus:outline-none">{children}</a>
                                );

                            return (
                                <CardWrapper key={index}>
                                    <Card className="h-full border border-neutral-200 bg-white hover:border-neutral-900 hover:shadow-sm transition-all duration-300 relative overflow-hidden">
                                        {/* New Badge for Synapse */}
                                        {tool.title === 'Synapse' && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                                                    NEW
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <div className="h-14 w-14 shrink-0 rounded-md border border-neutral-100 bg-neutral-50 p-2 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={tool.logo}
                                                    alt={`${tool.title} logo`}
                                                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1 mb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-semibold text-neutral-900">
                                                        {tool.title}
                                                    </CardTitle>
                                                    <Badge variant="secondary" className="text-[10px] bg-neutral-50 text-neutral-500 font-normal">
                                                        {tool.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-600 leading-snug">
                                                {tool.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </CardWrapper>
                            );
                        })}
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Tools;
