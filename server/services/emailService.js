const nodemailer = require("nodemailer");

let transporter = null;

// Initialize transporter
const initTransporter = async () => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      console.log("✅ Email transporter ready - Using Gmail");
      return true;
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("✅ Email transporter ready - Using Ethereal (testing)");
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to initialize email:", error.message);
    return false;
  }
};

// Get status style
const getStatusStyle = (status) => {
  const styles = {
    pending: { color: "#F59E0B", bg: "#FEF3C7", icon: "⏳", text: "Pending" },
    processing: {
      color: "#3B82F6",
      bg: "#DBEAFE",
      icon: "🔄",
      text: "Processing",
    },
    shipped: { color: "#8B5CF6", bg: "#EDE9FE", icon: "🚚", text: "Shipped" },
    delivered: {
      color: "#10B981",
      bg: "#D1FAE5",
      icon: "✅",
      text: "Delivered",
    },
    cancelled: {
      color: "#EF4444",
      bg: "#FEE2E2",
      icon: "❌",
      text: "Cancelled",
    },
  };
  return styles[status] || styles.pending;
};

// Status messages
function getStatusMessage(status) {
  const messages = {
    pending:
      "Your order has been received and is pending confirmation. We'll notify you once it's processed.",
    processing:
      "Your order is now being processed. Our team is preparing your items for shipment.",
    shipped:
      "Great news! Your order has been shipped and is on its way to you.",
    delivered:
      "Your order has been successfully delivered! We hope you enjoy your purchase.",
    cancelled:
      "Your order has been cancelled. If you have any questions, please contact our support team.",
  };
  return messages[status] || "Your order status has been updated.";
}

// Send order status email
const sendOrderStatusEmail = async (order, newStatus) => {
  try {
    if (!transporter) {
      const initialized = await initTransporter();
      if (!initialized) {
        throw new Error("Could not initialize email transporter");
      }
    }

    const orderIdString = order._id.toString();
    const orderIdShort = orderIdString.slice(-8);
    const statusStyle = getStatusStyle(newStatus);

    console.log(`\n📧 Sending email...`);
    console.log(`   To: ${order.user.email}`);
    console.log(`   Status: ${newStatus}`);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update - #${orderIdShort}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .responsive-padding { padding: 15px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:#f2f2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:25px; text-align:center; background:#ffffff; border-bottom:2px solid #f0f0f0;">
              <h2 style="margin:0; font-size:22px; color:#333; font-weight:600;">📦 Order Status Update</h2>
              <p style="margin:8px 0 0; color:#888; font-size:14px;">
                Your order has been updated
              </p>
              <div style="display:inline-block; margin-top:15px; padding:5px 15px; background:${statusStyle.bg}; color:${statusStyle.color}; border-radius:20px; font-size:12px; font-weight:600;">
                ${statusStyle.icon} ${statusStyle.text}
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:25px 25px 0;">
              <p style="margin:0; font-size:15px; color:#333;">
                Dear <strong style="color:#555;">${order.user.name}</strong>,
              </p>
              <p style="margin:12px 0 0; font-size:14px; color:#666; line-height:1.5;">
                ${getStatusMessage(newStatus)}
              </p>
            </td>
          </tr>

          <!-- Order Info Card -->
          <tr>
            <td style="padding:20px 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa; border-radius:8px; border:1px solid #eee;">
                <tr>
                  <td style="padding:15px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td width="40%" style="color:#888; font-size:13px; font-weight:500;">Order ID:</td>
                        <td width="60%" style="color:#333; font-weight:600; font-size:14px;">#${orderIdShort}</td>
                      </tr>
                      <tr style="border-top:1px solid #eee;">
                        <td style="color:#888; font-size:13px; font-weight:500; padding-top:8px;">Status:</td>
                        <td style="color:${statusStyle.color}; font-weight:600; font-size:14px; padding-top:8px;">${statusStyle.icon} ${statusStyle.text}</td>
                      </tr>
                      <tr style="border-top:1px solid #eee;">
                        <td style="color:#888; font-size:13px; font-weight:500; padding-top:8px;">Order Date:</td>
                        <td style="color:#333; font-size:14px; padding-top:8px;">${new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              
            </td>
          </tr>

          <!-- Items Section -->
          <tr>
            <td style="padding:0 25px;">
              <h3 style="margin:0 0 15px; font-size:16px; color:#333; font-weight:600;">🛍️ Items Ordered</h3>
              <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee; border-radius:8px;">
                <thead>
                  <tr style="background:#f9f9f9; border-bottom:1px solid #eee;">
                    <th align="left" style="font-size:13px; color:#888; font-weight:600;">Product</th>
                    <th align="center" style="font-size:13px; color:#888; font-weight:600;">Qty</th>
                    <th align="right" style="font-size:13px; color:#888; font-weight:600;">Price</th>
                    <th align="right" style="font-size:13px; color:#888; font-weight:600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items
                    .map(
                      (item) => `
                  <tr style="border-bottom:1px solid #eee;">
                    <td align="left" style="font-size:14px; color:#555; padding:10px;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        ${item.image ? `<img src="${item.image}" style="width:35px; height:35px; border-radius:6px; object-fit:cover;" />` : ""}
                        <span>${item.name}</span>
                      </div>
                    </td>
                    <td align="center" style="font-size:14px; color:#555;">${item.quantity}</td>
                    <td align="right" style="font-size:14px; color:#555;">Rs ${item.price.toFixed(2)}</td>
                    <td align="right" style="font-size:14px; font-weight:500; color:#333;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price Breakdown -->
          <tr>
            <td style="padding:20px 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa; border-radius:8px;">
                <tr>
                  <td style="padding:15px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color:#888; font-size:13px;">Subtotal</td>
                        <td align="right" style="color:#555; font-size:13px;">Rs ${order.pricing.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top:1px solid #eee;">
                        <td style="color:#888; font-size:13px;">Delivery Charge</td>
                        <td align="right" style="color:#555; font-size:13px;">Rs ${order.pricing.deliveryCharge.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top:1px solid #eee;">
                        <td style="color:#888; font-size:13px;">COD Charge (1%)</td>
                        <td align="right" style="color:#555; font-size:13px;">Rs ${order.pricing.codCharge.toFixed(2)}</td>
                      </tr>
                      <tr style="border-top:2px solid #ddd;">
                        <td style="padding-top:10px;"><strong style="font-size:15px; color:#333;">Grand Total</strong></td>
                        <td align="right" style="padding-top:10px;"><strong style="font-size:18px; color:#28a745;">Rs ${order.pricing.grandTotal.toFixed(2)}</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding:0 25px 20px;">
              <h3 style="margin:0 0 12px; font-size:16px; color:#333; font-weight:600;">📍 Shipping Address</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa; border-radius:8px;">
                <tr>
                  <td style="padding:15px;">
                    <p style="margin:0 0 5px; font-size:14px; color:#555;"><strong>${order.user.name}</strong></p>
                    <p style="margin:0 0 5px; font-size:14px; color:#666;">${order.customer.address}</p>
                    <p style="margin:0; font-size:14px; color:#666;">📞 ${order.customer.phone}</p>
                    <p style="margin:8px 0 0; font-size:13px; color:#888;">📧 ${order.user.email}</p>
                  </td>
                </tr>
              
            </td>
          </tr>

          <!-- Track Button -->
          <tr>
            <td style="padding:0 25px 25px; text-align:center;">
              <a href="http://localhost:5173/orders" style="display:inline-block; background:#4CAF50; color:#ffffff; text-decoration:none; padding:10px 30px; border-radius:6px; font-weight:500; font-size:14px;">
                🔍 Track Your Order
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:12px; color:#999; border-top:1px solid #eee; background:#fafafa;">
              <p style="margin:0 0 8px;">Need help? <a href="mailto:support@yourstore.com" style="color:#4CAF50; text-decoration:none;">support@yourstore.com</a></p>
              <p style="margin:0;">© 2024 My Daraz Store. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
        `;

    const mailOptions = {
      from: `"My Daraz Store" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: `✨ Order #${orderIdShort} Status Update: ${newStatus.toUpperCase()}`,
      html: emailHtml,
      text: `Your order #${orderIdShort} status has been updated to: ${newStatus}. View your order details online.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error(`❌ Email failed:`, error.message);
    return false;
  }
};

module.exports = { sendOrderStatusEmail, initTransporter };
