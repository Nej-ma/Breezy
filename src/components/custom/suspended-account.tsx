import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/adminService';
import { useRouter } from 'next/navigation';

interface SuspendedAccountProps {
  displayName?: string;
  suspendedUntil?: string | null;
  userId?: string;
  currentUserRole?: string;
  onUnsuspend?: () => void;
}

export function SuspendedAccount({ 
  displayName, 
  suspendedUntil, 
  userId, 
  currentUserRole, 
  onUnsuspend 
}: SuspendedAccountProps) {
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const router = useRouter();
  
  const isPermanent = !suspendedUntil;
  const suspensionDate = suspendedUntil ? new Date(suspendedUntil) : null;
  const isExpired = suspensionDate && suspensionDate < new Date();
  
  // Vérifier si l'utilisateur actuel peut lever la suspension
  const canUnsuspend = userId && currentUserRole && 
    (currentUserRole === 'admin' || currentUserRole === 'moderator');

  const handleUnsuspend = async () => {
    if (!userId || !canUnsuspend) return;
    
    setIsUnsuspending(true);
    try {
      await adminService.unsuspendUser(userId);
      if (onUnsuspend) {
        onUnsuspend();
      } else {
        router.refresh(); // Recharger la page
      }
    } catch (error) {
      console.error('Erreur lors de la levée de suspension:', error);
    } finally {
      setIsUnsuspending(false);
    }
  };

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
                Il fallait penser à respecter les règles ! 😏
              </p>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              Retour à l&apos;accueil
            </Button>
          </Link>
          
          {canUnsuspend && (
            <Button 
              onClick={handleUnsuspend}
              disabled={isUnsuspending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              {isUnsuspending ? 'Levée en cours...' : 'Lever la suspension'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuspendedAccount;
