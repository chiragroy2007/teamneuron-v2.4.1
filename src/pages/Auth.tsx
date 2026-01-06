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
  const [isSignUp, setIsSignUp] = useState(true);
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-neutral-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-neutral-200/20 to-transparent rounded-full blur-3xl" />

          <div className="w-full max-w-[440px] relative z-10">

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-neutral-200/50 p-8 border border-neutral-200/50">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-neutral-500">
                  {isSignUp ? 'Join the research community' : 'Continue your research journey'}
                </p>
              </div>

              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="fullName" className="text-xs font-medium text-neutral-600">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        placeholder="Dr. Jane Smith"
                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="username" className="text-xs font-medium text-neutral-600">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        placeholder="neuroscientist"
                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-900/10 focus:border-neutral-900 transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="text-xs font-medium text-neutral-600">
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-xs font-medium text-neutral-600">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-full transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <p className="text-xs text-center text-neutral-500 pt-3">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-neutral-900 hover:underline font-medium">
                      Terms
                    </Link>{' '}
                    &{' '}
                    <Link to="/privacy" className="text-neutral-900 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="signin-email" className="text-xs font-medium text-neutral-600">
                      Email Address
                    </label>
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="signin-password" className="text-xs font-medium text-neutral-600">
                        Password
                      </label>
                      <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-full transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <p className="text-xs text-center text-neutral-500 pt-3">
                    Secured with industry-standard encryption
                  </p>
                </form>
              )}
            </div>

            {/* Bottom toggle */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-neutral-100 px-6 py-3 rounded-full">
                <p className="text-sm text-neutral-700 font-medium">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm font-bold text-neutral-900 hover:text-neutral-600 transition-colors underline"
                  disabled={loading}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;