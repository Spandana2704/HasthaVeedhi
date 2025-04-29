exports.simulatePayment = async (paymentDetails) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Common successful response structure
  const successResponse = {
    success: true,
    transactionId: `TXN-${Math.random().toString(36).substring(2, 15)}`,
    amount: paymentDetails.amount,
    method: paymentDetails.method,
    status: 'Completed', // Make sure this matches your enum exactly
    timestamp: new Date()
  };

  // Payment method specific responses
  if (paymentDetails.method === 'PayPal') {
    return {
      ...successResponse,
      transactionId: `PAYPAL-${Math.random().toString(36).substring(2, 15)}`
    };
  }

  if (paymentDetails.method === 'CreditCard') {
    return {
      ...successResponse,
      transactionId: `CC-${Math.random().toString(36).substring(2, 15)}`
    };
  }

  // For Cash on Delivery
  if (paymentDetails.method === 'CashOnDelivery') {
    return {
      ...successResponse,
      status: 'Pending', // Different status for COD
      transactionId: `COD-${Date.now()}`
    };
  }

  // Simulate payment failure 10% of the time
  if (Math.random() < 0.1) {
    return {
      success: false,
      error: 'Payment declined',
      reason: Math.random() < 0.5 ? 'Insufficient funds' : 'Card declined'
    };
  }

  return successResponse;
};