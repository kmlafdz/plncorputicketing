import {
  User,
  Ticket,
  Category,
  ActivityLog,
  Comment,
  Progress,
  AppNotification,
  SlaConfig,
  TicketStatus,
  PriorityLevel,
  Role,
  AutoAssignmentRule,
  Assignment,
  AdminAuditLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_SLA_CONFIGS,
  INITIAL_TICKETS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_COMMENTS,
  INITIAL_PROGRESSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ASSIGNMENT_RULES,
  INITIAL_ADMIN_AUDIT_LOGS,
} from '../data/initialData';
import {
  generateNextCategoryCode,
  generateCategoryAbbreviation,
  INITIAL_PREDEFINED_CODES,
  formatCategoryCode,
} from '../utils/categoryHelpers';

const KEYS = {
  USERS: 'pln_tickets_users_v1',
  CATEGORIES: 'pln_tickets_categories_v1',
  SLA_CONFIGS: 'pln_tickets_sla_configs_v1',
  ASSIGNMENT_RULES: 'pln_tickets_assignment_rules_v1',
  ASSIGNMENTS: 'pln_tickets_assignments_v1',
  TICKETS: 'pln_tickets_data_v1',
  LOGS: 'pln_tickets_logs_v1',
  COMMENTS: 'pln_tickets_comments_v1',
  PROGRESSES: 'pln_tickets_progresses_v1',
  NOTIFICATIONS: 'pln_tickets_notifications_v1',
  ACTIVE_USER: 'pln_tickets_active_user_v1',
  ADMIN_AUDIT_LOGS: 'pln_tickets_admin_audit_logs_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initIfEmpty();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  public initIfEmpty(force = false) {
    if (force || !localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (force || !localStorage.getItem(KEYS.CATEGORIES)) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (force || !localStorage.getItem(KEYS.SLA_CONFIGS)) {
      localStorage.setItem(KEYS.SLA_CONFIGS, JSON.stringify(INITIAL_SLA_CONFIGS));
    }
    if (force || !localStorage.getItem(KEYS.ASSIGNMENT_RULES)) {
      localStorage.setItem(KEYS.ASSIGNMENT_RULES, JSON.stringify(INITIAL_ASSIGNMENT_RULES));
    }
    if (force || !localStorage.getItem(KEYS.TICKETS)) {
      localStorage.setItem(KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    }
    if (force || !localStorage.getItem(KEYS.LOGS)) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }
    if (force || !localStorage.getItem(KEYS.COMMENTS)) {
      localStorage.setItem(KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    }
    if (force || !localStorage.getItem(KEYS.PROGRESSES)) {
      localStorage.setItem(KEYS.PROGRESSES, JSON.stringify(INITIAL_PROGRESSES));
    }
    if (force || !localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (force || !localStorage.getItem(KEYS.ADMIN_AUDIT_LOGS)) {
      localStorage.setItem(KEYS.ADMIN_AUDIT_LOGS, JSON.stringify(INITIAL_ADMIN_AUDIT_LOGS));
    }
    if (force) {
      this.notify();
    }
  }

  public resetToDefault(): void {
    this.initIfEmpty(true);
  }

  // Active User / Auth
  public getActiveUser(): User {
    const defaultUser = INITIAL_USERS[0];
    const user = this.getItem<User>(KEYS.ACTIVE_USER, defaultUser);
    return user || defaultUser;
  }

  public setActiveUser(user: User): void {
    this.setItem(KEYS.ACTIVE_USER, user);
  }

  public setActiveUserById(userId: string): void {
    const users = this.getUsers();
    const found = users.find((u) => u.uid === userId);
    if (found) {
      this.setActiveUser(found);
    }
  }

  // Users
  public getUsers(): User[] {
    const list = this.getItem<User[]>(KEYS.USERS, INITIAL_USERS);
    let updated = false;
    for (const initUser of INITIAL_USERS) {
      const idx = list.findIndex((u) => u.uid === initUser.uid || u.email === initUser.email);
      if (idx === -1) {
        list.push(initUser);
        updated = true;
      } else {
        const existing = list[idx];
        // Enrich missing fields like position or lastLoginAt without overwriting admin's active status or custom edits
        if (!existing.position && initUser.position) {
          existing.position = initUser.position;
          updated = true;
        }
        if (!existing.lastLoginAt && initUser.lastLoginAt) {
          existing.lastLoginAt = initUser.lastLoginAt;
          updated = true;
        }
      }
    }
    if (updated) {
      try {
        localStorage.setItem(KEYS.USERS, JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }
    return list;
  }

  // Admin Audit Logs
  public getAdminAuditLogs(): AdminAuditLog[] {
    return this.getItem<AdminAuditLog[]>(KEYS.ADMIN_AUDIT_LOGS, INITIAL_ADMIN_AUDIT_LOGS);
  }

  public addAdminAuditLog(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): AdminAuditLog {
    const logs = this.getAdminAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      id: `adm-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(KEYS.ADMIN_AUDIT_LOGS, logs);
    return newLog;
  }

  // Count active tickets for a user (as PIC)
  public getActiveTicketsForPic(picId: string): Ticket[] {
    const activeStatuses: TicketStatus[] = [
      'Baru',
      'Diverifikasi',
      'Ditugaskan',
      'Dalam Proses',
      'Menunggu Pelapor',
      'Menunggu Pihak Ketiga',
      'Menunggu Persetujuan',
    ];
    return this.getTickets().filter(
      (t) => t.currentPicId === picId && activeStatuses.includes(t.status)
    );
  }

  // Reassign all active tickets from one PIC to another
  public reassignActiveTickets(
    fromPicId: string,
    toPicId: string,
    actor: User,
    reason: string = 'Pengalihan beban penugasan (PIC dinonaktifkan)'
  ): { count: number; reassignedTicketNumbers: string[] } {
    const toPic = this.getUserById(toPicId);
    const fromPic = this.getUserById(fromPicId);
    if (!toPic) {
      throw new Error('PIC tujuan tidak ditemukan.');
    }

    const tickets = this.getTickets();
    const activeStatuses: TicketStatus[] = [
      'Baru',
      'Diverifikasi',
      'Ditugaskan',
      'Dalam Proses',
      'Menunggu Pelapor',
      'Menunggu Pihak Ketiga',
      'Menunggu Persetujuan',
    ];

    const reassignedNumbers: string[] = [];
    const timestamp = new Date().toISOString();

    for (const t of tickets) {
      if (t.currentPicId === fromPicId && activeStatuses.includes(t.status)) {
        t.currentPicId = toPic.uid;
        t.currentPicName = toPic.name;
        t.currentPicTeam = toPic.team || t.currentPicTeam;
        t.assignedPicId = toPic.uid;
        t.assignedTeam = toPic.team || t.assignedTeam;
        t.assignmentStatus = 'reassigned';
        t.updatedAt = timestamp;
        t.assignedAt = timestamp;
        if (t.status === 'Baru' || t.status === 'Diverifikasi') {
          t.status = 'Ditugaskan';
        }

        reassignedNumbers.push(t.ticketNumber);

        this.addActivityLog({
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          actorId: actor.uid,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'PENGALIHAN_PIC',
          beforeValue: `${fromPic?.name || fromPicId}`,
          afterValue: `${toPic.name} (${toPic.team || 'Tim Teknis'})`,
          details: `Tiket dialihkan dari ${fromPic?.name || 'PIC sebelumnya'} kepada ${toPic.name}. Alasan: ${reason}`,
        });

        this.addNotification({
          recipientId: toPic.uid,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          title: 'Pengalihan Tiket Masuk',
          message: `Tiket #${t.ticketNumber} "${t.title}" telah dialihkan kepada Anda oleh Admin Helpdesk.`,
          type: 'assignment',
        });
      }
    }

    this.setItem(KEYS.TICKETS, tickets);

    if (reassignedNumbers.length > 0) {
      this.addAdminAuditLog({
        actorId: actor.uid,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'TICKETS_REASSIGNED',
        targetUserId: fromPicId,
        targetUserName: fromPic?.name || fromPicId,
        targetUserNip: fromPic?.employeeId,
        details: `Mengalihkan ${reassignedNumbers.length} tiket aktif (${reassignedNumbers.join(', ')}) dari ${fromPic?.name || 'PIC'} kepada ${toPic.name}. Alasan: ${reason}`,
      });
    }

    return {
      count: reassignedNumbers.length,
      reassignedTicketNumbers: reassignedNumbers,
    };
  }

  // Check safety rule: protect last admin and prevent self-role demotion
  public validateRoleChange(
    targetUser: User,
    newRole: Role,
    actor: User
  ): { valid: boolean; message?: string } {
    if (targetUser.uid === actor.uid && newRole !== actor.role) {
      return {
        valid: false,
        message: 'Demi kepatuhan keamanan, Anda tidak dapat mengubah peran (role) akun Anda sendiri.',
      };
    }

    if (targetUser.role === 'admin' && newRole !== 'admin') {
      const activeAdmins = this.getUsers().filter(
        (u) => u.role === 'admin' && u.isActive && u.uid !== targetUser.uid
      );
      if (activeAdmins.length === 0) {
        return {
          valid: false,
          message: 'Gagal: Akun ini merupakan Administrator aktif terakhir di sistem. Anda tidak dapat mencabut hak akses admin terakhir.',
        };
      }
    }

    return { valid: true };
  }

  // Check safety rule: protect last admin deactivation
  public validateStatusChange(
    targetUser: User,
    newStatus: boolean,
    actor: User
  ): { valid: boolean; message?: string } {
    if (!newStatus && targetUser.uid === actor.uid) {
      return {
        valid: false,
        message: 'Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan login saat ini.',
      };
    }

    if (!newStatus && targetUser.role === 'admin') {
      const activeAdmins = this.getUsers().filter(
        (u) => u.role === 'admin' && u.isActive && u.uid !== targetUser.uid
      );
      if (activeAdmins.length === 0) {
        return {
          valid: false,
          message: 'Gagal: Tidak dapat menonaktifkan akun Administrator aktif terakhir di sistem.',
        };
      }
    }

    return { valid: true };
  }

  public getUserById(uid: string): User | undefined {
    return this.getUsers().find((u) => u.uid === uid);
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(KEYS.USERS, users);
    
    const active = this.getActiveUser();
    if (active.uid === user.uid) {
      this.setActiveUser(user);
    }
  }

  // Categories
  public getCategories(): Category[] {
    const list = this.getItem<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    let updated = false;

    // Backward-compatibility: Ensure every category has a valid code
    for (const cat of list) {
      if (!cat.code) {
        if (INITIAL_PREDEFINED_CODES[cat.id]) {
          cat.code = INITIAL_PREDEFINED_CODES[cat.id];
        } else {
          cat.code = generateNextCategoryCode(cat.name, list);
        }
        updated = true;
      }
    }

    // Ensure all predefined initial categories exist in case the user has partial old cache
    for (const initCat of INITIAL_CATEGORIES) {
      const idx = list.findIndex((c) => c.id === initCat.id);
      if (idx === -1) {
        list.push(initCat);
        updated = true;
      } else if (!list[idx].code && initCat.code) {
        list[idx].code = initCat.code;
        updated = true;
      }
    }

    if (updated) {
      this.setItem(KEYS.CATEGORIES, list);
    }
    return list;
  }

  public getCategoryById(categoryId: string): Category | undefined {
    return this.getCategories().find((c) => c.id === categoryId);
  }

  public getNextCategoryCode(name: string, customAbbr?: string, year?: number): string {
    const categories = this.getCategories();
    return generateNextCategoryCode(name, categories, customAbbr, year);
  }

  public saveCategory(category: Category): void {
    const list = this.getCategories();
    if (!category.code) {
      category.code = generateNextCategoryCode(category.name, list);
    }
    const index = list.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      list[index] = category;
    } else {
      list.push(category);
    }
    this.setItem(KEYS.CATEGORIES, list);
  }

  public deleteCategory(categoryId: string): void {
    const list = this.getCategories().filter((c) => c.id !== categoryId);
    this.setItem(KEYS.CATEGORIES, list);
  }

  // SLA Configs
  public getSlaConfigs(): SlaConfig[] {
    return this.getItem<SlaConfig[]>(KEYS.SLA_CONFIGS, INITIAL_SLA_CONFIGS);
  }

  public saveSlaConfig(configs: SlaConfig[]): void {
    this.setItem(KEYS.SLA_CONFIGS, configs);
  }

  // Auto Assignment Rules
  public getAssignmentRules(): AutoAssignmentRule[] {
    return this.getItem<AutoAssignmentRule[]>(KEYS.ASSIGNMENT_RULES, INITIAL_ASSIGNMENT_RULES);
  }

  public saveAssignmentRule(rule: AutoAssignmentRule): void {
    const list = this.getAssignmentRules();
    const index = list.findIndex((r) => r.id === rule.id || r.categoryId === rule.categoryId);
    if (index >= 0) {
      list[index] = rule;
    } else {
      list.push(rule);
    }
    this.setItem(KEYS.ASSIGNMENT_RULES, list);
  }

  public saveAssignmentRules(rules: AutoAssignmentRule[]): void {
    this.setItem(KEYS.ASSIGNMENT_RULES, rules);
  }

  /**
   * Deterministic Auto-Assignment Engine:
   * Maps category -> Target Team -> Active PIC candidate with lowest active workload
   * Consistent tie-breaker: employeeId
   */
  public findAutoAssignee(categoryId: string, categoryName: string): {
    assignedPic: User | null;
    targetTeam: string;
    method: 'auto' | 'manual';
    reason: string;
    workload: number;
  } {
    const rules = this.getAssignmentRules();
    const rule = rules.find(
      (r) =>
        (r.categoryId === categoryId || r.categoryName.toLowerCase() === categoryName.toLowerCase()) &&
        r.isActive
    );
    const targetTeam = rule ? rule.targetTeam : 'IT Helpdesk & Operations';

    // Active PICs only
    const allPics = this.getUsers().filter((u) => u.role === 'pic' && u.isActive);
    if (allPics.length === 0) {
      return {
        assignedPic: null,
        targetTeam,
        method: 'auto',
        reason: 'Tidak ada petugas PIC yang berstatus aktif di sistem.',
        workload: 0,
      };
    }

    const activeTickets = this.getTickets().filter(
      (t) => !['Selesai', 'Ditutup', 'Ditolak'].includes(t.status)
    );

    // Candidates within target team
    let teamCandidates = allPics.filter(
      (p) => p.team && p.team.toLowerCase() === targetTeam.toLowerCase()
    );

    // If specific default PIC configured and active
    if (rule?.defaultPicId) {
      const preferred = allPics.find((p) => p.uid === rule.defaultPicId);
      if (preferred && !teamCandidates.some((c) => c.uid === preferred.uid)) {
        teamCandidates.unshift(preferred);
      }
    }

    // Fall back to all active PICs if team has no active PIC
    const candidates = teamCandidates.length > 0 ? teamCandidates : allPics;

    // Calculate active workload (only tickets NOT finished/closed)
    const candidatesWithWorkload = candidates.map((pic) => {
      const workload = activeTickets.filter((t) => t.currentPicId === pic.uid).length;
      return { pic, workload };
    });

    // Sort by lowest active workload, tie-breaker: explicit PIC order
    const orderMap: Record<string, number> = {
      'user-pic-1': 1,
      'user-pic-2': 2,
      'user-pic-3': 3,
    };
    candidatesWithWorkload.sort((a, b) => {
      if (a.workload !== b.workload) {
        return a.workload - b.workload;
      }
      const ordA = orderMap[a.pic.uid] || 99;
      const ordB = orderMap[b.pic.uid] || 99;
      if (ordA !== ordB) return ordA - ordB;
      return (a.pic.employeeId || a.pic.uid).localeCompare(b.pic.employeeId || b.pic.uid);
    });

    const selected = candidatesWithWorkload[0];
    return {
      assignedPic: selected.pic,
      targetTeam: selected.pic.team || targetTeam,
      method: 'auto',
      reason: `Auto-Assignment kategori "${categoryName}" ke tim ${selected.pic.team || targetTeam} (Beban aktif: ${selected.workload} tiket).`,
      workload: selected.workload,
    };
  }

  // Assignments
  public getAssignments(ticketId?: string): Assignment[] {
    const list = this.getItem<Assignment[]>(KEYS.ASSIGNMENTS, []);
    if (ticketId) {
      return list.filter((a) => a.ticketId === ticketId);
    }
    return list;
  }

  public addAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    list.unshift(assignment);
    this.setItem(KEYS.ASSIGNMENTS, list);
  }

  // Tickets
  public getTickets(): Ticket[] {
    const list = this.getItem<Ticket[]>(KEYS.TICKETS, INITIAL_TICKETS);
    const users = this.getUsers();
    const userMap = new Map(users.map((u) => [u.uid, u]));
    const catMap = new Map(this.getCategories().map((c) => [c.id, c.code]));
    let updated = false;
    for (const t of list) {
      if (!t.categoryCode && catMap.has(t.categoryId)) {
        t.categoryCode = catMap.get(t.categoryId);
        updated = true;
      }
      if (t.currentPicId && userMap.has(t.currentPicId)) {
        const u = userMap.get(t.currentPicId)!;
        if (t.currentPicName !== u.name || (u.team && t.currentPicTeam !== u.team)) {
          t.currentPicName = u.name;
          t.currentPicTeam = u.team || t.currentPicTeam;
          updated = true;
        }
      }
    }
    if (updated) {
      try {
        localStorage.setItem(KEYS.TICKETS, JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }
    return list;
  }

  public getTicketById(id: string): Ticket | undefined {
    return this.getTickets().find((t) => t.id === id);
  }

  public getNextTicketNumber(): string {
    const tickets = this.getTickets();
    const currentYear = new Date().getFullYear();
    const prefix = `TCU-${currentYear}-`;

    let maxNum = 0;
    tickets.forEach((t) => {
      if (t.ticketNumber && t.ticketNumber.startsWith(prefix)) {
        const parts = t.ticketNumber.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  }

  public createTicket(
    newTicket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'reopenedCount'>
  ): Ticket {
    const tickets = this.getTickets();
    const ticketNumber = this.getNextTicketNumber();
    const id = `tkt-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Check if reporter explicitly selected a PIC or if auto-assignment should run
    let assignedPic: User | null = null;
    let assignmentMethod: 'auto' | 'manual' = 'auto';
    let assignmentReason = '';
    let targetTeam = '';

    if (newTicket.currentPicId && newTicket.currentPicId !== 'AUTO') {
      const explicitPic = this.getUserById(newTicket.currentPicId);
      if (explicitPic && explicitPic.isActive) {
        assignedPic = explicitPic;
        assignmentMethod = 'manual';
        targetTeam = explicitPic.team || 'Tim Teknis';
        assignmentReason = `Dipilih langsung oleh pelapor (${newTicket.reporterName})`;
      }
    }

    if (!assignedPic) {
      // Run Auto Assignment Engine
      const assignResult = this.findAutoAssignee(newTicket.categoryId, newTicket.categoryName);
      assignedPic = assignResult.assignedPic;
      assignmentMethod = 'auto';
      targetTeam = assignResult.targetTeam;
      assignmentReason = assignResult.reason;
    }

    const status: TicketStatus = assignedPic ? 'Ditugaskan' : 'Baru';
    const assignedAt: string | undefined = assignedPic ? timestamp : undefined;

    const cat = this.getCategoryById(newTicket.categoryId);
    const categoryCode = newTicket.categoryCode || cat?.code;

    const ticket: Ticket = {
      ...newTicket,
      id,
      ticketNumber,
      categoryCode,
      status,
      currentPicId: assignedPic?.uid,
      currentPicName: assignedPic?.name,
      currentPicTeam: assignedPic ? (assignedPic.team || targetTeam) : undefined,
      assignedPicId: assignedPic?.uid,
      assignedTeam: assignedPic ? (assignedPic.team || targetTeam) : undefined,
      assignmentMethod,
      assignmentStatus: assignedPic ? 'assigned' : 'unassigned',
      assignedAt,
      createdAt: timestamp,
      updatedAt: timestamp,
      reopenedCount: 0,
    };

    tickets.unshift(ticket);
    this.setItem(KEYS.TICKETS, tickets);

    // Initial Ticket Created Log
    this.addActivityLog({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      actorId: ticket.reporterId,
      actorName: ticket.reporterName,
      actorRole: 'pelapor',
      action: 'TIKET_DIBUAT',
      afterValue: status,
      details: `Tiket "${ticket.title}" berhasil dibuat dengan nomor ${ticket.ticketNumber}.`,
    });

    const admins = this.getUsers().filter((u) => u.role === 'admin');

    if (assignedPic) {
      // 1. Record Assignment
      this.addAssignment({
        id: `asg-${Date.now()}`,
        ticketId: ticket.id,
        picId: assignedPic.uid,
        picName: assignedPic.name,
        assignedBy: assignmentMethod === 'manual' ? ticket.reporterId : 'SYSTEM-AUTO',
        assignedByName:
          assignmentMethod === 'manual'
            ? `${ticket.reporterName} (Pelapor)`
            : 'Auto-Assignment Engine CorpU',
        assignedAt: timestamp,
        assignmentStatus: 'pending',
        reason: assignmentReason,
      });

      // 2. Activity Log
      this.addActivityLog({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        actorId: assignmentMethod === 'manual' ? ticket.reporterId : 'system',
        actorName: assignmentMethod === 'manual' ? ticket.reporterName : 'Auto-Assignment Engine',
        actorRole: assignmentMethod === 'manual' ? 'pelapor' : 'admin',
        action: assignmentMethod === 'manual' ? 'PENUGASAN_LANGSUNG_PELAPOR' : 'PENUGASAN_OTOMATIS',
        beforeValue: 'Baru',
        afterValue: 'Ditugaskan',
        details:
          assignmentMethod === 'manual'
            ? `Pelapor (${ticket.reporterName}) menugaskan langsung tiket ini kepada ${assignedPic.name} (${assignedPic.team || targetTeam}).`
            : `Sistem secara otomatis menugaskan tiket kepada ${assignedPic.name} (${assignedPic.team || targetTeam}) berdasarkan kategori "${ticket.categoryName}".`,
      });

      // 3. Notify PIC
      this.addNotification({
        recipientId: assignedPic.uid,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title:
          assignmentMethod === 'manual'
            ? `Penugasan Langsung dari ${ticket.reporterName}`
            : 'Penugasan Tiket Baru',
        message:
          assignmentMethod === 'manual'
            ? `Pelapor ${ticket.reporterName} (${ticket.department}) memilih Anda untuk menangani tiket #${ticket.ticketNumber} "${ticket.title}".`
            : `Tiket #${ticket.ticketNumber} "${ticket.title}" (Prioritas: ${ticket.priority}) dari ${ticket.reporterName} (${ticket.department}) telah ditugaskan kepada Anda.`,
        type: 'assignment',
      });

      // 4. Notify Reporter (Confirmation of assigned PIC)
      this.addNotification({
        recipientId: ticket.reporterId,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: 'Tiket Berhasil Dibuat & Ditugaskan',
        message: `Tiket #${ticket.ticketNumber} telah diteruskan kepada ${assignedPic.name} (${assignedPic.team || targetTeam}).`,
        type: 'status',
      });

      // 5. Notify Admins
      admins.forEach((admin) => {
        this.addNotification({
          recipientId: admin.uid,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title:
            assignmentMethod === 'manual'
              ? 'Tiket Baru (Ditugaskan oleh Pelapor)'
              : 'Tiket Baru Auto-Assigned',
          message:
            assignmentMethod === 'manual'
              ? `Tiket #${ticket.ticketNumber} "${ticket.title}" langsung ditugaskan oleh pelapor kepada ${assignedPic.name}.`
              : `Tiket baru #${ticket.ticketNumber} "${ticket.title}" otomatis ditugaskan ke ${assignedPic.name}.`,
          type: 'assignment',
        });
      });
    } else {
      // No PIC available: Ticket stays in unassigned queue and alert admin (Requirement 3)
      this.addActivityLog({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        actorId: 'system',
        actorName: 'Auto-Assignment Engine',
        actorRole: 'admin',
        action: 'AUTO_ASSIGNMENT_GAGAL',
        beforeValue: 'Baru',
        afterValue: 'Baru',
        details: `Tidak ditemukan petugas PIC aktif untuk kategori "${ticket.categoryName}". Tiket masuk antrean Belum Ditugaskan untuk verifikasi manual Admin.`,
      });

      admins.forEach((admin) => {
        this.addNotification({
          recipientId: admin.uid,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: 'Auto-Assignment Gagal (Butuh Disposisi Manual)',
          message: `Tiket #${ticket.ticketNumber} "${ticket.title}" belum memiliki PIC aktif. Mohon tetapkan PIC secara manual.`,
          type: 'sla',
        });
      });
    }

    return ticket;
  }

  public updateTicket(ticket: Ticket, actorUser: User, actionName: string, details?: string): void {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticket.id);
    if (index >= 0) {
      const oldTicket = tickets[index];
      ticket.updatedAt = new Date().toISOString();
      tickets[index] = ticket;
      this.setItem(KEYS.TICKETS, tickets);

      // Log status transition or update
      this.addActivityLog({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        actorId: actorUser.uid,
        actorName: actorUser.name,
        actorRole: actorUser.role,
        action: actionName,
        beforeValue: oldTicket.status,
        afterValue: ticket.status,
        details: details || `Status tiket diperbarui menjadi ${ticket.status}.`,
      });

      // Dispatch targeted notifications
      if (oldTicket.status !== ticket.status) {
        // Notify reporter if status changed
        if (ticket.reporterId !== actorUser.uid) {
          this.addNotification({
            recipientId: ticket.reporterId,
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            title: `Status Tiket: ${ticket.status}`,
            message: `Tiket #${ticket.ticketNumber} Anda kini berstatus "${ticket.status}".`,
            type: 'status',
          });
        }

        // Notify PIC if assigned and not the actor
        if (ticket.currentPicId && ticket.currentPicId !== actorUser.uid) {
          this.addNotification({
            recipientId: ticket.currentPicId,
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            title: `Pembaruan Tiket #${ticket.ticketNumber}`,
            message: `Status tiket tugas Anda diperbarui menjadi "${ticket.status}".`,
            type: 'status',
          });
        }
      }
    }
  }

  // Activity Logs
  public getActivityLogs(ticketId?: string): ActivityLog[] {
    const all = this.getItem<ActivityLog[]>(KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
    if (ticketId) {
      return all.filter((l) => l.ticketId === ticketId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addActivityLog(logData: Omit<ActivityLog, 'id' | 'createdAt'>): void {
    const logs = this.getItem<ActivityLog[]>(KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
    const newLog: ActivityLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(KEYS.LOGS, logs);
  }

  // Comments
  public getComments(ticketId: string): Comment[] {
    const all = this.getItem<Comment[]>(KEYS.COMMENTS, INITIAL_COMMENTS);
    return all.filter((c) => c.ticketId === ticketId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const comments = this.getItem<Comment[]>(KEYS.COMMENTS, INITIAL_COMMENTS);
    const newComment: Comment = {
      ...commentData,
      id: `com-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    this.setItem(KEYS.COMMENTS, comments);

    // Notify ticket participants
    const ticket = this.getTicketById(commentData.ticketId);
    if (ticket && commentData.visibility === 'public') {
      if (commentData.authorId !== ticket.reporterId) {
        this.addNotification({
          recipientId: ticket.reporterId,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: 'Komentar Baru pada Tiket Anda',
          message: `${commentData.authorName}: "${commentData.message.substring(0, 75)}..."`,
          type: 'comment',
        });
      }
      if (ticket.currentPicId && commentData.authorId !== ticket.currentPicId) {
        this.addNotification({
          recipientId: ticket.currentPicId,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: 'Tanggapan Pelapor Tiket',
          message: `${commentData.authorName}: "${commentData.message.substring(0, 75)}..."`,
          type: 'comment',
        });
      }
    }

    return newComment;
  }

  // Progresses
  public getProgresses(ticketId: string): Progress[] {
    const all = this.getItem<Progress[]>(KEYS.PROGRESSES, INITIAL_PROGRESSES);
    return all.filter((p) => p.ticketId === ticketId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addProgress(progressData: Omit<Progress, 'id' | 'createdAt'>): Progress {
    const progresses = this.getItem<Progress[]>(KEYS.PROGRESSES, INITIAL_PROGRESSES);
    const newProgress: Progress = {
      ...progressData,
      id: `prg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    progresses.unshift(newProgress);
    this.setItem(KEYS.PROGRESSES, progresses);
    return newProgress;
  }

  // Notifications
  public getNotifications(recipientId: string): AppNotification[] {
    const all = this.getItem<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.recipientId === recipientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getItem<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = list.findIndex((n) => n.id === id);
    if (index >= 0) {
      list[index].isRead = true;
      this.setItem(KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead(recipientId: string): void {
    const list = this.getItem<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    let modified = false;
    list.forEach((n) => {
      if (n.recipientId === recipientId && !n.isRead) {
        n.isRead = true;
        modified = true;
      }
    });
    if (modified) {
      this.setItem(KEYS.NOTIFICATIONS, list);
    }
  }

  public addNotification(notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const list = this.getItem<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newNotif);
    this.setItem(KEYS.NOTIFICATIONS, list);
  }

  // Export full backup
  public exportAllData(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      appName: 'PLN Corporate University Ticketing Management System',
      tickets: this.getTickets(),
      users: this.getUsers(),
      categories: this.getCategories(),
      slaConfigs: this.getSlaConfigs(),
      activityLogs: this.getActivityLogs(),
      comments: this.getItem(KEYS.COMMENTS, []),
      progresses: this.getItem(KEYS.PROGRESSES, []),
    };
    return JSON.stringify(backup, null, 2);
  }
}

export const storageService = new StorageService();
