// Payment processing service for Cheetahnet Internet Services

// Mobile Money payment options
const MOBILE_MONEY_OPTIONS = {
  '1': 'Use This Number',
  '2': 'Other Number'
};

// Get mobile money payment options
export function getMobileMoneyOptions(currentNumber) {
  let optionsText = "💳 Mobile Money Payment\n\n";
  optionsText += `📱 Current Number: ${currentNumber}\n\n`;
  optionsText += "Choose payment option:\n";
  optionsText += "1. Use This Number\n";
  optionsText += "2. Other Number\n\n";
  optionsText += "Reply with your choice:";
  
  return { reply: optionsText };
}

// Validate mobile money option selection
export function validateMobileMoneyOption(optionId) {
  return MOBILE_MONEY_OPTIONS.hasOwnProperty(optionId);
}

// Get mobile money option name
export function getMobileMoneyOptionName(optionId) {
  return MOBILE_MONEY_OPTIONS[optionId] || 'Unknown Option';
}

// Process mobile money payment
export async function processMobileMoneyPayment(amount, mobileNumber, packageName) {
  // Validate inputs
  if (!amount || isNaN(amount)) {
    return {
      reply: "❌ Invalid amount. Please try again.",
      success: false
    };
  }
  
  if (!mobileNumber) {
    return {
      reply: "❌ Mobile number is required for payment.",
      success: false
    };
  }
  
  if (!packageName) {
    return {
      reply: "❌ Package information is missing.",
      success: false
    };
  }

  // Simulate payment processing
  const transactionId = `MM${Date.now()}`;
  
  return {
    reply: `💳 Mobile Money Payment\n\n💰 Amount: UGX ${amount.toLocaleString()}\n📱 Mobile Number: ${mobileNumber}\n📦 Package: ${packageName}\n🆔 Transaction ID: ${transactionId}\n\n📱 STK Push sent to your phone!\n\n⚠️ Please check your phone and approve the payment prompt to complete the transaction.\n\n⏳ Waiting for payment approval...`,
    success: true,
    transactionId: transactionId,
    amount: amount,
    requiresApproval: true
  };
}

// Process payment approval
export async function processPaymentApproval(transactionId, approved = true) {
  if (approved) {
    return {
      reply: `✅ Payment Approved!\n\n🆔 Transaction ID: ${transactionId}\n\n🎉 Your internet package has been activated successfully!\n\n📱 You will receive a confirmation SMS shortly.`,
      success: true,
      transactionId: transactionId
    };
  } else {
    return {
      reply: `❌ Payment Declined\n\n🆔 Transaction ID: ${transactionId}\n\n💡 You can try again or contact support if you need assistance.`,
      success: false,
      transactionId: transactionId
    };
  }
}

// Validate mobile number format
export function validateMobileNumber(number) {
  // Basic validation for Ugandan mobile numbers
  const cleanNumber = number.replace(/\D/g, '');
  return cleanNumber.length >= 9 && cleanNumber.length <= 12;
}

// Process Mobile Money payment
export async function processPayment(amount, packageName, mobileNumber) {
  // Validate amount
  if (!amount || isNaN(amount) || amount <= 0) {
    return { reply: "❌ Invalid amount. Please try again." };
  }
  
  if (!packageName) {
    return { reply: "❌ Package information is missing." };
  }
  
  if (!mobileNumber) {
    return { reply: "❌ Mobile number is required for Mobile Money payment." };
  }
  
  if (!validateMobileNumber(mobileNumber)) {
    return { reply: "❌ Invalid mobile number format. Please enter a valid mobile number." };
  }
  
  return await processMobileMoneyPayment(amount, mobileNumber, packageName);
}
