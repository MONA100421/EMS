import nodemailer from "nodemailer";
import mjml2html from "mjml";
import Handlebars from "handlebars";

/* --------------------------------------------------
   SMTP TRANSPORTER
-------------------------------------------------- */

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("❌ SMTP configuration missing in environment variables");
  }

  const port = Number(SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

/* --------------------------------------------------
   HELPER: Compile MJML safely
-------------------------------------------------- */

function compileMjml(template: string, data: any) {
  const compiled = Handlebars.compile(template)(data);
  const { html, errors } = mjml2html(compiled);

  if (errors && errors.length > 0) {
    console.error("⚠ MJML compile errors:", errors);
  }

  return html;
}

/* --------------------------------------------------
   INVITE EMAIL
-------------------------------------------------- */

export async function sendInviteEmail(
  email: string,
  rawToken: string,
  fullName: string,
) {
  const transporter = getTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

  const registerUrl = `${frontendUrl}/register?token=${rawToken}&email=${encodeURIComponent(
    email,
  )}`;

  const mjmlTemplate = `
  <mjml>
    <mj-head>
      <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700" />
      <mj-attributes>
        <mj-all font-family="Inter, Arial, sans-serif" color="#333333" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f4f7f9">
      <mj-section padding-bottom="0px" background-color="#ffffff">
        <mj-column width="100%">
          <mj-text font-size="24px" font-weight="700" color="#4A90E2">Welcome to the Team! 🚀</mj-text>
        </mj-column>
      </mj-section>
      
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="16px" line-height="1.6">
            Dear <strong>{{fullName}}</strong>,
          </mj-text>
          <mj-text font-size="16px" line-height="1.6">
            We are absolutely thrilled to have you join us! To get you started on your journey with the Employee Management System, please complete your registration by clicking the button below.
          </mj-text>
          <mj-button background-color="#4A90E2" color="white" border-radius="8px" font-size="16px" font-weight="bold" href="{{registerUrl}}" padding="20px 0px">
            Complete My Registration
          </mj-button>
          <mj-text font-size="14px" color="#777777">
            Note: This link is valid for the next 3 hours. If you have any trouble, feel free to reach out to the HR team.
          </mj-text>
          <mj-divider border-color="#eeeeee" border-width="1px" />
          <mj-text font-size="14px">
            Best Regards,<br />
            <strong>The Team</strong>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const html = compileMjml(mjmlTemplate, {
    fullName,
    registerUrl,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "You're Invited to Join EMS",
      html,
    });

    console.log("✅ Invite email sent to:", email);
  } catch (err) {
    console.error("❌ Failed to send invite email:", err);
    throw err;
  }
}

/* --------------------------------------------------
   DOCUMENT REJECTED EMAIL
-------------------------------------------------- */

export async function sendDocumentRejectedEmail({
  to,
  documentType,
  reviewer,
  feedback,
}: {
  to: string;
  documentType: string;
  reviewer: string;
  feedback?: string;
}) {
  const transporter = getTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

  const mjmlTemplate = `
  <mjml>
    <mj-body background-color="#f4f7f9">
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" color="#e74c3c">
            Document Revision Required
          </mj-text>
          <mj-text>
            Document: <strong>{{documentType}}</strong>
          </mj-text>
          <mj-text>
            Reviewer: <strong>{{reviewer}}</strong>
          </mj-text>
          <mj-text>
            Feedback: {{feedback}}
          </mj-text>
          <mj-button background-color="#e74c3c" href="{{frontendUrl}}">
            Re-upload Document
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const html = compileMjml(mjmlTemplate, {
    documentType,
    reviewer,
    feedback: feedback ?? "Please update your document.",
    frontendUrl,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Your ${documentType} requires revision`,
      html,
    });

    console.log("✅ Document rejection email sent");
  } catch (err) {
    console.error("❌ Failed to send document rejection email:", err);
    throw err;
  }
}

/* --------------------------------------------------
   ONBOARDING DECISION EMAIL
-------------------------------------------------- */

export async function sendOnboardingDecisionEmail({
  to,
  decision,
  reviewer,
  feedback,
}: {
  to: string;
  decision: "approved" | "rejected";
  reviewer: string;
  feedback?: string;
}) {
  const transporter = getTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

  const color = decision === "approved" ? "#2ecc71" : "#f39c12";

  const mjmlTemplate = `
  <mjml>
    <mj-body background-color="#f4f7f9">
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" color="${color}">
            {{statusTitle}}
          </mj-text>
          <mj-text>{{message}}</mj-text>
          <mj-text>
            Reviewer: <strong>{{reviewer}}</strong>
          </mj-text>
          {{#if feedback}}
            <mj-text>Notes: {{feedback}}</mj-text>
          {{/if}}
          <mj-button background-color="${color}" href="{{frontendUrl}}">
            View Details
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const html = compileMjml(mjmlTemplate, {
    reviewer,
    feedback,
    frontendUrl,
    statusTitle:
      decision === "approved"
        ? "Onboarding Approved 🎉"
        : "Onboarding Update Required",
    message:
      decision === "approved"
        ? "Your onboarding has been fully approved. Welcome aboard!"
        : "Your onboarding needs some updates. Please review the feedback.",
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject:
        decision === "approved"
          ? "Onboarding Approved"
          : "Onboarding Requires Updates",
      html,
    });

    console.log("✅ Onboarding decision email sent");
  } catch (err) {
    console.error("❌ Failed to send onboarding email:", err);
    throw err;
  }
}
