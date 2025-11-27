// Спільне сховище для тестових даних поширення
// В реальному додатку це буде замінено на базу даних

export interface ShareLink {
  id: string;
  documentId: string;
  url: string;
  accessLevel: 'view' | 'comment' | 'edit';
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  accessCount: number;
  lastAccessed?: Date;
}

export interface ShareInvitation {
  id: string;
  documentId: string;
  email: string;
  accessLevel: 'view' | 'comment' | 'edit';
  status: 'pending' | 'accepted' | 'expired';
  sentAt: Date;
  expiresAt: Date;
  message?: string;
  createdBy: string;
}

let shareLinks: ShareLink[] = [];
let shareInvitations: ShareInvitation[] = [];

export function getShareLinks(): ShareLink[] {
  return shareLinks;
}

export function getShareInvitations(): ShareInvitation[] {
  return shareInvitations;
}

export function getShareLinksByDocumentId(documentId: string): ShareLink[] {
  return shareLinks.filter(link => link.documentId === documentId);
}

export function getShareInvitationsByDocumentId(documentId: string): ShareInvitation[] {
  return shareInvitations.filter(inv => inv.documentId === documentId);
}

export function addShareLink(link: ShareLink): void {
  shareLinks.push(link);
}

export function addShareInvitation(invitation: ShareInvitation): void {
  shareInvitations.push(invitation);
}

export function getShareLinkById(id: string): ShareLink | undefined {
  return shareLinks.find(link => link.id === id);
}

export function getShareInvitationById(id: string): ShareInvitation | undefined {
  return shareInvitations.find(inv => inv.id === id);
}

export function updateShareLink(id: string, updates: Partial<ShareLink>): ShareLink | null {
  const index = shareLinks.findIndex(link => link.id === id);
  if (index === -1) return null;
  
  shareLinks[index] = { ...shareLinks[index], ...updates };
  return shareLinks[index];
}

export function updateShareInvitation(id: string, updates: Partial<ShareInvitation>): ShareInvitation | null {
  const index = shareInvitations.findIndex(inv => inv.id === id);
  if (index === -1) return null;
  
  shareInvitations[index] = { ...shareInvitations[index], ...updates };
  return shareInvitations[index];
}

export function deleteShareLink(id: string): boolean {
  const index = shareLinks.findIndex(link => link.id === id);
  if (index === -1) return false;
  
  shareLinks.splice(index, 1);
  return true;
}

export function deleteShareInvitation(id: string): boolean {
  const index = shareInvitations.findIndex(inv => inv.id === id);
  if (index === -1) return false;
  
  shareInvitations.splice(index, 1);
  return true;
}

