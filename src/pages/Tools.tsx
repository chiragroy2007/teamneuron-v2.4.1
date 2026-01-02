import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Wrench } from 'lucide-react';

const tools = [
    {
        title: 'Polymerase-go',
        description: "Engineer biology organisms with Polymerase-go Workbench, powered by 'Poly' and super-fast 'Go' backend.",
        logo: 'https://raw.githubusercontent.com/bebop/presskit/main/gopher.png',
        link: 'https://polymerase-go.tools.teamneuron.blog',
        tags: ['Biology', 'Engineering', 'Go', 'Workbench']
    },
    {
        title: 'CV Generator',
        description: "An open source web app where users can generate a resume/PDF with just a few clicks, completely for free. It supports multiple templates, real-time preview, and local data persistence for privacy.",
        logo: 'https://www.chirag404.me/cvgen_logo.png',
        link: 'https://cv-generator.tools.teamneuron.blog',
        tags: ['Productivity', 'Career', 'Open Source', 'PDF']
    }
];

const Tools = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-background py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-6xl">

                    <div className="flex flex-col items-center text-center mb-16 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                            <Wrench className="h-6 w-6 text-neutral-800" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
                            Computational Tools
                        </h1>
                        <p className="text-lg text-neutral-500 max-w-2xl">
                            Open-sourced computational tools designed to enhance research efficiency and scientific discovery.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tools.map((tool, index) => (
                            <Card key={index} className="group flex flex-col overflow-hidden border-neutral-200 transition-all duration-300 hover:shadow-xl hover:border-neutral-300 bg-white">
                                <div className="h-2 bg-neutral-900 w-full transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                                <CardHeader className="flex flex-row items-center gap-6 pb-2">
                                    <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 p-2 flex items-center justify-center">
                                        <img
                                            src={tool.logo}
                                            alt={`${tool.title} logo`}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-bold text-neutral-900">
                                            {tool.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {tool.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold uppercase tracking-wide">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow pt-4">
                                    <p className="text-neutral-600 leading-relaxed text-sm">
                                        {tool.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 pb-6 px-6">
                                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button className="w-full bg-black hover:bg-neutral-800 text-white transition-colors">
                                            Launch Tool
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </a>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-20 text-center space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
                            More tools are being developed
                        </div>
                        <div className="space-y-4">
                            <p className="text-lg text-neutral-900 font-medium">
                                Want to join the development team?
                            </p>
                            <a href="mailto:chirag20251069@students.iisertirupati.ac.in">
                                <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:text-black">
                                    Email Chirag
                                </Button>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Tools;
