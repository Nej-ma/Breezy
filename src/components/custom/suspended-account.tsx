import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SuspendedAccountProps {
  displayName?: string;
  suspendedUntil?: string | null;
}

export function SuspendedAccount({ displayName, suspendedUntil }: SuspendedAccountProps) {
  const isPermanent = !suspendedUntil;
  const suspensionDate = suspendedUntil ? new Date(suspendedUntil) : null;
  const isExpired = suspensionDate && suspensionDate < new Date();

  if (isExpired) {
    // La suspension a expiré, ne pas afficher le message
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">
            Compte suspendu
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            <div className="space-y-3">
              <p className="font-medium">
                {displayName ? 
                  `Le compte de ${displayName} a été suspendu.` :
                  'Ce compte a été suspendu.'
                }
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
              <p className="text-xs italic">
                Il fallait penser à respecter les règles, cheh ! 😏
              </p>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuspendedAccount;
