// Renewal service for Cheetahnet Internet Services

import { getPackageById, getPackagePrice, getPackageName } from './package-service.js';

// Dummy user database - in real implementation, this would be a database
const USER_ACCOUNTS = {
  'henry': {
    username: 'henry',
    currentPackage: '2',
    expiryDate: '2024-02-15',
    status: 'active'
  },
  'nyth': {
    username: 'nyth',
    currentPackage: '1',
    expiryDate: '2024-01-20',
    status: 'active'
  },
  'mary': {
    username: 'mary',
    currentPackage: '3',
    expiryDate: '2024-03-01',
    status: 'expired'
  }
};

// Check if user account exists
export function validateUserAccount(username) {
  return USER_ACCOUNTS.hasOwnProperty(username);
}

// Get user account details
export function getUserAccount(username) {
  return USER_ACCOUNTS[username] || null;
}

// Get current package details for user
export async function getCurrentPackageDetails(username) {
  const user = getUserAccount(username);
  if (!user) {
    return { reply: "❌ Account not found. Please check your username and try again." };
  }

  const packageId = user.currentPackage;
  const packageDetails = getPackageById(packageId);
  
  if (packageDetails.reply.includes("Invalid")) {
    return { reply: "❌ Unable to retrieve your current package details." };
  }

  const amount = getPackagePrice(packageId);
  const packageName = getPackageName(packageId);

  return {
    reply: `👤 Account: ${username}\n📦 Current Package: ${packageName}\n📅 Expiry Date: ${user.expiryDate}\n📊 Status: ${user.status.toUpperCase()}\n\n💰 Renewal Amount: UGX ${amount.toLocaleString()}\n\n✅ Confirm renewal? (Reply YES to proceed or NO to cancel)`,
    packageId: packageId,
    amount: amount,
    packageName: packageName,
    found: true
  };
}

// Process renewal
export async function processRenewal(username, packageId, paymentMethod, mobileNumber) {
  const user = getUserAccount(username);
  if (!user) {
    return { reply: "❌ Account not found." };
  }

  const amount = getPackagePrice(packageId);
  const packageName = getPackageName(packageId);
  
  // Calculate new expiry date (30 days from now)
  const newExpiryDate = new Date();
  newExpiryDate.setDate(newExpiryDate.getDate() + 30);
  const formattedExpiry = newExpiryDate.toISOString().split('T')[0];

  // Update user account
  user.currentPackage = packageId;
  user.expiryDate = formattedExpiry;
  user.status = 'active';

  return {
    reply: `🎉 Renewal Successful!\n\n👤 Account: ${username}\n📦 Package: ${packageName}\n💰 Amount Paid: UGX ${amount.toLocaleString()}\n💳 Payment Method: ${paymentMethod}\n📱 Mobile Number: ${mobileNumber}\n📅 New Expiry: ${formattedExpiry}\n\n✅ Your internet service has been renewed successfully!`,
    success: true,
    newExpiryDate: formattedExpiry
  };
}

// Get renewal options for user
export function getRenewalOptions(username) {
  const user = getUserAccount(username);
  if (!user) {
    return { reply: "❌ Account not found. Please check your username and try again." };
  }

  return {
    reply: `👤 Account Found: ${username}\n📦 Current Package: ${getPackageName(user.currentPackage)}\n📅 Expiry Date: ${user.expiryDate}\n📊 Status: ${user.status.toUpperCase()}\n\n🔄 Renewal Options:\n1. Renew Current Package\n2. Change Package\n\nReply with your choice:`,
    user: user
  };
}
