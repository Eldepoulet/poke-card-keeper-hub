
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

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    // For demo purposes, we're just doing a simple login
    // In a real app, this would connect to a backend
    if (isRegister) {
      toast.success(`Account created for ${username}!`);
    } else {
      toast.success(`Welcome back, ${username}!`);
    }
    
    onLogin(username);
    // Reset form
    setUsername('');
    setPassword('');
    setIsRegister(false);
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
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="Enter your username"
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
            >
              {isRegister ? 'Already have an account?' : 'Need an account?'}
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-pokemon-red hover:bg-pokemon-red/90"
            >
              {isRegister ? 'Sign Up' : 'Sign In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
