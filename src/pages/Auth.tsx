import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, ArrowLeft, Eye, EyeOff, Mail, Lock, User, UserPlus, ChevronDown } from 'lucide-react';
import Footer from '@/components/Layout/Footer';


const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(searchParams.get('tab') === 'signup');
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, username, fullName);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.02\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}></div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="w-full lg:w-1/2 bg-black text-white p-8 lg:p-12 flex flex-col justify-end lg:justify-center relative overflow-hidden min-h-[50vh] lg:min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900/20"></div>
          <div className="relative z-10">
            <div className="mb-8 text-center lg:text-left">
              <img src="/logo-white.png" alt="TeamNeuron Logo" className="w-40 inline-block" />
            </div>
            <h2 className="text-3xl font-light mb-6 leading-tight">
              The Future of<br></br><span className="block text-blue-400 font-semibold">Collaborative Research</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Connect with brilliant minds, share groundbreaking research, and collaborate on the next generation of scientific discoveries.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <Brain className="h-5 w-5 mr-3 text-blue-400" />
                <span>Advanced Research Collaboration</span>
              </div>
              <div className="flex items-center text-gray-300">
                <UserPlus className="h-5 w-5 mr-3 text-blue-400" />
                <span>Global Science Community</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>Real-time Research Updates</span>
              </div>
            </div>
            <div className="w-full text-center lg:text-left mt-8">
              <span className="text-lg text-white font-semibold">
                Check out our{' '}
                <a
                  href="/featured"
                  className="underline text-white hover:text-blue-300 transition-colors font-semibold"
                  style={{ fontFamily: 'inherit', fontSize: '1.08em' }}
                >
                  Featured Articles
                </a>
                {' '}page!
              </span>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:hidden z-20">
            <ChevronDown className="w-6 h-6 text-white animate-bounce" />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 flex-grow">
          <div className="w-full max-w-md">


            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-black mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isSignUp
                    ? 'Join the global science community'
                    : 'Sign in to continue your research journey'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {isSignUp ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-black font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="Dr. Jane Smith"
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-black font-medium">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            name="username"
                            placeholder="neuroscientist"
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-black font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-black font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-black font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-black font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Toggle between Sign In and Sign Up */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600 mb-3">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full border-gray-200 text-black hover:bg-gray-50 font-medium"
                    disabled={loading}
                  >
                    {isSignUp ? 'Sign In Instead' : 'Create Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
          <Footer />
    </div>
  );
};

export default Auth;