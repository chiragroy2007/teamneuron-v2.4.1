import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Users, FileText, MessageSquare, Zap, Globe, BookOpen } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Research Articles",
      description: "Access and publish cutting-edge neuroscience research papers and studies."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Scientific Discussions",
      description: "Engage in meaningful conversations with fellow researchers and experts."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Expert Community",
      description: "Connect with neuroscientists, researchers, and thought leaders worldwide."
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Neural Networks",
      description: "Explore the latest in artificial intelligence and brain modeling."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Real-time Collaboration",
      description: "Work together on research projects and share insights instantly."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Knowledge Base",
      description: "Access a comprehensive library of neuroscience resources and tools."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero neural-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="pulse-ring"></div>
                <img src={logo} alt="TeamNeuron" className="h-16 w-16 relative z-10" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient animate-fade-in">
              TeamNeuron
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
              The premier platform for neuroscience research, collaboration, and discovery
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              {user ? (
                <Link to="/articles">
                  <Button size="lg" className="btn-neural text-lg px-8 py-4">
                    <FileText className="mr-2 h-5 w-5" />
                    Explore Research
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="btn-neural text-lg px-8 py-4">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary/50 hover:bg-primary/10">
                      Join Community
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">
              Advancing Neuroscience Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of researchers, scientists, and innovators pushing the boundaries of brain science
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-neural hover:scale-105 transition-transform duration-300">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-neural">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-gradient">
              Ready to Shape the Future of Neuroscience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with brilliant minds, share groundbreaking research, and contribute to humanity's understanding of the brain.
            </p>
            {!user && (
              <Link to="/auth?tab=signup">
                <Button size="lg" className="btn-neural text-lg px-8 py-4">
                  <Brain className="mr-2 h-5 w-5" />
                  Join TeamNeuron Today
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
