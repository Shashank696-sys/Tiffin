import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


// ✅ FORCE ENVIRONMENT RELOAD
dotenv.config();

// ✅ ENVIRONMENT VARIABLES CHECK WITH DETAILED DEBUGGING
const checkEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('\n🔧 EMAIL CONFIGURATION CHECK:');
  console.log('   📧 EMAIL_USER:', emailUser ? `${emailUser.substring(0, 3)}...` : '❌ NOT FOUND');
  console.log('   🔐 EMAIL_PASS:', emailPass ? `✅ FOUND (${emailPass.length} chars)` : '❌ NOT FOUND');
  console.log('   📁 All ENV vars:', Object.keys(process.env).filter(key => key.includes('EMAIL')));
  
  return { emailUser, emailPass };
};

// Email transporter setup
const createTransporter = () => {
  const { emailUser, emailPass } = checkEmailConfig();
  
  if (!emailUser || !emailPass) {
    console.log('🚨 USING CONSOLE TRANSPORTER - Emails will NOT be sent');
    console.log('💡 TIP: Check .env file in project root and restart server');
    return createConsoleTransporter();
  }

  console.log('✅ USING REAL EMAIL TRANSPORTER - Emails will be sent via Gmail');
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    socketTimeout: 10000
  });
};

// Console transporter for development
const createConsoleTransporter = () => {
  return {
    sendMail: (mailOptions: any) => {
      console.log('\n📧 ========== EMAIL NOTIFICATION (CONSOLE MODE) ==========');
      console.log('📧 FROM:', mailOptions.from);
      console.log('📧 TO:', mailOptions.to);
      console.log('📧 SUBJECT:', mailOptions.subject);
      console.log('📧 STATUS: Email would be sent in production');
      console.log('📧 ======================================================\n');
      return Promise.resolve({ 
        messageId: 'console-mock-id', 
        response: 'Email logged to console'
      });
    },
    verify: (callback: any) => {
      callback(null, true);
    }
  };
};

// Initialize transporter
const transporter = createTransporter();

// Test email configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter configuration error:', error);
  } else {
    console.log('✅ Email transporter is ready to send emails');
  }
});

// ✅ SAFE EMAIL SENDING WRAPPER
export const sendEmailSafely = async (emailFunction: () => Promise<any>, emailType: string) => {
  try {
    console.log(`📧 Attempting to send ${emailType}...`);
    const result = await emailFunction();
    console.log(`✅ ${type} sent successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send ${emailType}:`, error);
    return null;
  }
};

// ✅ TEST EMAIL FUNCTION
export async function testEmailSending(toEmail?: string) {
  try {
    const testEmail = toEmail || process.env.EMAIL_USER;
    if (!testEmail) {
      console.log('❌ No email specified for test');
      return null;
    }

    console.log('🧪 Testing email sending to:', testEmail);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tiffo.com',
      to: testEmail,
      subject: 'Tiffo - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
          <div style="background: #dc2626; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tiffo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Fresh Food Delivery</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #dc2626; margin-bottom: 20px; text-align: center;">✅ Email Test Successful!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; text-align: center;">
              Congratulations! Your email configuration is working correctly.
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0; text-align: center;">Test Details</h3>
              <p style="text-align: center;"><strong>Server:</strong> Tiffo Backend</p>
              <p style="text-align: center;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p style="text-align: center;"><strong>Status:</strong> ✅ Working</p>
            </div>
          </div>
          
          <div style="background: #dc2626; padding: 20px; text-align: center; color: white; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Tiffo. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    return result;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return null;
  }
}

// Send OTP Email
export async function sendPasswordResetOTP(email: string, otp: string, userName: string): Promise<void> {
  try {
    console.log(`\n📧 SENDING OTP EMAIL TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tiffo.com',
      to: email,
      subject: 'Tiffo - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
          <div style="background: #dc2626; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tiffo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Fresh Food Delivery</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #dc2626; margin-bottom: 20px; text-align: center;">Password Reset OTP</h2>
            
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Use this OTP to reset your password:</p>
            
            <div style="text-align: center; margin: 25px 0; padding: 20px; background: #fef2f2; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${otp}</div>
              <p style="color: #666; font-size: 14px;">Valid for 15 minutes</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully`);
    
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
    console.log(`📋 OTP for manual use: ${otp}`);
  }
}

// ✅ Send booking confirmation to customer - WITH ADD-ONS & CUSTOMIZATIONS
export async function sendBookingConfirmationToCustomer(
  customerEmail: string,
  customerName: string,
  tiffinTitle: string,
  sellerName: string,
  sellerPhone: string,
  deliveryDate: string,
  slot: string,
  quantity: number,
  totalPrice: number,
  discountAmount: number = 0,
  couponCode: string | null = null,
  addOns: any[] = [],
  weeklyCustomizations: any[] = [],
  selectedDays: string[] = [],
  customization: string = ""
): Promise<void> {
  try {
    const subtotal = totalPrice + discountAmount;
    
    // Calculate add-ons total
    const addOnsTotal = addOns.reduce((total, addOn) => total + (addOn.price * addOn.quantity), 0);
    
    // Calculate customizations total
    const customizationsTotal = weeklyCustomizations.reduce((total, custom) => {
      const applicableDays = custom.days.filter((day: string) => selectedDays.includes(day));
      return total + (custom.price * applicableDays.length);
    }, 0);

    const basePrice = subtotal - addOnsTotal - customizationsTotal;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tiffinservice.com',
      to: customerEmail,
      subject: 'Tiffo - Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
          <div style="background: #dc2626; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tiffo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Fresh Food Delivery</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #dc2626; margin-bottom: 20px; text-align: center;">Booking Confirmed! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Hello <strong>${customerName}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Your booking has been confirmed. Here are your order details:
            </p>
            
            <!-- Basic Order Info -->
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0; text-align: center;">Order Summary</h3>
              <p><strong>Tiffin:</strong> ${tiffinTitle}</p>
              <p><strong>Seller:</strong> ${sellerName}</p>
              <p><strong>Contact:</strong> ${sellerPhone}</p>
              <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
              <p><strong>Time Slot:</strong> ${slot}</p>
              <p><strong>Quantity:</strong> ${quantity}</p>
              
              ${selectedDays && selectedDays.length > 0 ? `
                <p><strong>Selected Days:</strong> ${selectedDays.join(', ')}</p>
              ` : ''}
            </div>

            <!-- Add-ons Section -->
            ${addOns && addOns.length > 0 ? `
            <div style="background: #f0fdf4; padding: 18px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 15px 0;">
              <h4 style="color: #166534; margin-top: 0;">➕ Add-ons Selected</h4>
              ${addOns.map(addOn => `
                <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px; background: white; border-radius: 6px;">
                  <span>${addOn.name} × ${addOn.quantity}</span>
                  <span style="font-weight: bold;">₹${addOn.price * addOn.quantity}</span>
                </div>
              `).join('')}
              <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #bbf7d0; font-weight: bold;">
                <span>Total Add-ons</span>
                <span>₹${addOnsTotal}</span>
              </div>
            </div>
            ` : ''}

            <!-- Weekly Customizations Section -->
            ${weeklyCustomizations && weeklyCustomizations.length > 0 ? `
            <div style="background: #e0f2fe; padding: 18px; border-radius: 8px; border: 1px solid #7dd3fc; margin: 15px 0;">
              <h4 style="color: #0c4a6e; margin-top: 0;">⚙️ Weekly Customizations</h4>
              ${weeklyCustomizations.map(custom => {
                const applicableDays = custom.days.filter((day: string) => selectedDays.includes(day));
                const totalCost = custom.price * applicableDays.length;
                return `
                  <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span><strong>${custom.name}</strong></span>
                      <span style="font-weight: bold;">₹${totalCost}</span>
                    </div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                      ${custom.description} • Applied to: ${applicableDays.join(', ')}
                    </div>
                  </div>
                `;
              }).join('')}
              <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #7dd3fc; font-weight: bold;">
                <span>Total Customizations</span>
                <span>₹${customizationsTotal}</span>
              </div>
            </div>
            ` : ''}

            <!-- Special Instructions -->
            ${customization ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin: 15px 0;">
              <h4 style="color: #92400e; margin-top: 0;">📝 Special Instructions</h4>
              <p style="margin: 0; font-style: italic; color: #92400e;">"${customization}"</p>
            </div>
            ` : ''}

            <!-- Price Breakdown -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h4 style="color: #dc2626; margin-top: 0; text-align: center;">💰 Price Breakdown</h4>
              
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                <span>Base Price</span>
                <span>₹${basePrice}</span>
              </div>
              
              ${addOnsTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                <span>Add-ons</span>
                <span style="color: #16a34a;">+ ₹${addOnsTotal}</span>
              </div>
              ` : ''}
              
              ${customizationsTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                <span>Customizations</span>
                <span style="color: #0284c7;">+ ₹${customizationsTotal}</span>
              </div>
              ` : ''}
              
              ${discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                <span>Discount ${couponCode ? `(${couponCode})` : ''}</span>
                <span style="color: #dc2626;">- ₹${discountAmount}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #dc2626; font-size: 18px; font-weight: bold;">
                <span>Total Amount</span>
                <span style="color: #dc2626;">₹${totalPrice}</span>
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; text-align: center;">
              Your food will be delivered fresh and hot. Thank you for choosing Tiffo!
            </p>
          </div>
          
          <div style="background: #dc2626; padding: 20px; text-align: center; color: white; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Tiffo. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    throw new Error('Failed to send booking confirmation email');
  }
}

// ✅ Send order notification to seller - WITH ADD-ONS & CUSTOMIZATIONS
export async function sendOrderNotificationToSeller(
  sellerEmail: string,
  orderDetails: any,
  sellerDashboardLink: string
) {
  try {
    const {
      customerAddress,
      customerCity,
      customerName,
      customerEmail,
      customerPhone,
      tiffinTitle,
      bookingType,
      quantity,
      totalPrice,
      deliveryDate,
      slot,
      deliveryAddress,
      addOns = [],
      weeklyCustomizations = [],
      selectedDays = [],
      customization,
      orderId,
      discountAmount = 0,
      couponCode = null,
      subtotal = totalPrice + discountAmount
    } = orderDetails;

    // Calculate totals for seller email
    const addOnsTotal = addOns.reduce((total: number, addOn: any) => total + (addOn.price * addOn.quantity), 0);
    const customizationsTotal = weeklyCustomizations.reduce((total: number, custom: any) => {
      const applicableDays = custom.days.filter((day: string) => selectedDays.includes(day));
      return total + (custom.price * applicableDays.length);
    }, 0);
    const basePrice = subtotal - addOnsTotal - customizationsTotal;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tiffinservice.com',
      to: sellerEmail,
      subject: `🎉 New Order #${orderId} - ${tiffinTitle} - ₹${totalPrice}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <div style="background: #dc2626; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tiffo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Fresh Food Delivery</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 25px; background: white;">
            <h2 style="color: #dc2626; text-align: center; margin-bottom: 25px;">New Order Received! 🎉</h2>
            
            <!-- Order Summary -->
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 20px;">
              <h3 style="color: #dc2626; margin-top: 0; text-align: center;">Order #${orderId}</h3>
              <p><strong>Tiffin:</strong> ${tiffinTitle}</p>
              <p><strong>Type:</strong> ${bookingType}</p>
              <p><strong>Quantity:</strong> ${quantity}</p>
              <p><strong>Delivery:</strong> ${deliveryDate} at ${slot}</p>
              
              ${selectedDays && selectedDays.length > 0 ? `
                <p><strong>Selected Days:</strong> ${selectedDays.join(', ')}</p>
              ` : ''}
            </div>
            
            <!-- Customer Info -->
            <div style="background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <h4 style="color: #dc2626; margin-top: 0;">👤 Customer Details</h4>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Phone:</strong> ${customerPhone}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Address:</strong> ${deliveryAddress}, ${customerCity}</p>
            </div>

            <!-- Add-ons for Seller -->
            ${addOns && addOns.length > 0 ? `
            <div style="background: #f0fdf4; padding: 18px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 15px;">
              <h4 style="color: #166534; margin-top: 0;">➕ Add-ons Requested</h4>
              ${addOns.map((addOn: any) => `
                <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px; background: white; border-radius: 6px;">
                  <span>${addOn.name} × ${addOn.quantity}</span>
                  <span style="font-weight: bold;">₹${addOn.price * addOn.quantity}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Customizations for Seller -->
            ${weeklyCustomizations && weeklyCustomizations.length > 0 ? `
            <div style="background: #e0f2fe; padding: 18px; border-radius: 8px; border: 1px solid #7dd3fc; margin-bottom: 15px;">
              <h4 style="color: #0c4a6e; margin-top: 0;">⚙️ Customizations Requested</h4>
              ${weeklyCustomizations.map((custom: any) => {
                const applicableDays = custom.days.filter((day: string) => selectedDays.includes(day));
                const totalCost = custom.price * applicableDays.length;
                return `
                  <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span><strong>${custom.name}</strong></span>
                      <span style="font-weight: bold;">₹${totalCost}</span>
                    </div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
                      ${custom.description} • Days: ${applicableDays.join(', ')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            ` : ''}

            <!-- Special Instructions -->
            ${customization ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">📝 Special Instructions</h4>
              <p style="margin: 0; font-style: italic; color: #92400e;">"${customization}"</p>
            </div>
            ` : ''}

            <!-- Price Breakdown for Seller -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <h4 style="color: #dc2626; margin-top: 0; text-align: center;">💰 Order Value</h4>
              
              <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 0;">
                <span>Base Price</span>
                <span>₹${basePrice}</span>
              </div>
              
              ${addOnsTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 0;">
                <span>Add-ons</span>
                <span style="color: #16a34a;">+ ₹${addOnsTotal}</span>
              </div>
              ` : ''}
              
              ${customizationsTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 0;">
                <span>Customizations</span>
                <span style="color: #0284c7;">+ ₹${customizationsTotal}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 0; border-top: 1px dashed #e2e8f0;">
                <span><strong>Subtotal</strong></span>
                <span><strong>₹${subtotal}</strong></span>
              </div>
              
              ${discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 0;">
                <span>Customer Discount ${couponCode ? `(${couponCode})` : ''}</span>
                <span style="color: #dc2626;">- ₹${discountAmount}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #dc2626; font-size: 18px; font-weight: bold;">
                <span>Final Amount</span>
                <span style="color: #dc2626;">₹${totalPrice}</span>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="${sellerDashboardLink}" style="background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🚀 Manage Order in Dashboard
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #dc2626; padding: 20px; text-align: center; color: white; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Tiffo. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Professional email sent successfully to:', sellerEmail);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return null;
  }
}

// ✅ Send seller status update email - RED & WHITE THEME
export async function sendSellerStatusUpdate(
  sellerEmail: string,
  sellerName: string,
  status: string
): Promise<void> {
  try {
    const statusMessages: { [key: string]: { subject: string; message: string } } = {
      active: {
        subject: '🎉 Your Tiffo Seller Account is Now Active!',
        message: 'Congratulations! Your seller account has been approved and is now active. You can now start adding tiffins and receiving orders.'
      },
      suspended: {
        subject: '⚠️ Your Tiffo Seller Account Has Been Suspended',
        message: 'Your seller account has been temporarily suspended. Please contact support for more information.'
      },
      pending: {
        subject: '📋 Your Tiffo Seller Account is Under Review',
        message: 'Your seller account application is currently under review. We will notify you once it is approved.'
      }
    };

    const statusInfo = statusMessages[status] || {
      subject: '📧 Update on Your Tiffo Seller Account',
      message: `Your seller account status has been updated to: ${status}`
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tiffinservice.com',
      to: sellerEmail,
      subject: statusInfo.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 10px; overflow: hidden;">
          <div style="background: #dc2626; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Tiffo</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Fresh Food Delivery</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #dc2626; margin-bottom: 20px; text-align: center;">Account Status Update</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Hello <strong>${sellerName}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              ${statusInfo.message}
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0; text-align: center;">
              <h3 style="color: #dc2626; margin-top: 0;">Current Status</h3>
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${status.toUpperCase()}</div>
            </div>
            
            ${status === 'active' ? `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 15px 0;">
              <h4 style="color: #166534; margin-top: 0;">Next Steps:</h4>
              <p style="color: #166534; margin: 5px 0;">✅ Add your tiffin items</p>
              <p style="color: #166534; margin: 5px 0;">✅ Set your available time slots</p>
              <p style="color: #166534; margin: 5px 0;">✅ Start receiving orders!</p>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #dc2626; padding: 20px; text-align: center; color: white; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Tiffo. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Seller status update sent to ${sellerEmail}`);
  } catch (error) {
    console.error('❌ Error sending seller status update:', error);
    throw new Error('Failed to send seller status email');
  }
}

export default {
  sendPasswordResetOTP,
  sendBookingConfirmationToCustomer,
  sendOrderNotificationToSeller,
  sendSellerStatusUpdate,
  sendEmailSafely,
  testEmailSending
};