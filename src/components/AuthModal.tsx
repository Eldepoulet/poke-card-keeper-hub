
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isRegister) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Account created! Check your email for verification.');
        if (data.user) {
          onLogin(data.user.email || '');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success(`Welcome back!`);
        if (data.user) {
          onLogin(data.user.email || '');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegister ? 'Create an Account' : 'Welcome Back Trainer!'}</DialogTitle>
          <DialogDescription>
            {isRegister 
              ? 'Sign up to start tracking your Pokémon card collection.'
              : 'Sign in to access your Pokémon card collection.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="Enter your email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setIsRegister(!isRegister)}
              disabled={isLoading}
            >
              {isRegister ? 'Already have an account?' : 'Need an account?'}
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-pokemon-red hover:bg-pokemon-red/90"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
