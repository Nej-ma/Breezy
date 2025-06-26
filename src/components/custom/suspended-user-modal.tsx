'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuspendedUserModalProps {
  isOpen: boolean;
  suspendedUntil?: string | null;
  onLogout: () => void;
}

export function SuspendedUserModal({
  isOpen,
  suspendedUntil,
  onLogout
}: SuspendedUserModalProps) {
  const router = useRouter();
  
  const isPermanent = !suspendedUntil;
  const suspensionDate = suspendedUntil ? new Date(suspendedUntil) : null;
  const isExpired = suspensionDate && suspensionDate < new Date();

  const handleLogout = async () => {
    try {
      // Appeler l'API de déconnexion
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Si la suspension a expiré, ne pas afficher le modal
  if (isExpired) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Vous êtes suspendu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="space-y-2">
                <p className="font-medium">
                  Votre compte a été suspendu de la plateforme.
                </p>
                <p className="text-sm">
                  {isPermanent ? (
                    "Cette suspension est permanente pour violation grave des règles de la communauté."
                  ) : (
                    <>
                      Suspension temporaire jusqu&apos;au{' '}
                      <span className="font-medium">
                        {suspensionDate?.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs italic mt-2">
                  Vous ne pouvez plus publier, commenter ou interagir sur la plateforme pendant cette période.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Que faire ?</strong> Si vous pensez que cette suspension est une erreur, 
              contactez notre équipe de modération via : <a href="mailto:noreplybreezy@gmail.com">noreplybreezy@gmail.com</a>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
