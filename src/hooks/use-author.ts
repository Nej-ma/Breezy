import { useState, useRef } from "react";
import { UserProfile } from "@/utils/types/userType";
import { userService } from "@/services/userService";

export function useAuthorProfiles() {
  const [authorProfiles, setAuthorProfiles] = useState<
    Record<string, UserProfile>
  >({});
  // Utilisation d'une ref pour stocker les promesses en cours
  const pendingFetches = useRef<Map<string, Promise<UserProfile | null>>>(
    new Map()
  );

  const getAuthorProfile = async (authorId: string) => {
    // Retourner le profil du cache si existant
    if (authorProfiles[authorId]) {
      return authorProfiles[authorId];
    }

    // Vérifier si une requête est déjà en cours pour cet auteur
    const pendingFetch = pendingFetches.current.get(authorId);
    if (pendingFetch) {
      return pendingFetch;
    }

    // Créer une nouvelle promesse pour ce fetch
    const fetchPromise = userService
      .getUserProfileById(authorId)
      .then((profile) => {
        if (profile) {
          setAuthorProfiles((prev) => ({
            ...prev,
            [authorId]: profile,
          }));
        }
        // Nettoyer la promesse en cours une fois terminée
        pendingFetches.current.delete(authorId);
        return profile;
      })
      .catch((error) => {
        console.error("Error fetching author profile:", error);
        // Nettoyer la promesse en cas d'erreur
        pendingFetches.current.delete(authorId);
        return null;
      });

    // Stocker la promesse en cours
    pendingFetches.current.set(authorId, fetchPromise);

    return fetchPromise;
  };

  return { authorProfiles, getAuthorProfile };
}
