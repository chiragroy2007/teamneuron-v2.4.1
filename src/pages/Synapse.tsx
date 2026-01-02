import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Network, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Synapse: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="py-20 px-4 bg-black">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center mb-8">
              <img
                src="/synapse.png"
                alt="Synapse Logo"
              />
            </div>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              A comprehensive research networking platform connecting undergraduate scientists across the globe.
              Where knowledge flows, collaboration thrives, and discoveries begin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white hover:bg-gray-200 text-black px-8 py-3">
                <Link to="/auth?tab=signup">
                  Join Synapse
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-3 border-white text-black hover:bg-white hover:text-black">
                <Link to="/articles">
                  Explore Research
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Platform Overview
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Synapse bridges online journals and offline collaboration for undergraduate researchers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center p-6 border-gray-200">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Network className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-lg text-black">Research Networking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Connect with fellow researchers and build academic relationships across disciplines.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-gray-200">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-lg text-black">Digital Journals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Publish research in peer-reviewed digital journals with global visibility.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-gray-200">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-lg text-black">Collaborative Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Work together on projects and share resources with researchers worldwide.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-gray-200">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-lg text-black">Research Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Promote integrated research opportunities between undergrads, professors, and students.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-black mb-6">
                  Our Location
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg">
                    Synapse was founded by undergraduate students of <strong>IISER Tirupati</strong> as a student initiative to bridge the gap between online research journals and offline collaboration.
                  </p>
                  <p className="text-lg">
                    Located at the Indian Institute of Science Education and Research (IISER) Tirupati, Synapse serves as a central hub for scientific collaboration and research networking.
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-2">Founded by:</p>
                    <p className="font-medium text-black">chirag20251069@students.iisertirupati.ac.in</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=79.59%2C13.74%2C79.61%2C13.75&layer=mapnik&marker=13.7458%2C79.5964"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  title="IISER Tirupati Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Synapse;
