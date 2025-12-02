export type Role = "admin" | "medecin" | "infirmiere" | "patient";

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date
  gender: "male" | "female" | "other";
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
};

export type MedicalRecord = {
  id: string;
  patientId: string;
  summary?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Hospitalization = {
  id: string;
  patientId: string;
  ward?: string;
  room?: string;
  bed?: string;
  admittedAt: string; // ISO date
  dischargedAt?: string; // ISO date
  status: "active" | "discharged" | "planned";
};

export type Soin = {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  scheduledAt: string; // ISO date-time
  assignedToNurseId?: string;
  status: "scheduled" | "in_progress" | "done" | "missed";
};

export type Appointment = {
  id: string;
  patientId: string;
  medecinId: string;
  startsAt: string; // ISO date-time
  endsAt?: string; // ISO date-time
  location?: string;
  status: "booked" | "cancelled" | "completed";
  reason?: string;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string; // ISO date-time
  readAt?: string; // ISO date-time
};

export type Notification = {
  id: string;
  userId: string;
  type: "in_app" | "email" | "push";
  title: string;
  message: string;
  createdAt: string; // ISO date-time
  readAt?: string; // ISO date-time
};

export type Shift = {
  id: string;
  userId: string;
  role: Role;
  startsAt: string; // ISO date-time
  endsAt: string; // ISO date-time
};
