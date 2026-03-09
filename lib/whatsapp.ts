/**
 * WhatsApp Notification Service
 * Sends messages via WhatsApp using Meta WhatsApp Cloud API
 */

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., 919820590353)
  message: string;
}

/**
 * Send WhatsApp message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const whatsappToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!whatsappToken || !phoneNumberId) {
      console.warn(
        "[WhatsApp] Meta Cloud API credentials not configured. Skipping WhatsApp notification."
      );
      return false;
    }

    // Format phone number (ensure it starts with country code, no +)
    const formattedPhone = to.replace(/^\+/, "");

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: message,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[WhatsApp] Failed to send message:", errorData);
      return false;
    }

    const data = await response.json();
    console.log("[WhatsApp] Message sent successfully.", data);
    return true;
  } catch (error: any) {
    console.error("[WhatsApp] Failed to send message:", error.message || error);
    return false;
  }
}

/**
 * Send enquiry submission to WhatsApp
 */
export async function sendEnquiryToWhatsApp(
  recipientPhone: string,
  enquiryData: {
    name: string;
    email: string;
    phone: string;
    property: string;
    message?: string;
    iWantTo?: string;
    propertyType?: string;
    bedrooms?: string;
    bathrooms?: string;
    expectedPrice?: string;
    rent?: string;
    propertyLocation?: string;
  }
): Promise<boolean> {
  try {
    const messageText = formatEnquiryMessage(enquiryData);
    return await sendWhatsAppMessage(recipientPhone, messageText);
  } catch (error) {
    console.error("[WhatsApp] Error sending enquiry:", error);
    return false;
  }
}

/**
 * Format enquiry data into a readable WhatsApp message
 */
function formatEnquiryMessage(enquiryData: {
  name: string;
  email: string;
  phone: string;
  property: string;
  message?: string;
  iWantTo?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  expectedPrice?: string;
  rent?: string;
  propertyLocation?: string;
}): string {
  const lines = [
    "📋 *NEW PROPERTY ENQUIRY*",
    "",
    `👤 *Name:* ${enquiryData.name}`,
    `📧 *Email:* ${enquiryData.email}`,
    `📱 *Phone:* ${enquiryData.phone}`,
    `🏠 *Property:* ${enquiryData.property}`,
  ];

  if (enquiryData.propertyLocation) {
    lines.push(`📍 *Location:* ${enquiryData.propertyLocation}`);
  }

  if (enquiryData.iWantTo) {
    lines.push(`🔄 *Want To:* ${enquiryData.iWantTo}`);
  }

  if (enquiryData.propertyType) {
    lines.push(`🏢 *Property Type:* ${enquiryData.propertyType}`);
  }

  if (enquiryData.bedrooms) {
    lines.push(`🛏️ *Bedrooms:* ${enquiryData.bedrooms}`);
  }

  if (enquiryData.bathrooms) {
    lines.push(`🚿 *Bathrooms:* ${enquiryData.bathrooms}`);
  }

  if (enquiryData.expectedPrice) {
    lines.push(`💰 *Expected Price:* ${enquiryData.expectedPrice}`);
  }

  if (enquiryData.rent) {
    lines.push(`💵 *Rent:* ${enquiryData.rent}`);
  }

  if (enquiryData.message) {
    lines.push("");
    lines.push(`💬 *Message:*`);
    lines.push(enquiryData.message);
  }

  lines.push("");
  lines.push("---");
  lines.push("_Sent from EstateBANK.in_");

  return lines.join("\n");
}

/**
 * Send WhatsApp to multiple phone numbers
 */
export async function sendEnquiryToMultiplePhones(
  phoneNumbers: string[],
  enquiryData: any
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const phone of phoneNumbers) {
    const success = await sendEnquiryToWhatsApp(phone, enquiryData);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
