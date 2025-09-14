import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value === "") {
      setEmailError("");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value === "") {
      setPasswordError("");
    } else if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = () => {
    // Final validation before submitting
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    // If validation passes, call the onLogin prop
    onLogin();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12">
      {/* Animated floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green-200/30"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md p-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 relative z-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-100/30 blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-green-200/30 blur-xl"></div>
        
        {/* Logo and Header with increased spacing */}
        <div className="mb-12 flex flex-col items-center space-y-4">
          <div 
            className={`p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg transition-all duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-14 h-14">
              <path fillRule="evenodd" d="M12 2.25c-5.384 0-9.75 4.366-9.75 9.75s4.366 9.75 9.75 9.75 9.75-4.366 9.75-9.75S17.384 2.25 12 2.25zm-2.625 6c-.54 0-.975.435-.975.975v4.5c0 .54.435.975.975.975h5.25c.54 0 .975-.435.975-.975v-4.5c0-.54-.435-.975-.975-.975h-5.25zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent tracking-tight">
              WECARE
            </h1>
            <h2 className="text-lg font-medium text-emerald-700">
              Welcome back to your health portal
            </h2>
          </div>
        </div>

        <CardContent className="space-y-8">
          {/* Email Input with more spacing */}
          <div className="space-y-3">
            <label htmlFor="email" className="block text-emerald-800 font-medium text-sm">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
              </div>
              <Input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 block w-full rounded-lg py-3 text-gray-800 focus:ring-2 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-200 ${
                  emailError ? "border-red-300 focus:ring-red-500" : "border-emerald-200 focus:ring-emerald-500"
                }`}
              />
              {emailError && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input with more spacing */}
          <div className="space-y-3">
            <label htmlFor="password" className="block text-emerald-800 font-medium text-sm">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className={`pl-10 pr-10 block w-full rounded-lg py-3 text-gray-800 focus:ring-2 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-200 ${
                  passwordError ? "border-red-300 focus:ring-red-500" : "border-emerald-200 focus:ring-emerald-500"
                }`}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500 hover:text-emerald-600 transition-colors"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password with more spacing */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember-me" className="block text-sm text-emerald-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Login Button with more vertical spacing */}
          <div className="pt-4">
            <Button
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={!email || !password || emailError || passwordError}
              onClick={handleSubmit}
            >
              Sign In
            </Button>
          </div>

          {/* Divider with more spacing */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-emerald-500">
                New to Wecare?
              </span>
            </div>
          </div>

          {/* Sign Up Link with more spacing */}
          <div className="text-center pt-2">
            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
              Create an account
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;