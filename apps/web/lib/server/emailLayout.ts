import { SITE_NAME, SITE_URL } from "../site";
import { escapeHtml } from "./mailer";

/**
 * A responsive HTML email shell. Built from tables with inline styles so it
 * renders in Outlook and Gmail; the <style> block only adds the phone-width
 * tweaks for clients that support media queries.
 */

const BRAND = "#00539c";
const BRAND_DARK = "#003e75";
const ACCENT = "#ec4899";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const FONT = "'Poppins', 'Segoe UI', Helvetica, Arial, sans-serif";

export interface EmailButton {
  label: string;
  href: string;
}

export interface EmailLayoutOptions {
  /** Shown in the inbox list after the subject; hidden in the email itself */
  preheader: string;
  title: string;
  subtitle?: string;
  /** Trusted HTML for the main text; escape anything user supplied */
  bodyHtml: string;
  button?: EmailButton;
  /** Trusted HTML shown under the button in smaller text */
  footnoteHtml?: string;
  /** Trusted HTML for the grey footer, under the copyright line */
  footerHtml?: string;
}

export function paragraph(html: string): string {
  return `<p style="margin: 0 0 16px 0; font-family: ${FONT}; font-size: 16px; line-height: 26px; color: ${TEXT};">${html}</p>`;
}

export function emailLayout(options: EmailLayoutOptions): string {
  const { preheader, title, subtitle, bodyHtml, button, footnoteHtml, footerHtml } = options;
  const year = new Date().getFullYear();

  const buttonHtml = button
    ? `
            <tr>
              <td align="center" style="padding: 8px 0 24px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="button-table">
                  <tr>
                    <td align="center" bgcolor="${ACCENT}" style="border-radius: 10px;">
                      <a href="${escapeHtml(button.href)}" target="_blank" class="button-link"
                         style="display: inline-block; padding: 15px 36px; font-family: ${FONT}; font-size: 16px; font-weight: 600; line-height: 20px; color: #ffffff; text-decoration: none; border-radius: 10px;">
                        ${escapeHtml(button.label)}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
    : "";

  const footnote = footnoteHtml
    ? `
            <tr>
              <td style="padding: 16px 0 0 0; border-top: 1px solid #e5e7eb; font-family: ${FONT}; font-size: 13px; line-height: 20px; color: ${MUTED};">
                ${footnoteHtml}
              </td>
            </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; }
    a { color: ${BRAND}; }
    @media only screen and (max-width: 620px) {
      .outer-pad { padding: 12px !important; }
      .header-pad { padding: 32px 20px !important; }
      .content-pad { padding: 28px 20px !important; }
      .title { font-size: 24px !important; line-height: 32px !important; }
      .button-table { width: 100% !important; }
      .button-link { display: block !important; padding: 16px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #eef2f7;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #eef2f7;">
    ${escapeHtml(preheader)}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eef2f7;">
    <tr>
      <td align="center" class="outer-pad" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td align="center" class="header-pad" bgcolor="${BRAND}"
                style="padding: 40px 32px; background-color: ${BRAND}; background-image: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);">
              <img src="${SITE_URL}/swapnilsrivastava_logo_Letter_S.png" width="56" height="56" alt="${escapeHtml(SITE_NAME)}"
                   style="display: block; margin: 0 auto 16px auto; width: 56px; height: 56px; border: 0; border-radius: 14px; font-family: ${FONT}; font-size: 14px; color: #ffffff;">
              <h1 class="title" style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 36px; font-weight: 700; color: #ffffff;">
                ${escapeHtml(title)}
              </h1>
              ${
                subtitle
                  ? `<p style="margin: 8px 0 0 0; font-family: ${FONT}; font-size: 16px; line-height: 24px; color: #bfd4e6;">${escapeHtml(subtitle)}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td class="content-pad" style="padding: 36px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>${bodyHtml}</td>
                </tr>${buttonHtml}${footnote}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: #9ca3af;">
              ${footerHtml ? `${footerHtml}<br>` : ""}
              &copy; ${year} <a href="${SITE_URL}" style="color: #9ca3af; text-decoration: underline;">${escapeHtml(SITE_NAME)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
