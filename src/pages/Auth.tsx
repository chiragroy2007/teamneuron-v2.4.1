import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, ArrowLeft, Eye, EyeOff, Mail, Lock, User, UserPlus, ChevronDown } from 'lucide-react';


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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="w-full lg:w-1/2 bg-black text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden min-h-[40vh] lg:min-h-auto">
          {/* Subtle Abstract Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black"></div>

          <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
            <div className="mb-12">
              <img src="/logo-white.png" alt="TeamNeuron Logo" className="w-16 h-16 mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                The new era of <br />
                <span className="text-neutral-400">Collaborative Research</span>
              </h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-8 max-w-lg">
                Join a community of forward-thinking researchers. Collaborate, discuss, and build the future of science together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/featured" className="inline-flex items-center text-lg font-medium text-white hover:text-neutral-300 transition-colors group">
                  Explore Featured Articles
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>


          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-neutral-50/50">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-neutral-500">
                {isSignUp ? 'Enter your details below to create your account' : 'Enter your email below to access your account'}
              </p>
            </div>

            <Card className="border-neutral-200 shadow-xl shadow-neutral-200/40 bg-white">
              <CardContent className="p-8 space-y-6">
                {isSignUp ? (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Dr. Jane Smith"
                          className="h-11 bg-neutral-50 border-neutral-200"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="neuroscientist"
                          className="h-11 bg-neutral-50 border-neutral-200"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11 bg-neutral-50 border-neutral-200"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="h-11 bg-neutral-50 border-neutral-200 pr-10"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-medium transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11 bg-neutral-50 border-neutral-200"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <a href="#" className="text-xs text-neutral-500 hover:text-black">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="h-11 bg-neutral-50 border-neutral-200 pr-10"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-medium transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-neutral-500">Or continue with</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-sm text-neutral-600">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-black font-semibold hover:underline bg-transparent border-0 p-0 inline"
                      disabled={loading}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>

              </CardContent>
            </Card>

            <p className="text-center text-xs text-neutral-400">
              By clicking continue, you agree to our <Link to="/terms" className="underline hover:text-neutral-500">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-neutral-500">Privacy Policy</Link>.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;