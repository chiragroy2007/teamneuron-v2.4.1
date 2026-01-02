import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const Privacy = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
                        <p className="text-lg text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Card className="bg-white border border-neutral-200 shadow-sm">
                        <CardContent className="p-8 sm:p-12 prose prose-neutral max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    TeamNeuron ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our collaborative platform and tell you about your privacy rights.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. The Data We Collect</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    We verify and collect different types of personal data to provide our research collaboration features:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                                    <li><strong>Identity Data:</strong> Includes first name, last name, username, title, and profile images.</li>
                                    <li><strong>Contact Data:</strong> Includes email address, professional links (LinkedIn), and institutional affiliation.</li>
                                    <li><strong>Technical Data:</strong> Includes internet protocol (IP) address, browser type and version, time zone setting, operating system, and platform.</li>
                                    <li><strong>Content Data:</strong> Articles, discussions, comments, and images you upload to the platform.</li>
                                    <li><strong>Profile Data:</strong> Your research interests, expertise, education, and bio information provided in your profile.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. How We Use Your Data</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    We use your data to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                                    <li>Register you as a new user and manage your account.</li>
                                    <li>Enable you to collaborate, publish articles, and join research clubs.</li>
                                    <li>Facilitate communication between researchers.</li>
                                    <li>Ensure the security of our platform and prevent fraud.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Data Storage and Security</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    Your data is stored securely on our servers. We use appropriate security measures (including password hashing and secure connections) to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
                                </p>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    <strong>Image Uploads:</strong> Images uploaded within articles or as profile pictures are stored on our servers and served publicly to allow others to view your content.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Cookies and Tracking</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    We use essential cookies and local storage tokens to handle user authentication and session management. We do not use third-party tracking cookies for advertising purposes.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Your Rights</h2>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    You have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of processing.
                                </p>
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    You can edit your profile information at any time through the "Your Profile" page.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Contact Us</h2>
                                <p className="text-neutral-700 leading-relaxed">
                                    For any privacy-related questions, please contact us at privacy@teamneuron.blog.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Privacy;
