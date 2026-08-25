const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const logger = require('firebase-functions/logger')
const sgMail = require('@sendgrid/mail')

const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

const WEBAPP_EMAIL = 'webapp@arewasuyaspot.ca'
const ORDERS_EMAIL = 'orders@arewasuyaspot.ca'

exports.sendOrderEmail = onCall(
  { secrets: [sendgridApiKey] },
  async (request) => {
    const { order } = request.data

    if (!order || !order.items || !order.customer) {
      throw new HttpsError('invalid-argument', 'Missing order data')
    }

    sgMail.setApiKey(sendgridApiKey.value())

    // Build items rows for the email
    const itemRows = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc;">${item.emoji} ${item.name}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc; text-align: center;">×${item.quantity}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc; text-align: right;">$${item.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join('')

    // Format order date nicely (e.g. "Saturday, Aug 23, 2026")
    function formatOrderDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(`${dateStr}T00:00:00`)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
      })
    }

    const scheduledDate = formatOrderDate(order.orderDate)
    const isDelivery = order.deliveryMethod === 'delivery'
    const locationLabel = isDelivery ? 'Delivery Address' : 'Pickup Location'
    const locationValue = isDelivery ? (order.address || '') : (order.pickupAddress || '')

    const html = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #4a2a0a;">
        <div style="background: #4a2a0a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #f2ebe0; margin: 0; font-size: 22px;">☕ New Order — Arewa Suya</h1>
        </div>

        <div style="background: #faf5ee; padding: 24px 32px; border: 1px solid #e2d0bc; border-top: none;">
          ${order.orderNumber ? `<p style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #7b4a1e;">Order #${order.orderNumber}</p>` : ''}
          <h2 style="margin: 0 0 4px; font-size: 16px; color: #7b4a1e;">Customer</h2>
          <p style="margin: 0 0 20px; color: #7b5535;">
            <strong>${order.customer.name}</strong><br/>
            ${order.customer.email || ''}${order.customer.phone ? `<br/>${order.customer.phone}` : ''}
            <br/><strong>Order type:</strong> ${isDelivery ? '🚗 Delivery' : '🏪 Pickup'}
            ${scheduledDate ? `<br/><strong>${isDelivery ? 'Delivery' : 'Pickup'} date:</strong> ${scheduledDate}` : ''}
            ${order.orderTime ? `<br/><strong>${isDelivery ? 'Delivery' : 'Pickup'} time:</strong> ${order.orderTime}` : ''}
            ${locationValue ? `<br/><strong>${locationLabel}:</strong> ${locationValue}` : ''}
          </p>

          <h2 style="margin: 0 0 12px; font-size: 16px; color: #7b4a1e;">Order</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="font-size: 12px; text-transform: uppercase; color: #b8956a; letter-spacing: 0.05em;">
                <th style="text-align: left; padding-bottom: 8px;">Item</th>
                <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Subtotal</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Tax (12%)</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.tax.toFixed(2)}</td>
            </tr>
            ${order.deliveryFee ? `<tr>
              <td style="padding: 4px 0; color: #7b5535;">Delivery Fee</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.deliveryFee.toFixed(2)}</td>
            </tr>` : ''}
            <tr style="font-weight: bold; font-size: 16px;">
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; color: #4a2a0a;">Total</td>
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; text-align: right; color: #7b4a1e;">$${order.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f2ebe0; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2d0bc; border-top: none; font-size: 12px; color: #b8956a; text-align: center;">
          Arewa Suya · Order notification
        </div>
      </div>
    `

    const msg = {
      to: ORDERS_EMAIL,
      from: WEBAPP_EMAIL,
      subject: `Order #${order.orderNumber || '—'} from ${order.customer.name} — $${order.grandTotal.toFixed(2)}`,
      html,
    }

    // Customer confirmation email
    const customerHtml = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #4a2a0a;">
        <div style="background: #8b1a2b; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🌺 Order Confirmed — Arewa Suya</h1>
        </div>

        <div style="background: #faf5ee; padding: 24px 32px; border: 1px solid #e2d0bc; border-top: none;">
          ${order.orderNumber ? `<p style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #7b4a1e;">Order #${order.orderNumber}</p>` : ''}
          <p style="margin: 0 0 20px; color: #4a2a0a; font-size: 15px;">
            Hi <strong>${order.customer.name}</strong>, thank you for your order! Here's your confirmation:
          </p>

          <h2 style="margin: 0 0 12px; font-size: 16px; color: #7b4a1e;">Your Order</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="font-size: 12px; text-transform: uppercase; color: #b8956a; letter-spacing: 0.05em;">
                <th style="text-align: left; padding-bottom: 8px;">Item</th>
                <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Subtotal</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Tax (12%)</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.tax.toFixed(2)}</td>
            </tr>
            ${order.deliveryFee ? `<tr>
              <td style="padding: 4px 0; color: #7b5535;">Delivery Fee</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.deliveryFee.toFixed(2)}</td>
            </tr>` : ''}
            <tr style="font-weight: bold; font-size: 16px;">
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; color: #4a2a0a;">Total</td>
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; text-align: right; color: #7b4a1e;">$${order.grandTotal.toFixed(2)}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #f2ebe0; border-radius: 8px;">
            <p style="margin: 0 0 12px; font-size: 14px; color: #4a2a0a;">
              ${isDelivery
                ? '<strong>🚗 Delivery:</strong> Your order will be delivered to you.'
                : '<strong>🏪 Pickup:</strong> Your order will be ready for pickup.'}
            </p>
            <table style="width: 100%; font-size: 14px; color: #4a2a0a;">
              ${scheduledDate ? `<tr>
                <td style="padding: 2px 0; color: #7b5535;"><strong>${isDelivery ? 'Delivery' : 'Pickup'} date:</strong></td>
                <td style="padding: 2px 0; text-align: right;">${scheduledDate}</td>
              </tr>` : ''}
              ${order.orderTime ? `<tr>
                <td style="padding: 2px 0; color: #7b5535;"><strong>${isDelivery ? 'Delivery' : 'Pickup'} time:</strong></td>
                <td style="padding: 2px 0; text-align: right;">${order.orderTime}</td>
              </tr>` : ''}
              ${locationValue ? `<tr>
                <td style="padding: 2px 0; color: #7b5535; vertical-align: top;"><strong>${locationLabel}:</strong></td>
                <td style="padding: 2px 0; text-align: right;">${locationValue}</td>
              </tr>` : ''}
            </table>
            <p style="margin: 12px 0 0; font-size: 13px; color: #7b5535;">
              If you have any questions, feel free to reach out to us.
            </p>
          </div>
        </div>

        <div style="background: #f2ebe0; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2d0bc; border-top: none; font-size: 12px; color: #b8956a; text-align: center;">
          Arewa Suya · Thank you for your order!
        </div>
      </div>
    `

    const customerMsg = order.customer.email ? {
      to: order.customer.email,
      from: ORDERS_EMAIL,
      subject: `Your Arewa Suya Order #${order.orderNumber || '—'} is Confirmed!`,
      html: customerHtml,
    } : null

    try {
      // Send customer confirmation if email provided
      if (customerMsg) {
        logger.info('Sending confirmation email to customer', order.customer.email)
        await sgMail.send(customerMsg)
        logger.info('Customer confirmation email sent successfully')
      }

    } catch (err) {
      // A failed customer confirmation should not prevent the order
      // notification (business-critical) from being sent. Log and continue.
      logger.error('SendGrid error sending customer confirmation email', { body: err?.response?.body || err.message })
    }

    try {
      logger.info('Sending order email to', ORDERS_EMAIL)
      await sgMail.send(msg)
      logger.info('Order email sent successfully')

      return { success: true }
    } catch (err) {
      logger.error('SendGrid error', { body: err?.response?.body || err.message })
      throw new HttpsError('internal', 'Failed to send email')
    }
  }
)
