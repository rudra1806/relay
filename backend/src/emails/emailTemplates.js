export function createWelcomeEmailTemplate(name, clientURL) {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to Relay</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    body, table, td, p, a { font-family: Georgia, 'Times New Roman', serif !important; }
    .mso-btn a { mso-line-height-rule: exactly; }
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset */
    body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; }

    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .stack-col { display: block !important; width: 100% !important; }
      .pad-sides { padding-left: 24px !important; padding-right: 24px !important; }
      .hero-title { font-size: 36px !important; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#F5F0E8; word-break:break-word;">

<!-- ==================== PREHEADER ==================== -->
<div style="display:none; font-size:1px; color:#F5F0E8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
  You're in. Welcome to Relay — where every conversation counts.
</div>

<!-- ==================== EMAIL WRAPPER ==================== -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F5F0E8;">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- ==================== MAIN CARD ==================== -->
      <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; background-color:#FDFAF4; border:2px solid #1A1A1A;">

        <!-- ======= TOP ACCENT BAR ======= -->
        <tr>
          <td style="background-color:#1A1A1A; padding:0; height:6px; font-size:0; line-height:0;">&nbsp;</td>
        </tr>

        <!-- ======= HEADER / MASTHEAD ======= -->
        <tr>
          <td style="padding:40px 48px 32px 48px; border-bottom:1px solid #1A1A1A;" class="pad-sides">

            <!-- Top row: logo + issue label -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <!-- Wordmark -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:#1A1A1A; padding:8px 18px;">
                        <span style="font-family:Georgia,'Times New Roman',serif; font-size:22px; font-weight:700; color:#F5F0E8; letter-spacing:0.12em; text-transform:uppercase;">RELAY</span>
                      </td>
                      <td style="width:12px;"></td>
                      <td style="vertical-align:middle;">
                        <span style="font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#888; letter-spacing:0.08em; text-transform:uppercase;">Est. 2025</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;" class="hide-mobile">
                  <span style="font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#888; letter-spacing:0.06em; text-transform:uppercase; border:1px solid #ccc; padding:5px 10px;">Welcome Edition</span>
                </td>
              </tr>
            </table>

            <!-- Divider rule -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px;">
              <tr>
                <td style="border-top:3px double #1A1A1A; font-size:0; line-height:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Hero headline -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px;">
              <tr>
                <td>
                  <p style="margin:0 0 6px 0; font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#C0392B; letter-spacing:0.14em; text-transform:uppercase; font-weight:700;">You're in.</p>
                  <h1 class="hero-title" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:48px; font-weight:700; color:#1A1A1A; line-height:1.1; letter-spacing:-0.02em;">
                    Welcome,<br>${name}.
                  </h1>
                </td>
                <!-- Decorative number column -->
                <td align="right" style="vertical-align:bottom; padding-bottom:4px;" class="hide-mobile">
                  <span style="font-family:Georgia,'Times New Roman',serif; font-size:100px; font-weight:700; color:#EADFC8; line-height:1;">#1</span>
                </td>
              </tr>
            </table>

            <!-- Subhead -->
            <p style="margin:16px 0 0 0; font-family:Georgia,'Times New Roman',serif; font-size:17px; color:#555; line-height:1.6; max-width:460px; font-style:italic;">
              Real-time conversations, built for people who care about how they communicate.
            </p>

          </td>
        </tr>

        <!-- ======= INTRO BODY COPY ======= -->
        <tr>
          <td style="padding:36px 48px 0 48px; border-bottom:1px solid #D9D4C7;" class="pad-sides">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <!-- Main copy -->
                <td style="vertical-align:top; padding-right:32px; width:68%;" class="stack-col">
                  <p style="margin:0 0 16px 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#333; line-height:1.75;">
                    Every great conversation starts somewhere. Yours starts here. Relay gives you the space to talk, share, and connect — without the noise.
                  </p>
                  <p style="margin:0 0 32px 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#333; line-height:1.75;">
                    We've been building this for people who believe the medium shapes the message. We're glad you found us.
                  </p>
                </td>

                <!-- Pull quote sidebar -->
                <td style="vertical-align:top; border-left:3px solid #C0392B; padding-left:20px; width:32%;" class="stack-col">
                  <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:19px; color:#1A1A1A; line-height:1.4; font-style:italic;">
                    "The right message, to the right person, at the right time."
                  </p>
                  <p style="margin:10px 0 0 0; font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#888; letter-spacing:0.08em; text-transform:uppercase;">— The Relay Promise</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ======= FEATURE STRIPS ======= -->
        <tr>
          <td style="padding:0 48px; border-bottom:1px solid #D9D4C7;" class="pad-sides">

            <!-- Feature 1 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:1px solid #EAE6DD;">
              <tr>
                <td style="width:48px; padding:24px 16px 24px 0; vertical-align:top;">
                  <div style="font-family:Georgia,'Times New Roman',serif; font-size:24px; font-weight:700; color:#C0392B; line-height:1;">01</div>
                </td>
                <td style="padding:24px 0; vertical-align:top; border-left:1px solid #D9D4C7;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-left:20px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 4px 0; font-family:Georgia,'Times New Roman',serif; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:#1A1A1A; font-weight:700;">Lightning Fast Delivery</p>
                        <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:14px; color:#666; line-height:1.6;">Messages sent are messages received — instantly, always.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Feature 2 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:1px solid #EAE6DD;">
              <tr>
                <td style="width:48px; padding:24px 16px 24px 0; vertical-align:top;">
                  <div style="font-family:Georgia,'Times New Roman',serif; font-size:24px; font-weight:700; color:#C0392B; line-height:1;">02</div>
                </td>
                <td style="padding:24px 0; vertical-align:top; border-left:1px solid #D9D4C7;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-left:20px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 4px 0; font-family:Georgia,'Times New Roman',serif; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:#1A1A1A; font-weight:700;">Private by Design</p>
                        <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:14px; color:#666; line-height:1.6;">End-to-end encryption. Your conversations belong to you.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Feature 3 -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width:48px; padding:24px 16px 24px 0; vertical-align:top;">
                  <div style="font-family:Georgia,'Times New Roman',serif; font-size:24px; font-weight:700; color:#C0392B; line-height:1;">03</div>
                </td>
                <td style="padding:24px 0; vertical-align:top; border-left:1px solid #D9D4C7;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-left:20px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 4px 0; font-family:Georgia,'Times New Roman',serif; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:#1A1A1A; font-weight:700;">Rich Media, Zero Friction</p>
                        <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:14px; color:#666; line-height:1.6;">Photos, files, videos — share anything without a second thought.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ======= CTA SECTION ======= -->
        <tr>
          <td style="padding:40px 48px; background-color:#1A1A1A;" class="pad-sides">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle; padding-right:24px;" class="stack-col">
                  <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:20px; color:#FDFAF4; line-height:1.4; font-weight:700;">Your first conversation is one click away.</p>
                </td>
                <td align="right" style="vertical-align:middle; white-space:nowrap;" class="stack-col">
                  <!-- CTA Button: solid color for Gmail compatibility -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mso-btn">
                    <tr>
                      <td style="background-color:#C0392B; padding:14px 32px;">
                        <a href="${clientURL}" style="font-family:Georgia,'Times New Roman',serif; font-size:14px; font-weight:700; color:#FDFAF4; text-decoration:none; letter-spacing:0.1em; text-transform:uppercase; display:block; white-space:nowrap;">Open Relay &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ======= TIP ======= -->
        <tr>
          <td style="padding:28px 48px; background-color:#FDFAF4; border-top:1px solid #D9D4C7; border-bottom:1px solid #D9D4C7;" class="pad-sides">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top; width:24px; padding-right:12px;">
                  <span style="font-family:Georgia,'Times New Roman',serif; font-size:13px; color:#C0392B; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Tip</span>
                </td>
                <td style="border-left:2px solid #C0392B; padding-left:14px; vertical-align:top;">
                  <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:13px; color:#555; line-height:1.65;">
                    Add a profile photo and set a display name so your contacts recognize you instantly when you reach out for the first time.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ======= SIGN-OFF ======= -->
        <tr>
          <td style="padding:36px 48px 40px 48px;" class="pad-sides">
            <p style="margin:0 0 4px 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#333; line-height:1.6;">Need a hand? Reply to this email — we're real people who read every message.</p>
            <p style="margin:24px 0 0 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#1A1A1A;">
              Warmly,<br>
              <strong>The Relay Team</strong>
            </p>
          </td>
        </tr>

        <!-- ======= BOTTOM ACCENT BAR ======= -->
        <tr>
          <td style="background-color:#C0392B; padding:0; height:4px; font-size:0; line-height:0;">&nbsp;</td>
        </tr>

        <!-- ======= FOOTER ======= -->
        <tr>
          <td style="background-color:#1A1A1A; padding:24px 48px;" class="pad-sides">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="center">
                  <p style="margin:0 0 12px 0; font-family:Georgia,'Times New Roman',serif; font-size:12px; color:#888;">
                    <a href="#" style="color:#EADFC8; text-decoration:none; margin:0 8px; letter-spacing:0.04em;">Help Center</a>
                    <span style="color:#444;">&nbsp;&middot;&nbsp;</span>
                    <a href="#" style="color:#EADFC8; text-decoration:none; margin:0 8px; letter-spacing:0.04em;">Privacy Policy</a>
                    <span style="color:#444;">&nbsp;&middot;&nbsp;</span>
                    <a href="#" style="color:#EADFC8; text-decoration:none; margin:0 8px; letter-spacing:0.04em;">Unsubscribe</a>
                  </p>
                  <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#555; line-height:1.6; letter-spacing:0.04em;">
                    &copy; 2025 Relay Inc. &nbsp;&bull;&nbsp; You're receiving this because you signed up.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <!-- /MAIN CARD -->

    </td>
  </tr>
</table>
<!-- /EMAIL WRAPPER -->

</body>
</html>
  `;
}