// Razorpay Checkout Integration Helper

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface OpenRazorpayCheckoutOptions {
  amountINR: number; // Amount in Rupees e.g. 1499
  orderNumber: string; // Internal Order Number e.g. UF100001
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Retrieves the Razorpay Key ID from environment configuration
 */
export const getRazorpayKeyId = (): string | undefined => {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim().length > 0 && !envKey.includes('MY_') && !envKey.includes('YOUR_')) {
    return envKey.trim();
  }
  return undefined;
};

/**
 * Launches the Razorpay payment modal
 */
export const openRazorpayCheckout = async (options: OpenRazorpayCheckoutOptions): Promise<boolean> => {
  const keyId = getRazorpayKeyId();

  // If Razorpay Key is not set, handle in simulated test mode or prompt
  if (!keyId) {
    console.info('No VITE_RAZORPAY_KEY_ID configured. Executing seamless Razorpay test checkout simulation.');
    
    // Simulate brief payment processing delay
    await new Promise((res) => setTimeout(res, 1200));

    // Return mock payment ID for sandbox/preview testing
    const mockPaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;
    options.onSuccess({
      razorpay_payment_id: mockPaymentId,
      razorpay_order_id: `order_test_${Math.random().toString(36).substring(2, 8)}`,
      razorpay_signature: `sig_test_${Math.random().toString(36).substring(2, 12)}`
    });
    return true;
  }

  // Load SDK
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    console.error('Razorpay SDK could not be loaded');
    if (options.onFailure) {
      options.onFailure(new Error('Failed to load Razorpay SDK'));
    }
    return false;
  }

  // Calculate amount in paise (Razorpay expects amounts in smallest sub-unit)
  const amountInPaise = Math.round(options.amountINR * 100);

  const razorpayOptions = {
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    name: 'VoxelForm • Uncommon Finds',
    description: options.description || `Order #${options.orderNumber} - Precision 3D Printed Artifacts`,
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    notes: {
      order_number: options.orderNumber,
      brand: 'VoxelForm',
    },
    theme: {
      color: '#ef4444', // VoxelForm Accent Red
      backdrop_color: 'rgba(0, 0, 0, 0.85)',
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
      escape: true,
      backdropclose: false,
    },
    handler: function (response: RazorpayPaymentSuccessResponse) {
      if (options.onSuccess) {
        options.onSuccess(response);
      }
    },
  };

  try {
    const rzp = new window.Razorpay(razorpayOptions);
    rzp.on('payment.failed', function (response: any) {
      console.error('Razorpay Payment Failed:', response.error);
      if (options.onFailure) {
        options.onFailure(response.error);
      }
    });
    rzp.open();
    return true;
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    if (options.onFailure) {
      options.onFailure(err);
    }
    return false;
  }
};
