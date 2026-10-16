export type Role = 'admin' | 'pelapor' | 'pic' | 'manajemen';

export type TicketType = 'Insiden' | 'Keluhan' | 'Permintaan Layanan' | 'Permintaan Perubahan';

export type ImpactLevel = 'Individu' | 'Tim' | 'Departemen' | 'Banyak Pengguna';

export type UrgencyLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export type PriorityLevel = 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';

export type TicketStatus =
  | 'Baru'
  | 'Diverifikasi'
  | 'Ditugaskan'
  | 'Dalam Proses'
  | 'Menunggu Pelapor'
  | 'Menunggu Pihak Ketiga'
  | 'Menunggu Persetujuan'
  | 'Selesai'
  | 'Ditutup'
  | 'Ditolak';

export interface User {
  uid: string;
  employeeId: string; // NIP
  name: string;
  email: string;
  department: string;
  position?: string; // Jabatan
  role: Role;
  team?: string;
  expertise?: string[];
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: 'USER_CREATED' | 'USER_UPDATED' | 'ROLE_CHANGED' | 'STATUS_CHANGED' | 'PASSWORD_RESET' | 'TICKETS_REASSIGNED';
  targetUserId: string;
  targetUserName: string;
  targetUserNip?: string;
  details: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // Format: TCU-YYYY-NNNNN
  title: string;
  description: string;
  type: TicketType;
  categoryId: string;
  categoryName: string;
  categoryCode?: string; // Format: #XXXX-YYYY-NNN
  subcategoryId: string;
  subcategoryName: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  department: string;
  location: string;
  assetReference?: string;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  priority: PriorityLevel;
  status: TicketStatus;
  currentPicId?: string;
  currentPicName?: string;
  currentPicTeam?: string;
  assignedPicId?: string;
  assignedTeam?: string;
  assignmentMethod?: 'auto' | 'manual';
  assignmentStatus?: 'assigned' | 'unassigned' | 'reassigned';
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  acceptedAt?: string;
  inProgressAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  dueAt: string; // SLA deadline
  slaResponseDueAt?: string;
  firstResponseAt?: string;
  resolution?: string;
  resolutionProofUrl?: string;
  reopenedCount: number;
  rejectionReason?: string;
  priorityChangeReason?: string;
  tags?: string[];
}

export interface AutoAssignmentRule {
  id: string;
  categoryId: string;
  categoryName: string;
  targetTeam: string;
  defaultPicId?: string;
  defaultPicName?: string;
  loadBalancingStrategy: 'least_active_workload' | 'round_robin' | 'direct_pic';
  isActive: boolean;
  notes?: string;
}

export interface Assignment {
  id: string;
  ticketId: string;
  picId: string;
  picName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  assignmentStatus: 'pending' | 'accepted' | 'rejected' | 'completed';
  reason?: string;
}

export interface Progress {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  message: string;
  statusBefore?: TicketStatus;
  statusAfter?: TicketStatus;
  visibility: 'public' | 'internal';
  createdAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  message: string;
  visibility: 'public' | 'internal';
  createdAt: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  uploadedBy: string;
  uploadedByName: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  storagePath?: string;
  url?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  ticketId: string;
  ticketNumber: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  beforeValue?: string;
  afterValue?: string;
  details?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  code: string; // Format: #XXXX-YYYY-NNN
  name: string;
  description: string;
  subcategories: string[];
  defaultTeam: string;
  defaultSlaResponseMinutes: number;
  defaultSlaResolveHours: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  ticketId: string;
  ticketNumber: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'status' | 'assignment' | 'comment' | 'sla' | 'system';
  createdAt: string;
}

export interface SlaConfig {
  priority: PriorityLevel;
  responseMinutes: number;
  resolveHours: number;
  description: string;
}
