import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function send({ to, subject, html, text }) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || 'DocenMarket <no-reply@docenmarket.com>';
  if (!t) {
    console.log('\n[email:stub] ──────────────────────────────');
    console.log(`  to:      ${to}`);
    console.log(`  subject: ${subject}`);
    console.log(`  body:    ${text || html}`);
    console.log('────────────────────────────────────────────\n');
    return { stubbed: true };
  }
  return t.sendMail({ from, to, subject, html, text });
}

export const emailService = {
  async userApproved(user) {
    return send({
      to: user.email,
      subject: 'Tu cuenta en DocenMarket fue aprobada',
      text: `Hola ${user.fullName}, tu afiliación fue verificada. Ya podés iniciar sesión en DocenMarket.`,
      html: `<p>Hola <b>${user.fullName}</b>,</p><p>Tu afiliación fue verificada. Ya podés iniciar sesión en DocenMarket.</p>`,
    });
  },

  async userRejected(user, reason) {
    return send({
      to: user.email,
      subject: 'Tu solicitud en DocenMarket fue rechazada',
      text: `Hola ${user.fullName}, lamentamos informarte que tu solicitud fue rechazada. Motivo: ${reason}`,
      html: `<p>Hola <b>${user.fullName}</b>,</p><p>Tu solicitud fue rechazada.</p><p><b>Motivo:</b> ${reason}</p>`,
    });
  },

  async listingApproved(user, listing) {
    return send({
      to: user.email,
      subject: 'Tu publicación fue aprobada',
      text: `"${listing.title}" ya está visible en DocenMarket.`,
      html: `<p>Tu publicación <b>${listing.title}</b> ya está visible en DocenMarket.</p>`,
    });
  },

  async listingRejected(user, listing, reason) {
    return send({
      to: user.email,
      subject: 'Tu publicación fue rechazada',
      text: `"${listing.title}" fue rechazada. Motivo: ${reason}`,
      html: `<p>Tu publicación <b>${listing.title}</b> fue rechazada.</p><p><b>Motivo:</b> ${reason}</p>`,
    });
  },
};
