import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type MedicinePayload = {
    name: string;
    dosage: {
        morning?: string;
        afternoon?: string;
        night?: string;
        [key: string]: unknown;
    };
    before_after_food?: string;
    notes?: string;
};

type PatientPayload = {
    name?: string | null;
    email?: string | null;
    age?: number | null;
    weight?: number | null;
    height?: number | null;
    phone?: string | null;
};

type DoctorPayload = {
    name: string;
    hospital?: string | null;
};

type PrescriptionEmailParams = {
    patient: PatientPayload;
    doctor: DoctorPayload;
    medicines: MedicinePayload[];
    prescriptionId: string;
    prescriptionDate: Date;
    portalLink?: string;
};

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendPrescriptionEmail(params: PrescriptionEmailParams) {
    const { patient, doctor, medicines, prescriptionId, prescriptionDate, portalLink } = params;

    if (!patient.email) {
        console.warn(
            `sendPrescriptionEmail: patient has no email, skipping email notification for prescription ${prescriptionId}`
        );
        return;
    }

    const portalUrl =
        portalLink ||
        process.env.PATIENT_PORTAL_URL ||
        "https://mediglad.vercel.app/dashboard/patient";

    const doctorName = doctor.name || "Your Doctor";
    const hospitalName = doctor.hospital || "Medilink";

    const medsRows = medicines
        .map((med) => {
            const m = med.dosage?.morning || "-";
            const a = med.dosage?.afternoon || "-";
            const n = med.dosage?.night || "-";
            const notes = med.notes || "-";
            const food =
                med.before_after_food === "BEFORE"
                    ? "Before Food"
                    : med.before_after_food === "AFTER"
                        ? "After Food"
                        : "-";

            return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">
            ${med.name}
          </td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;color:#374151;">
            M: ${m} &nbsp; A: ${a} &nbsp; N: ${n}
          </td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;color:#374151;">
            ${food}
          </td>
          <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;color:#374151;">
            ${notes}
          </td>
        </tr>
      `;
        })
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Prescription is Ready</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:640px;margin:24px auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <h2 style="margin:0;font-size:20px;color:#111827;">Your Prescription is Ready</h2>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">
              ${hospitalName}
            </p>
          </div>

          <div style="padding:24px 24px 8px;">
            <p style="margin:0 0 12px;font-size:14px;color:#111827;">
              Dear <strong>${patient.name || "Patient"}</strong>,
            </p>
            <p style="margin:0 0 12px;font-size:14px;color:#374151;">
              Thank you for visiting <strong>${hospitalName}</strong>. 
              Your doctor, <strong>Dr. ${doctorName}</strong>, has added a new prescription to your Medilink patient portal.
            </p>

            <div style="margin:18px 0;padding:12px 14px;border-radius:8px;background-color:#f9fafb;border:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#111827;">Patient Information</p>
              <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151;">
                <tr>
                  <td style="padding:4px 0;width:120px;">Name</td>
                  <td style="padding:4px 0;font-weight:500;">${patient.name ?? "-"}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Age</td>
                  <td style="padding:4px 0;">${patient.age ?? "-"}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Weight</td>
                  <td style="padding:4px 0;">${patient.weight ?? "-"} kg</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Height</td>
                  <td style="padding:4px 0;">${patient.height ?? "-"} cm</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">Phone</td>
                  <td style="padding:4px 0;">${patient.phone ?? "-"}</td>
                </tr>
              </table>
            </div>

            <div style="margin:18px 0;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#111827;">
                Prescription Details
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">
                Prescription ID: <span style="font-weight:500;color:#111827;">${prescriptionId}</span><br/>
                Date: <span style="font-weight:500;color:#111827;">${prescriptionDate.toLocaleString()}</span>
              </p>
              <table style="width:100%;border-collapse:collapse;margin-top:6px;">
                <thead>
                  <tr>
                    <th style="padding:8px;border:1px solid #e5e7eb;background-color:#f9fafb;font-size:12px;text-align:left;color:#374151;">Medicine</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;background-color:#f9fafb;font-size:12px;text-align:left;color:#374151;">Dosage (M / A / N)</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;background-color:#f9fafb;font-size:12px;text-align:left;color:#374151;">Food</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;background-color:#f9fafb;font-size:12px;text-align:left;color:#374151;">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${medsRows || `<tr><td colspan="4" style="padding:10px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">No medicines recorded.</td></tr>`}
                </tbody>
              </table>
            </div>

            <div style="margin:24px 0 8px;text-align:center;">
              <a href="${portalUrl}"
                 style="display:inline-block;padding:10px 20px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600;">
                View in Patient Portal
              </a>
            </div>

            <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">
              If you have any questions or feel unwell, please contact your doctor or visit the clinic as advised.
            </p>
          </div>

          <div style="padding:14px 20px;border-top:1px solid #e5e7eb;text-align:center;background-color:#f9fafb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Wishing you a speedy recovery,
              <br />
              <span style="font-weight:600;color:#6b7280;">Team ${hospitalName}</span>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: patient.email,
        subject: "Your Prescription is Ready",
        html,
    });
}


