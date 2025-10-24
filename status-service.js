// Status checking service for Cheetahnet Internet Services

import { getPackageName } from './package-service.js';

// Dummy user database - in real implementation, this would be a database
const USER_ACCOUNTS = {
  'henry': {
    username: 'henry',
    currentPackage: '2',
    expiryDate: '2024-02-15',
    status: 'active',
    dataUsed: '8.5GB',
    dataLimit: 'UNLIMITED'
  },
  'nyth': {
    username: 'nyth',
    currentPackage: '1',
    expiryDate: '2024-01-20',
    status: 'active',
    dataUsed: '3.2GB',
    dataLimit: 'UNLIMITED'
  },
  'mary': {
    username: 'mary',
    currentPackage: '3',
    expiryDate: '2024-01-10',
    status: 'expired',
    dataUsed: '30GB',
    dataLimit: 'UNLIMITED'
  }
};

// Check account status
export function checkAccountStatus(username) {
  const user = USER_ACCOUNTS[username];
  
  if (!user) {
    return { 
      reply: "❌ Account not found. Please check your username and try again.\n\n💡 Make sure you're using the correct username format.",
      found: false 
    };
  }

  const packageName = getPackageName(user.currentPackage);
  const daysRemaining = calculateDaysRemaining(user.expiryDate);
  const dataUsage = calculateDataUsage(user.dataUsed, user.dataLimit);
  
  let statusEmoji = '✅';
  let statusText = 'Active';
  
  if (user.status === 'expired') {
    statusEmoji = '❌';
    statusText = 'Expired';
  } else if (daysRemaining <= 3) {
    statusEmoji = '⚠️';
    statusText = 'Expiring Soon';
  }

  const reply = `${statusEmoji} Account Status: ${statusText}\n\n👤 Username: ${username}\n📦 Package: ${packageName}\n📅 Expiry Date: ${user.expiryDate}\n⏰ Days Remaining: ${daysRemaining} days\n📊 Data Usage: ${dataUsage}\n\n${getStatusRecommendation(user.status, daysRemaining)}`;

  return {
    reply: reply,
    found: true,
    user: user,
    daysRemaining: daysRemaining
  };
}

// Calculate days remaining until expiry
function calculateDaysRemaining(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Calculate data usage percentage
function calculateDataUsage(used, limit) {
  const usedNum = parseFloat(used);
  const limitNum = parseFloat(limit);
  const percentage = Math.round((usedNum / limitNum) * 100);
  return `${used} / ${limit} (${percentage}%)`;
}

// Get status recommendations
function getStatusRecommendation(status, daysRemaining) {
  if (status === 'expired') {
    return "🔄 Your account has expired. Please renew to continue using our services.";
  } else if (daysRemaining <= 3) {
    return "⚠️ Your account expires soon! Consider renewing to avoid service interruption.";
  } else if (daysRemaining <= 7) {
    return "💡 Your account is active. You may want to consider renewing soon.";
  } else {
    return "✅ Your account is active and in good standing.";
  }
}

// Get detailed account information
export function getDetailedAccountInfo(username) {
  const user = USER_ACCOUNTS[username];
  
  if (!user) {
    return { 
      reply: "❌ Account not found.",
      found: false 
    };
  }

  const packageName = getPackageName(user.currentPackage);
  const daysRemaining = calculateDaysRemaining(user.expiryDate);
  
  const reply = `📋 Detailed Account Information\n\n👤 Username: ${username}\n📦 Current Package: ${packageName}\n📅 Expiry Date: ${user.expiryDate}\n⏰ Days Remaining: ${daysRemaining} days\n📊 Data Usage: ${user.dataUsed} / ${user.dataLimit}\n📱 Account Status: ${user.status.toUpperCase()}\n\n${getUsageTips(user.dataUsed, user.dataLimit)}`;

  return {
    reply: reply,
    found: true,
    user: user
  };
}

// Get usage tips based on data consumption
function getUsageTips(used, limit) {
  const usedNum = parseFloat(used);
  const limitNum = parseFloat(limit);
  const percentage = (usedNum / limitNum) * 100;
  
  if (percentage >= 90) {
    return "⚠️ You've used most of your data. Consider upgrading your package or renewing early.";
  } else if (percentage >= 70) {
    return "💡 You're using data efficiently. Your current package seems suitable.";
  } else {
    return "✅ You have plenty of data remaining. Your current package is working well.";
  }
}
