'use client';

import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';

export default function Auth() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { state } = useSidebar();


  const handleSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center p-2">
         <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-2">
         <Button onClick={handleSignIn} variant="outline" className="w-full justify-center">
            <LogIn />
            {state === 'expanded' && <span className="ml-2">Login</span>}
         </Button>
      </div>
    );
  }

  return (
    <div className="p-2">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>
                    <UserIcon />
                    </AvatarFallback>
                </Avatar>
                {state === 'expanded' && (
                    <div className="flex flex-col items-start text-left">
                         <p className="text-sm font-medium leading-none">
                            {user.isAnonymous ? 'Anonymous User' : user.displayName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                             {user.email || user.uid}
                        </p>
                    </div>
                )}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                {user.isAnonymous ? 'Anonymous User' : user.displayName || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.email || user.uid}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
