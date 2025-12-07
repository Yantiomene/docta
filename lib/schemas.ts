import { z } from "zod";

export const RoleSchema = z.enum(["admin", "medecin", "infirmiere", "patient"]);

export const PatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
});

export const MedicalRecordSchema = z.object({
  patientId: z.string().min(1),
  summary: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const HospitalizationSchema = z
  .object({
    patientId: z.string().min(1),
    ward: z.string().optional(),
    room: z.string().optional(),
    bed: z.string().optional(),
    admittedAt: z.string().min(1),
    dischargedAt: z.string().optional(),
    status: z.enum(["active", "discharged", "planned"]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "discharged") {
      const hasDate = !!(data.dischargedAt && data.dischargedAt.trim());
      if (!hasDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La date de sortie est requise lorsque le statut est 'discharged'",
          path: ["dischargedAt"],
        });
      }
    }
  });

export const UpdateHospitalizationSchema = z
  .object({
    id: z.string().min(1),
    ward: z.string().optional(),
    room: z.string().optional(),
    bed: z.string().optional(),
    admittedAt: z.string().optional(),
    dischargedAt: z.string().optional(),
    status: z.enum(["active", "discharged", "planned"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "discharged") {
      const hasDate = !!(data.dischargedAt && data.dischargedAt.trim());
      if (!hasDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La date de sortie est requise lorsque le statut est 'discharged'",
          path: ["dischargedAt"],
        });
      }
    }
  });

export const SoinSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().min(1),
  assignedToNurseId: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "done", "missed"]),
});

export const AppointmentSchema = z.object({
  patientId: z.string().min(1),
  medecinId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["booked", "cancelled", "completed"]),
  reason: z.string().optional(),
});

export const MessageSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1),
});

export const NotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(["in_app", "email", "push"]),
  title: z.string().min(1),
  message: z.string().min(1),
});

export const ShiftSchema = z.object({
  userId: z.string().min(1),
  role: RoleSchema,
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});
