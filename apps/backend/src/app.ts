import express from 'express';
import cors from 'cors';
import prisma from '@repo/db';
import doctorRouter from './routes/doctor.routes'
import patientRouter from './routes/patient.routes'
import prescriptionRouter from './routes/prescription.routes'
import otpRouter from './routes/otp.routes'
import authRouter from './routes/auth.routes'

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


app.use("/api/v1", doctorRouter)
app.use("/api/v1", patientRouter)
app.use("/api/v1", prescriptionRouter)
app.use("/api/v1", otpRouter)
app.use("/api/v1/auth", authRouter)


// Simple auth middleware for development
const authenticateToken = (req: any, res: any, next: any) => {
  // Use a consistent user ID for development
  const userId = 'dev-user-123';
  req.user = {
    id: userId,
    email: 'doctor@example.com',
    name: 'Dr. John Doe'
  };
  req.userId = userId; // Add userId for compatibility with existing controllers
  next();
};

// Health check
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Razorpay integration
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RWWpJr4ChVm50S',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '7f9h8l63g3MjFx8luHomPXyK'
});

// Real Razorpay payment routes
app.post('/api/v1/payment/create-order', authenticateToken, async (req, res) => {
  try {
    const { plan, customerInfo } = req.body;
    const amount = plan === 'MONTHLY' ? 9900 : 99900; // Amount in paise
    
    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan,
        doctorId: req.user.id,
        customerName: customerInfo?.name || 'Dr. John Doe',
        customerEmail: customerInfo?.email || 'doctor@example.com'
      }
    };

    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created:', order);

    res.status(201).json({
      success: true,
      data: { 
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RWWpJr4ChVm50S',
        order: {
          id: order.id,
          razorpayOrderId: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          plan: plan,
          doctorId: req.user.id,
          createdAt: new Date(order.created_at * 1000).toISOString()
        }
      },
      message: 'Payment order created successfully'
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

app.post('/api/v1/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify Razorpay signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '7f9h8l63g3MjFx8luHomPXyK')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const order = await razorpay.orders.fetch(razorpay_order_id);
    
    console.log('Payment verified:', payment);
    console.log('Order details:', order);

    // Create subscription based on the order
    const plan = order.notes?.plan || 'MONTHLY';
    const subscriptionEndDate = plan === 'MONTHLY' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

    // First, ensure the doctor exists in the database
    let doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id }
    });

    if (!doctor) {
      // Create doctor if doesn't exist
      doctor = await prisma.doctor.create({
        data: {
          id: req.user.id,
          name: req.user.name || 'Dr. John Doe',
          primary_email_address_id: req.user.email || 'doctor@example.com',
          email: req.user.email || 'doctor@example.com'
        }
      });
    }

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        doctor_id: req.user.id,
        plan: plan,
        status: 'ACTIVE',
        start_date: new Date(),
        end_date: subscriptionEndDate,
        amount: payment.amount,
        currency: payment.currency
      }
    });

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        doctor_id: req.user.id,
        subscription_id: subscription.id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'SUCCESS',
        payment_method: payment.method
      }
    });

    // Update doctor's subscription status
    await prisma.doctor.update({
      where: { id: req.user.id },
      data: {
        subscription_status: 'ACTIVE',
        subscription_plan: plan,
        subscription_start: new Date(),
        subscription_end: subscriptionEndDate
      }
    });

    console.log('Subscription created in database:', subscription);

    res.json({
      success: true,
      data: { 
        subscription: {
          id: subscription.id,
          doctorId: subscription.doctor_id,
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.start_date.toISOString(),
          endDate: subscription.end_date.toISOString(),
          amount: subscription.amount,
          currency: subscription.currency
        },
        subscriptionId: subscription.id,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method
        }
      },
      message: 'Payment verified and subscription activated successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Simple subscription routes
app.get('/api/v1/subscription/status', authenticateToken, async (req, res) => {
  try {
    // Get the latest active subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        doctor_id: req.user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Checking subscription for user:', req.user.id, subscription);
    
    if (subscription) {
      // Check if subscription is still valid (not expired)
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      const isExpired = now > endDate;
      
      if (!isExpired) {
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        res.json({
          success: true,
          data: {
            isActive: true,
            status: 'ACTIVE',
            subscription: {
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              startDate: subscription.start_date.toISOString(),
              endDate: subscription.end_date.toISOString(),
              amount: subscription.amount,
              currency: subscription.currency
            },
            daysUntilExpiry: daysUntilExpiry,
            features: {
              NEW_PATIENT: true,
              CREATE_PRESCRIPTION: true,
              SEND_REMINDER: true
            }
          }
        });
        return;
      } else {
        // Subscription expired, update status in database
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' }
        });
        
        await prisma.doctor.update({
          where: { id: req.user.id },
          data: { subscription_status: 'EXPIRED' }
        });
      }
    }
    
    // No active subscription or expired
    res.json({
      success: true,
      data: {
        isActive: false,
        status: subscription?.status || 'INACTIVE',
        subscription: subscription ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.start_date.toISOString(),
          endDate: subscription.end_date.toISOString(),
          amount: subscription.amount,
          currency: subscription.currency
        } : null,
        daysUntilExpiry: null,
        features: {
          NEW_PATIENT: false,
          CREATE_PRESCRIPTION: false,
          SEND_REMINDER: false
        }
      }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subscription status'
    });
  }
});

app.get('/api/v1/subscription/plans', (req, res) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      plan: 'MONTHLY',
      amount: 9900,
      displayAmount: '₹99',
      currency: 'INR',
      features: ['Unlimited patients', 'Digital prescriptions', 'SMS reminders']
    },
    {
      id: 'yearly',
      name: 'Yearly Plan', 
      plan: 'YEARLY',
      amount: 99900,
      displayAmount: '₹999',
      currency: 'INR',
      features: ['All monthly features', 'Priority support', 'Advanced analytics']
    }
  ];

  res.json({
    success: true,
    data: { plans }
  });
});

// Feature access check endpoint
app.get('/api/v1/subscription/feature/:feature', authenticateToken, async (req, res) => {
  try {
    const { feature } = req.params;
    
    // Get the latest active subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        doctor_id: req.user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const premiumFeatures = ['NEW_PATIENT', 'CREATE_PRESCRIPTION', 'SEND_REMINDER'];
    const hasActiveSubscription = subscription && subscription.status === 'ACTIVE' && new Date() <= new Date(subscription.end_date);
    const hasAccess = hasActiveSubscription || !premiumFeatures.includes(feature);

    res.json({
      success: true,
      data: {
        hasAccess,
        feature,
        requiresSubscription: premiumFeatures.includes(feature),
        subscriptionActive: hasActiveSubscription
      }
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

// Simple doctor routes for development
app.get('/api/v1/doctor', authenticateToken, (req, res) => {
  const mockDoctor = {
    id: req.userId,
    name: 'Dr. John Doe',
    email: 'doctor@example.com',
    phone: '9876543210',
    specialization: 'General Medicine',
    license_number: 'MED123456',
    hospital: 'City Hospital',
    address: '123 Medical Street, City',
    bio: 'Experienced doctor with 10+ years in practice',
    experience: 10,
    consultation_fees: 500,
    consultation_type: 'Both',
    qualifications: 'MBBS, MD'
  };

  res.json(mockDoctor);
});

app.put('/api/v1/doctor/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Mock update - just return the updated data
  const updatedDoctor = {
    id: id,
    name: 'Dr. John Doe',
    email: 'doctor@example.com',
    phone: req.body.clinic_phone_number || '9876543210',
    specialization: req.body.specialization || 'General Medicine',
    license_number: req.body.license_number || 'MED123456',
    hospital: req.body.clinic_name || 'City Hospital',
    address: req.body.clinic_address || '123 Medical Street, City',
    bio: req.body.bio || 'Experienced doctor with 10+ years in practice',
    experience: req.body.years_of_experience || 10,
    consultation_fees: Number(req.body.consultation_fees) || 500,
    consultation_type: req.body.consultation_type || 'Both',
    qualifications: req.body.qualifications || 'MBBS, MD'
  };

  console.log('Mock doctor profile updated:', updatedDoctor);

  res.json(updatedDoctor);
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app;