import apiClient from "@/utils/api";
import type { Role } from "@/utils/types/userType";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  isVerified: boolean;
  isSuspended: boolean;
  suspendedUntil?: string | null;
  createdAt: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SuspendUserRequest {
  duration?: number; // en heures, optionnel pour suspension permanente
  reason?: string;
}

class AdminService {
  /**
   * Récupère tous les utilisateurs (Admin/Moderator uniquement)
   */
  async getAllUsers(page: number = 1, limit: number = 10, role?: string, suspended?: boolean): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (role) params.append('role', role);
      if (suspended !== undefined) params.append('suspended', suspended.toString());

      const response = await apiClient.get(`auth/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par ID (Admin/Moderator uniquement)
   */
  async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.get(`auth/admin/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Met à jour le rôle d'un utilisateur (Admin uniquement)
   */
  async updateUserRole(userId: string, newRole: Role): Promise<AdminUser> {
    try {
      const response = await apiClient.put(`auth/admin/users/${userId}/role`, {
        role: newRole
      });
      return response.data.user;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      throw error;
    }
  }

  /**
   * Suspend un utilisateur (Admin/Moderator)
   */
  async suspendUser(userId: string, data: SuspendUserRequest): Promise<AdminUser> {
    try {
      const response = await apiClient.post(`auth/admin/users/${userId}/suspend`, data);
      return response.data.user;
    } catch (error) {
      console.error("Erreur lors de la suspension:", error);
      throw error;
    }
  }

  /**
   * Lève la suspension d'un utilisateur (Admin/Moderator)
   */
  async unsuspendUser(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.post(`auth/admin/users/${userId}/unsuspend`);
      return response.data.user;
    } catch (error) {
      console.error("Erreur lors de la levée de suspension:", error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur actuel a les permissions administratives
   */
  hasAdminPermissions(userRole: Role): boolean {
    return userRole === 'admin';
  }

  /**
   * Vérifie si l'utilisateur actuel a les permissions de modération
   */
  hasModeratorPermissions(userRole: Role): boolean {
    return userRole === 'admin' || userRole === 'moderator';
  }

  /**
   * Vérifie si l'utilisateur peut modifier le rôle d'un autre utilisateur
   */
  canModifyUserRole(currentUserRole: Role, targetUserRole: Role): boolean {
    // Seuls les admins peuvent modifier les rôles
    if (currentUserRole !== 'admin') return false;
    
    // Un admin peut modifier le rôle de tout le monde sauf d'autres admins
    return targetUserRole !== 'admin';
  }

  /**
   * Vérifie si l'utilisateur peut suspendre un autre utilisateur
   */
  canSuspendUser(currentUserRole: Role, targetUserRole: Role): boolean {
    // Admins et modérateurs peuvent suspendre
    if (!this.hasModeratorPermissions(currentUserRole)) return false;
    
    // Un modérateur ne peut pas suspendre un admin ou un autre modérateur
    if (currentUserRole === 'moderator' && targetUserRole !== 'user') return false;
    
    // Un admin peut suspendre tout le monde sauf d'autres admins
    if (currentUserRole === 'admin' && targetUserRole === 'admin') return false;
    
    return true;
  }
}

export const adminService = new AdminService();
