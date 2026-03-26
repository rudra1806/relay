function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
}

export function createOTPEmailTemplate(name, otp) {
  const safeName = escapeHtml(name);
  const safeOTP = escapeHtml(otp);
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify Your Email - Relay</title>
  <style type="text/css">
    body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0a0a0b; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; box-sizing: border-box; }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .hero-title { font-size: 28px !important; line-height: 1.2 !important; }
      .pad-sides { padding-left: 24px !important; padding-right: 24px !important; }
      .otp-box { font-size: 36px !important; padding: 20px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#0a0a0b; word-break:break-word;">

<!-- Preheader -->
<div style="display:none; font-size:1px; color:#0a0a0b; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  Your verification code is ${safeOTP}. Valid for 10 minutes.
</div>

<!-- Outer wrapper -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0a0a0b;">
  <tr>
    <td align="center" style="padding: 40px 16px;">

      <!-- Card -->
      <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600"
        style="width:600px; background-color:#111113; border-radius:16px; border:1px solid #2a2a2d; overflow:hidden;">

        <!-- ── GOLD TOP ACCENT BAR ── -->
        <tr>
          <td style="height:4px; background: linear-gradient(90deg, #b8860b 0%, #e6c775 50%, #b8860b 100%); font-size:0; line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── HEADER ── -->
        <tr>
          <td class="pad-sides" style="padding: 36px 48px 28px 48px;">
            <!-- Logo row -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding-right:12px; vertical-align:middle;">
                  <img src="https://res.cloudinary.com/dgnjy0uy9/image/upload/v1774544281/relay/assets/relay-icon-email.png" alt="Relay" width="44" height="44" style="display:block; border-radius:12px;" />
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:22px; font-weight:700; color:#f0f0f0; letter-spacing:-0.3px;">Relay</span>
                </td>
              </tr>
            </table>

            <h1 class="hero-title" style="margin:0 0 8px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:32px; font-weight:700; color:#f0f0f0; line-height:1.15; letter-spacing:-0.5px;">
              Verify Your Email
            </h1>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:16px; color:#888; line-height:1.6;">
              Hi ${safeName}, enter this code to complete your registration.
            </p>
          </td>
        </tr>

        <!-- ── OTP CODE ── -->
        <tr>
          <td class="pad-sides" style="padding:0 48px 32px 48px;">
            <div style="background: linear-gradient(135deg, #1c1c1f 0%, #16161a 100%); border: 2px solid #c9a227; border-radius: 12px; padding: 32px; text-align: center;">
              <p style="margin:0 0 16px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#888; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">Your Verification Code</p>
              <div class="otp-box" style="font-family:'Courier New',Courier,monospace; font-size:48px; font-weight:700; color:#e6c775; letter-spacing:8px; margin:0; user-select:all; -webkit-user-select:all; -moz-user-select:all; -ms-user-select:all;">
                ${safeOTP}
              </div>
              <p style="margin:16px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.6;">
                This code expires in <strong style="color:#c9a227;">10 minutes</strong>
              </p>
            </div>
          </td>
        </tr>

        <!-- ── SECURITY WARNING ── -->
        <tr>
          <td class="pad-sides" style="padding:0 48px 32px 48px; border-bottom:1px solid #2a2a2d;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="border-left:3px solid #c9a227; padding-left:16px; vertical-align:top;">
                  <p style="margin:0 0 4px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11px; font-weight:700; color:#c9a227; letter-spacing:0.1em; text-transform:uppercase;">Security Notice</p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.65;">
                    Never share this code with anyone. Relay staff will never ask for your verification code.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── HELP TEXT ── -->
        <tr>
          <td class="pad-sides" style="padding:32px 48px; border-bottom:1px solid #2a2a2d;">
            <p style="margin:0 0 16px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; color:#aaa; line-height:1.6;">
              If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
            </p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; color:#666; line-height:1.6;">
              Need help? Reply to this email — we're here to assist.
            </p>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:24px 48px; background-color:#0d0d0f;">
            <p style="margin:0 0 8px 0; text-align:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; color:#444;">
              <a href="#" style="color:#666; text-decoration:none; margin:0 8px;">Help Center</a>
              <span style="color:#333;">&nbsp;&middot;&nbsp;</span>
              <a href="#" style="color:#666; text-decoration:none; margin:0 8px;">Privacy Policy</a>
            </p>
            <p style="margin:0; text-align:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11px; color:#333; line-height:1.6;">
              &copy; 2025 Relay &nbsp;&bull;&nbsp; Sent from <a href="mailto:noreply@iamrudra.tech" style="color:#444; text-decoration:none;">noreply@iamrudra.tech</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td>
  </tr>
</table>

</body>
</html>
  `;
}

export function createWelcomeEmailTemplate(name, clientURL) {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to Relay</title>
  <style type="text/css">
    body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0a0a0b; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; box-sizing: border-box; }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .hero-title { font-size: 32px !important; line-height: 1.2 !important; }
      .pad-sides { padding-left: 24px !important; padding-right: 24px !important; }
      .feature-icon { display: none !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#0a0a0b; word-break:break-word;">

<!-- Preheader -->
<div style="display:none; font-size:1px; color:#0a0a0b; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  Welcome to Relay, ${safeName} — your conversations start now. ✨
</div>

<!-- Outer wrapper -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0a0a0b;">
  <tr>
    <td align="center" style="padding: 40px 16px;">

      <!-- Card -->
      <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600"
        style="width:600px; background-color:#111113; border-radius:16px; border:1px solid #2a2a2d; overflow:hidden;">

        <!-- ── GOLD TOP ACCENT BAR ── -->
        <tr>
          <td style="height:4px; background: linear-gradient(90deg, #b8860b 0%, #e6c775 50%, #b8860b 100%); font-size:0; line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── HEADER ── -->
        <tr>
          <td class="pad-sides" style="padding: 36px 48px 28px 48px;">

            <!-- Logo row -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Logo Icon -->
                <td style="padding-right:12px; vertical-align:middle;">
                  <img src="https://res.cloudinary.com/dgnjy0uy9/image/upload/v1774544281/relay/assets/relay-icon-email.png" alt="Relay" width="44" height="44" style="display:block; border-radius:12px;" />
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:22px; font-weight:700; color:#f0f0f0; letter-spacing:-0.3px;">Relay</span>
                </td>
              </tr>
            </table>

            <!-- Separator -->
            <div style="margin-top:28px; border-top:1px solid #2a2a2d;"></div>

            <!-- Hero headline -->
            <h1 class="hero-title" style="margin:28px 0 8px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:40px; font-weight:700; color:#f0f0f0; line-height:1.15; letter-spacing:-0.5px;">
              Welcome,<br>
              <span style="background: linear-gradient(90deg, #e6c775, #b8860b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">${safeName}.</span>
            </h1>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:16px; color:#888; line-height:1.6;">
              You're officially part of Relay. Your first conversation is just a click away.
            </p>

          </td>
        </tr>

        <!-- ── BODY COPY ── -->
        <tr>
          <td class="pad-sides" style="padding:0 48px 32px 48px; border-bottom:1px solid #2a2a2d;">
            <p style="margin:0 0 16px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; color:#aaa; line-height:1.75;">
              Every great conversation starts somewhere. Relay gives you the space to talk, share, and connect — without the noise.
            </p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; color:#aaa; line-height:1.75;">
              We've been building this for people who believe the medium shapes the message. We're glad you found us.
            </p>
          </td>
        </tr>

        <!-- ── FEATURES ── -->
        <tr>
          <td class="pad-sides" style="padding:32px 48px; border-bottom:1px solid #2a2a2d;">

            <!-- Feature 1 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
              <tr>
                <td class="feature-icon" style="width:44px; vertical-align:top; padding-right:16px;">
                  <div style="width:36px; height:36px; background:#1c1c1f; border:1px solid #2a2a2d; border-radius:8px; text-align:center; line-height:36px; font-size:17px;">⚡</div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:#f0f0f0;">Lightning Fast Delivery</p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.6;">Messages sent are messages received — instantly, always.</p>
                </td>
              </tr>
            </table>

            <!-- Feature 2 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
              <tr>
                <td class="feature-icon" style="width:44px; vertical-align:top; padding-right:16px;">
                  <div style="width:36px; height:36px; background:#1c1c1f; border:1px solid #2a2a2d; border-radius:8px; text-align:center; line-height:36px; font-size:17px;">🛡️</div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:#f0f0f0;">Private by Design</p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.6;">End-to-end encryption. Your conversations belong to you.</p>
                </td>
              </tr>
            </table>

            <!-- Feature 3 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="feature-icon" style="width:44px; vertical-align:top; padding-right:16px;">
                  <div style="width:36px; height:36px; background:#1c1c1f; border:1px solid #2a2a2d; border-radius:8px; text-align:center; line-height:36px; font-size:17px;">🌐</div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:#f0f0f0;">Free Forever</p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.6;">No paywalls, no premium tiers. Full features for every user.</p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── CTA ── -->
        <tr>
          <td class="pad-sides" style="padding:36px 48px; background-color:#16161a; border-bottom:1px solid #2a2a2d;">
            <p style="margin:0 0 24px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:18px; font-weight:600; color:#f0f0f0; line-height:1.4;">
              Your first conversation is one click away.
            </p>
            <!-- CTA Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px; background: linear-gradient(135deg, #c9a227 0%, #e6c775 100%);">
                  <a href="${clientURL}" style="display:inline-block; padding:14px 36px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; font-weight:700; color:#0a0a0b; text-decoration:none; border-radius:10px; letter-spacing:0.2px;">
                    Open Relay &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── TIP ── -->
        <tr>
          <td class="pad-sides" style="padding:28px 48px; border-bottom:1px solid #2a2a2d;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="border-left:3px solid #c9a227; padding-left:16px; vertical-align:top;">
                  <p style="margin:0 0 4px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11px; font-weight:700; color:#c9a227; letter-spacing:0.1em; text-transform:uppercase;">Pro Tip</p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; color:#666; line-height:1.65;">
                    Add a profile photo and set a display name so your contacts recognize you instantly when you reach out for the first time.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── SIGN-OFF ── -->
        <tr>
          <td class="pad-sides" style="padding:32px 48px; border-bottom:1px solid #2a2a2d;">
            <p style="margin:0 0 4px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; color:#666; line-height:1.6;">Need a hand? Reply to this email — we're real people who read every message.</p>
            <p style="margin:20px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; color:#aaa;">
              Warmly,<br>
              <strong style="color:#f0f0f0;">The Relay Team</strong>
            </p>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:24px 48px; background-color:#0d0d0f;">
            <p style="margin:0 0 8px 0; text-align:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; color:#444;">
              <a href="#" style="color:#666; text-decoration:none; margin:0 8px;">Help Center</a>
              <span style="color:#333;">&nbsp;&middot;&nbsp;</span>
              <a href="#" style="color:#666; text-decoration:none; margin:0 8px;">Privacy Policy</a>
              <span style="color:#333;">&nbsp;&middot;&nbsp;</span>
              <a href="#" style="color:#666; text-decoration:none; margin:0 8px;">Unsubscribe</a>
            </p>
            <p style="margin:0; text-align:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11px; color:#333; line-height:1.6;">
              &copy; 2025 Relay &nbsp;&bull;&nbsp; Sent from <a href="mailto:noreply@iamrudra.tech" style="color:#444; text-decoration:none;">noreply@iamrudra.tech</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td>
  </tr>
</table>

</body>
</html>
  `;
}