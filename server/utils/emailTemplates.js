const orderConfirmationTemplate = (order, user) => {
    const itemRows = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>${item.title}</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.finalPrice * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const address = order.shippingAddress || {};

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">📚 BookStore</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Confirmation</p>
            </div>

            <!-- Body -->
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
                    <h2 style="color: #1e293b; margin: 0; font-size: 22px;">Order Placed Successfully!</h2>
                    <p style="color: #64748b; margin: 6px 0 0;">Thank you for your purchase, <strong>${user.fullName || user.email}</strong></p>
                </div>

                <!-- Order Info -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Order Number</td>
                            <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #1e293b;">#${order.orderNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Date</td>
                            <td style="padding: 4px 0; text-align: right; color: #1e293b;">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Payment Method</td>
                            <td style="padding: 4px 0; text-align: right; color: #1e293b; text-transform: uppercase;">${order.paymentMethod}</td>
                        </tr>
                    </table>
                </div>

                <!-- Order Items -->
                <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 12px; font-weight: 700;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
                            <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase;">Qty</th>
                            <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <!-- Totals -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Subtotal</td>
                            <td style="padding: 4px 0; text-align: right; color: #1e293b;">₹${(order.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Tax (18% GST)</td>
                            <td style="padding: 4px 0; text-align: right; color: #1e293b;">₹${(order.taxAmount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Shipping</td>
                            <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: 600;">${(order.shippingCharges || 0) === 0 ? 'FREE' : '₹' + order.shippingCharges}</td>
                        </tr>
                        ${order.couponDiscount > 0 ? `
                        <tr>
                            <td style="padding: 4px 0; color: #16a34a; font-size: 13px;">Discount</td>
                            <td style="padding: 4px 0; text-align: right; color: #16a34a;">-₹${(order.couponDiscount).toFixed(2)}</td>
                        </tr>` : ''}
                        <tr>
                            <td colspan="2"><hr style="border: none; border-top: 1px solid #e2e8f0; margin: 8px 0;"></td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; font-weight: 800; font-size: 16px; color: #1e293b;">Total</td>
                            <td style="padding: 4px 0; text-align: right; font-weight: 800; font-size: 16px; color: #2563eb;">₹${(order.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Shipping Address -->
                ${address.fullName ? `
                <div style="margin-top: 20px;">
                    <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 8px; font-weight: 700;">📦 Shipping Address</h3>
                    <div style="background: #f8fafc; border-radius: 8px; padding: 14px; border: 1px solid #e2e8f0; font-size: 14px; color: #475569; line-height: 1.6;">
                        <strong>${address.fullName}</strong><br>
                        ${address.street || address.address || ''}<br>
                        ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}<br>
                        ${address.phone ? '📞 ' + address.phone : ''}
                    </div>
                </div>` : ''}

                <!-- Estimated Delivery -->
                <div style="margin-top: 20px; background: linear-gradient(135deg, #dbeafe, #ede9fe); border-radius: 8px; padding: 16px; text-align: center;">
                    <p style="margin: 0; color: #3730a3; font-weight: 600;">🚚 Estimated Delivery</p>
                    <p style="margin: 4px 0 0; color: #4338ca; font-size: 15px; font-weight: 700;">
                        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <!-- Footer -->
                <div style="margin-top: 24px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        This email was sent from BookStore. If you have any questions, please contact us.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const adminOrderNotificationTemplate = (order, user) => {
    const itemsList = order.items.map(item =>
        `<li style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">${item.title} × ${item.quantity} = ₹${(item.finalPrice * item.quantity).toFixed(2)}</li>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626, #ea580c); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Order Received!</h1>
            </div>
            <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="color: #64748b; font-size: 13px; padding: 3px 0;">Order #</td><td style="text-align: right; font-weight: 700;">${order.orderNumber}</td></tr>
                        <tr><td style="color: #64748b; font-size: 13px; padding: 3px 0;">Customer</td><td style="text-align: right; font-weight: 600;">${user.fullName || 'N/A'}</td></tr>
                        <tr><td style="color: #64748b; font-size: 13px; padding: 3px 0;">Email</td><td style="text-align: right;">${user.email}</td></tr>
                        <tr><td style="color: #64748b; font-size: 13px; padding: 3px 0;">Payment</td><td style="text-align: right; text-transform: uppercase;">${order.paymentMethod}</td></tr>
                        <tr><td style="color: #64748b; font-size: 13px; padding: 3px 0;">Total</td><td style="text-align: right; font-weight: 800; color: #dc2626; font-size: 18px;">₹${(order.totalAmount || 0).toFixed(2)}</td></tr>
                    </table>
                </div>
                <h3 style="font-size: 15px; color: #1e293b; margin-bottom: 8px;">Items Ordered:</h3>
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #475569;">${itemsList}</ul>
                
                ${order.shippingAddress ? `
                <div style="margin-top: 16px;">
                    <h3 style="font-size: 15px; color: #1e293b; margin-bottom: 6px;">Ship To:</h3>
                    <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0;">
                        ${order.shippingAddress.fullName || ''}<br>
                        ${order.shippingAddress.street || order.shippingAddress.address || ''}<br>
                        ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}
                    </p>
                </div>` : ''}
                
                <div style="margin-top: 20px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px;">BookStore Admin Notification</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { orderConfirmationTemplate, adminOrderNotificationTemplate };
