/**
 * Sends transactional email via Brevo API or logs to console as fallback.
 * @param {Object} options - { email, subject, message, html }
 */
export const sendEmail = async ({ email, subject, message, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER || "noreply@realestateplatform.com";

  if (!apiKey) {
    console.log("-----------------------------------------");
    console.log(`[EMAIL DISPATCH (Local Fallback)]`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${message || html}`);
    console.log("-----------------------------------------");
    return { success: true, mocked: true };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "Real Estate Platform", email: senderEmail },
      to: [{ email }],
      subject,
      htmlContent: html || message,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send email via Brevo");
  }

  return response.json();
};