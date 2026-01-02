import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const Terms = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
                        <p className="text-lg text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Card className="bg-white border border-neutral-200 shadow-sm">
                        <CardContent className="p-8 sm:p-12 prose prose-neutral max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    By accessing and using TeamNeuron ("the Platform"), you agree to comply with and be bound by these Terms of Service. If you strictly disagree with any part of these terms, you may not access the service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Description of Service</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    TeamNeuron is a collaborative platform designed for researchers, students, and scientists to share tools, publish articles, discuss findings, and manage research clubs. The Platform provides tools for content creation, profile management, and community interaction.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. User Accounts</h2>
                                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                                    <li>You are responsible for maintaining the security of your account credentials.</li>
                                    <li>You must provide accurate and complete information during registration.</li>
                                    <li>You are solely responsible for all activities that occur under your account.</li>
                                    <li>We reserve the right to suspend or terminate accounts that violate our community guidelines or these terms.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. User Content</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    By posting content (articles, comments, discussions, images) on TeamNeuron, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.
                                </p>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    You retain all ownership rights to your content. However, you represent and warrant that:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                                    <li>You own the content or have the right to grant the license.</li>
                                    <li>Your content does not violate the privacy, publicity, copyright, or other rights of any person.</li>
                                    <li>Your content is accurate to the best of your knowledge (especially regarding scientific claims).</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Prohibited Conduct</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    Users agree not to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                                    <li>Use the service for any illegal purpose.</li>
                                    <li>Harass, abuse, or harm other users.</li>
                                    <li>Post misinformation or scientifically fraudulent content intentionally.</li>
                                    <li>Attempt to gain unauthorized access to the Platform's systems.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Disclaimer of Warranties</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    The service is provided on an "AS IS" and "AS AVAILABLE" basis. TeamNeuron makes no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Changes to Terms</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    We reserve the right to modify these terms at any time. We will provide notice of significant changes through the Platform. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Contact Us</h2>
                                <p className="text-neutral-700 leading-relaxed">
                                    If you have any questions about these Terms, please contact us at support@teamneuron.blog.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Terms;
