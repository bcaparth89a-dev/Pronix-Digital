import { env } from "../config/env.js";

export function baseEmailTemplate({ title, body }) {
  return `
    <!doctype html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1>${title}</h1>
        <div>${body}</div>
      </body>
    </html>
  `;
}

export function contactConfirmationTemplate({
  name,
  serviceInterest,
  budgetRange,
}) {
  return baseEmailTemplate({
    title: "We've received your message!",
    body: `
      <p>Hi <strong>${name}</strong>,</p>

      <p>
        Thank you for reaching out to <strong>Pronix Digital</strong>! We've successfully
        received your inquiry and our team is currently reviewing it.
      </p>

      <p>
        <strong>We will get back to you as soon as possible</strong>, and typically respond
        within <strong>1–2 business days</strong>.
      </p>

      <table style="margin-top:16px;border-collapse:collapse;width:100%;max-width:400px;">
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">Service Interest</td>
          <td style="padding:6px 0;font-weight:600;">
            ${serviceInterest || "Not specified"}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">Budget Range</td>
          <td style="padding:6px 0;font-weight:600;">
            ${budgetRange || "Not specified"}
          </td>
        </tr>
      </table>

      <p style="margin-top:24px;">
        If you need immediate assistance or have any additional information to share,
        simply reply to this email.
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />

      <p><strong>Co-Founders</strong></p>

      <p style="margin:4px 0;">
        <strong>Pawar Parth Umesh</strong><br/>
        📞 +91 7990101983
      </p>

      <p style="margin:12px 0 0 0;">
        <strong>Ronit Kailash Dholwani</strong><br/>
        📞 +91 7984806071
      </p>

      <p style="margin-top:24px;">
        Best regards,<br/>
        <strong>The Pronix Digital Team</strong>
      </p>
    `,
  });
}

export function contactNotificationTemplate(contact) {
  const {
    id,
    _id,
    name,
    email,
    phone,
    company,
    serviceInterest,
    budgetRange,
    message,
    status,
  } = contact;
  const contactId = id || _id;
  const currentStatus = status || "new";

  const isSelected = (val) => (currentStatus === val ? "selected" : "");

  return baseEmailTemplate({
    title: `New Inquiry from ${name}`,
    body: `
      <p>A new contact form submission has been received.</p>
      <table style="margin-top:16px;border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:140px;font-size:14px;">Name</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:6px 0;">${phone || "—"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Company</td><td style="padding:6px 0;">${company || "—"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Service</td><td style="padding:6px 0;">${serviceInterest || "—"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;">Budget</td><td style="padding:6px 0;">${budgetRange || "—"}</td></tr>
      </table>
      <div style="margin-top:16px;padding:12px;background:#f9fafb;border-left:3px solid #3b82f6;border-radius:4px;">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${message.replace(/\n/g, "<br>")}</p>
      </div>

      <div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;background-color:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb;">
        <form action="${env.CLIENT_URL}/admin/contacts" method="GET" style="margin:0;">
          <input type="hidden" name="updateId" value="${contactId}" />
          <label style="font-size:14px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">Update Status Directly from Email:</label>
          <div style="display:inline-block;vertical-align:middle;margin-bottom:8px;">
            <select name="newStatus" style="height:34px;border-radius:4px;border:1px solid #d1d5db;padding:0 12px;font-size:13px;font-family:Arial,sans-serif;color:#374151;cursor:pointer;background-color:white;outline:none;width:150px;display:inline-block;">
              <option value="new" ${isSelected("new")}>New</option>
              <option value="in-review" ${isSelected("in-review")}>In Review</option>
              <option value="contacted" ${isSelected("contacted")}>Contacted</option>
              <option value="qualified" ${isSelected("qualified")}>Qualified</option>
              <option value="closed" ${isSelected("closed")}>Closed</option>
              <option value="spam" ${isSelected("spam")}>Spam</option>
            </select>
          </div>
          <div style="display:inline-block;vertical-align:middle;margin-left:8px;margin-bottom:8px;">
            <button type="submit" style="height:34px;background-color:#2563eb;color:white;border:none;padding:0 18px;font-size:13px;font-family:Arial,sans-serif;border-radius:4px;font-weight:600;cursor:pointer;display:inline-block;box-shadow:0 1px 2px rgba(0,0,0,0.05);">Update</button>
          </div>
        </form>
        
        <div style="margin-top:12px;">
          <p style="margin:0 0-4px 0;font-size:12px;color:#6b7280;">Or use quick links:</p>
          <div style="font-size:12px;margin-top:4px;">
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=new" style="color:#2563eb;text-decoration:underline;margin-right:12px;">New</a>
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=in-review" style="color:#2563eb;text-decoration:underline;margin-right:12px;">In Review</a>
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=contacted" style="color:#2563eb;text-decoration:underline;margin-right:12px;">Contacted</a>
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=qualified" style="color:#2563eb;text-decoration:underline;margin-right:12px;">Qualified</a>
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=closed" style="color:#2563eb;text-decoration:underline;margin-right:12px;">Closed</a>
            <a href="${env.CLIENT_URL}/admin/contacts?updateId=${contactId}&newStatus=spam" style="color:#dc2626;text-decoration:underline;">Spam</a>
          </div>
        </div>
      </div>
    `,
  });
}
