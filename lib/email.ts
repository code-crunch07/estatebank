import nodemailer from 'nodemailer';

// Brevo SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER || process.env.BREVO_API_KEY,
      pass: process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_SMTP_KEY,
    },
  });
};

// Email Templates
export const emailTemplates = {
  contactForm: (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
    property?: string;
  }) => ({
    subject: `New Contact Form Submission - ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e40af; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${data.phone}</div>
              </div>
              ${data.property ? `
              <div class="field">
                <div class="label">Property Interest:</div>
                <div class="value">${data.property}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from EstateBANK.in contact form.</p>
              <p>Please respond to: ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
${data.property ? `Property Interest: ${data.property}\n` : ''}
Message:
${data.message}

---
This email was sent from EstateBANK.in contact form.
Please respond to: ${data.email}
    `,
  }),

  propertyEnquiry: (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
    propertyName: string;
    propertyLocation?: string;
    propertyPrice?: string;
  }) => ({
    subject: `New Property Enquiry - ${data.propertyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .property-info { background: #ecfdf5; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #059669; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #059669; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Property Enquiry</h1>
            </div>
            <div class="content">
              <div class="property-info">
                <h2 style="margin: 0 0 10px 0; color: #059669;">${data.propertyName}</h2>
                ${data.propertyLocation ? `<p style="margin: 5px 0; color: #666;">📍 ${data.propertyLocation}</p>` : ''}
                ${data.propertyPrice ? `<p style="margin: 5px 0; color: #059669; font-weight: bold;">💰 ${data.propertyPrice}</p>` : ''}
              </div>
              <div class="field">
                <div class="label">Contact Name:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${data.phone}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This enquiry was submitted from EstateBANK.in property details page.</p>
              <p>Please respond to: ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Property Enquiry

Property: ${data.propertyName}
${data.propertyLocation ? `Location: ${data.propertyLocation}\n` : ''}
${data.propertyPrice ? `Price: ${data.propertyPrice}\n` : ''}

Contact Details:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Message:
${data.message}

---
This enquiry was submitted from EstateBANK.in property details page.
Please respond to: ${data.email}
    `,
  }),

  enquiryConfirmation: (data: {
    name: string;
    email: string;
    propertyName?: string;
  }) => ({
    subject: 'Thank you for your enquiry - EstateBANK.in',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 30px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You, ${data.name}!</h1>
            </div>
            <div class="content">
              <p>We have received your enquiry${data.propertyName ? ` regarding <strong>${data.propertyName}</strong>` : ''}.</p>
              <p>Our team will get back to you within 12 minutes during working hours.</p>
              <p>If you have any urgent questions, please feel free to contact us:</p>
              <ul>
                <li>📞 Phone: +91 9820590353</li>
                <li>📱 WhatsApp: +91 8080808081</li>
                <li>📧 Email: pankaj.realdeals@gmail.com</li>
              </ul>
            </div>
            <div class="footer">
              <p>EstateBANK.in - Your Trusted Real Estate Partner Since 2004</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Thank You, ${data.name}!

We have received your enquiry${data.propertyName ? ` regarding ${data.propertyName}` : ''}.

Our team will get back to you within 12 minutes during working hours.

If you have any urgent questions, please feel free to contact us:
Phone: +91 9820590353
WhatsApp: +91 8080808081
Email: pankaj.realdeals@gmail.com

---
EstateBANK.in - Your Trusted Real Estate Partner Since 2004
    `,
  }),
};

// Send Email Function
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    if (!process.env.BREVO_SMTP_USER && !process.env.BREVO_API_KEY) {
      throw new Error('Brevo SMTP credentials not configured');
    }

    const transporter = createTransporter();
    const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER || 'noreply@estatebank.in';
    const fromName = process.env.BREVO_FROM_NAME || 'EstateBANK.in';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: options.replyTo || options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Convenience Functions
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  property?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'pankaj.realdeals@gmail.com';
  const template = emailTemplates.contactForm(data);

  // Send to admin
  await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: data.email,
  });

  // Send confirmation to user
  const confirmation = emailTemplates.enquiryConfirmation({
    name: data.name,
    email: data.email,
  });
  await sendEmail({
    to: data.email,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  });

  return { success: true };
}

export async function sendPropertyEnquiryEmail(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyName: string;
  propertyLocation?: string;
  propertyPrice?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'pankaj.realdeals@gmail.com';
  const template = emailTemplates.propertyEnquiry(data);

  // Send to admin
  await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: data.email,
  });

  // Send confirmation to user
  const confirmation = emailTemplates.enquiryConfirmation({
    name: data.name,
    email: data.email,
    propertyName: data.propertyName,
  });
  await sendEmail({
    to: data.email,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  });

  return { success: true };
}


