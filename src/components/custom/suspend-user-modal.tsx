'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (duration?: number, reason?: string) => Promise<void>;
  userName: string;
  isLoading: boolean;
}

const SUSPENSION_DURATIONS = [
  { label: 'Permanente', value: null },
  { label: '1 heure', value: 1 },
  { label: '6 heures', value: 6 },
  { label: '12 heures', value: 12 },
  { label: '24 heures', value: 24 },
  { label: '3 jours', value: 72 },
  { label: '1 semaine', value: 168 },
  { label: '2 semaines', value: 336 },
  { label: '1 mois', value: 720 },
  { label: 'Personnalisé', value: 'custom' },
];

export function SuspendUserModal({
  isOpen,
  onClose,
  onSuspend,
  userName,
  isLoading,
}: SuspendUserModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | null>('24');
  const [customDuration, setCustomDuration] = useState<string>('');
  const [reason, setReason] = useState<string>('Violation des règles de la communauté');

  const handleSuspend = async () => {
    let duration: number | undefined;
    
    if (selectedDuration === null) {
      // Suspension permanente
      duration = undefined;
    } else if (selectedDuration === 'custom') {
      duration = parseInt(customDuration) || 24;
    } else {
      duration = parseInt(selectedDuration);
    }

    await onSuspend(duration, reason);
  };

  const handleClose = () => {
    setSelectedDuration('24');
    setCustomDuration('');
    setReason('Violation des règles de la communauté');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Suspendre {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Durée de suspension</Label>
            <Select
              value={selectedDuration || 'permanent'}
              onValueChange={(value) => setSelectedDuration(value === 'permanent' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une durée" />
              </SelectTrigger>
              <SelectContent>
                {SUSPENSION_DURATIONS.map((duration) => (
                  <SelectItem 
                    key={duration.label} 
                    value={duration.value === null ? 'permanent' : duration.value.toString()}
                  >
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDuration === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDuration">Durée personnalisée (heures)</Label>
              <Input
                id="customDuration"
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Nombre d'heures"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Raison de la suspension</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison de cette suspension..."
              className="min-h-[80px]"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Attention :</strong> Cette action suspendra immédiatement l&apos;utilisateur. 
              Il ne pourra plus publier, commenter ou interagir sur la plateforme.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSuspend}
            disabled={isLoading}
          >
            {isLoading ? 'Suspension...' : 'Suspendre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
