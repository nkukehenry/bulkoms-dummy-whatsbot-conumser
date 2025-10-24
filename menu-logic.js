import redisClient from './redis-client.js';
import { getAvailablePackages, getPackageById, validatePackageSelection } from './package-service.js';
import { validateUserAccount, getCurrentPackageDetails, getRenewalOptions, processRenewal } from './renewal-service.js';
import { getMobileMoneyOptions, validateMobileMoneyOption, processPayment, processPaymentApproval } from './payment-service.js';
import { checkAccountStatus } from './status-service.js';
import { getCallRequestOptions, validateCallRequestType, processCallRequest, getCallRequestConfirmation } from './call-service.js';

// Main menu handler for Cheetahnet Internet Services
export async function handleCustomerResponse(phone, message) {
  const key = `customer:${phone}`;
  let session = await redisClient.get(key);
  session = session ? JSON.parse(session) : { step: 'main_menu', phone: phone };

  let reply = 'Please try again';

  switch (session.step) {
    // === MAIN MENU ===
    case 'main_menu':
      reply = {
        reply: `🌐 Welcome to Cheetahnet Internet Services!\n\nPlease choose an option:\n1. Renew Service\n2. Change Package\n3. Check Status\n4. Request Call\n\nReply with the number of your choice:`
      };
      session.step = 'awaiting_main_choice';
      break;

    // === MAIN CHOICE ===
    case 'awaiting_main_choice':
      if (message === '1') {
        reply = { reply: 'Enter your username/account number:' };
        session.step = 'awaiting_username';
      } else if (message === '2') {
        reply = getAvailablePackages();
        session.step = 'awaiting_package_selection';
      } else if (message === '3') {
        reply = { reply: 'Enter your username/account number to check status:' };
        session.step = 'awaiting_status_username';
      } else if (message === '4') {
        reply = getCallRequestOptions();
        session.step = 'awaiting_call_type';
      } else {
        reply = { reply: 'Invalid choice. Please reply with 1, 2, 3, or 4.' };
      }
      break;

    // === RENEWAL FLOW ===
    case 'awaiting_username':
      if (validateUserAccount(message)) {
        session.username = message;
        reply = getRenewalOptions(message);
        session.step = 'awaiting_renewal_choice';
      } else {
        reply = { reply: '❌ Account not found. Please check your username and try again.' };
      }
      break;

    case 'awaiting_renewal_choice':
      if (message === '1') {
        // Renew current package
        reply = await getCurrentPackageDetails(session.username);
        // Store renewal info in session
        if (reply.found) {
          session.renewalAmount = reply.amount;
          session.renewalPackageName = reply.packageName;
        }
        session.step = 'awaiting_renewal_confirmation';
      } else if (message === '2') {
        // Change package
        reply = getAvailablePackages();
        session.step = 'awaiting_package_selection';
      } else {
        reply = { reply: 'Invalid choice. Please reply with 1 or 2.' };
      }
      break;

    case 'awaiting_renewal_confirmation':
      if (message.toLowerCase() === 'yes') {
        // Store package info for payment
        session.amount = session.renewalAmount;
        session.packageName = session.renewalPackageName;
        reply = getMobileMoneyOptions(session.phone);
        session.step = 'awaiting_mobile_money_option';
      } else if (message.toLowerCase() === 'no') {
        reply = { reply: 'Renewal cancelled. How can I help you?' };
        session.step = 'main_menu';
      } else {
        reply = { reply: 'Please reply YES to confirm or NO to cancel.' };
      }
      break;

    // === PACKAGE SELECTION FLOW ===
    case 'awaiting_package_selection':
      if (validatePackageSelection(message)) {
        session.selectedPackage = message;
        reply = getPackageById(message);
        session.step = 'awaiting_package_confirmation';
      } else {
        reply = { reply: 'Invalid package selection. Please choose a valid package number.' };
      }
      break;

    case 'awaiting_package_confirmation':
      if (message.toLowerCase() === 'yes') {
        // Store package info for payment
        const { getPackagePrice, getPackageName } = await import('./package-service.js');
        session.amount = getPackagePrice(session.selectedPackage);
        session.packageName = getPackageName(session.selectedPackage);
        reply = getMobileMoneyOptions(session.phone);
        session.step = 'awaiting_mobile_money_option';
      } else if (message.toLowerCase() === 'no') {
        reply = getAvailablePackages();
        session.step = 'awaiting_package_selection';
      } else {
        reply = { reply: 'Please reply YES to confirm or NO to choose another package.' };
      }
      break;

    // === MOBILE MONEY PAYMENT FLOW ===
    case 'awaiting_mobile_money_option':
      if (validateMobileMoneyOption(message)) {
        if (message === '1') {
          // Use current number
          session.mobileNumber = session.phone;
          console.log('Payment details:', { amount: session.amount, packageName: session.packageName, mobileNumber: session.mobileNumber });
          reply = await processPayment(session.amount, session.packageName, session.mobileNumber);
          if (reply.success) {
            session.transactionId = reply.transactionId;
            session.step = 'awaiting_payment_approval';
          }
        } else if (message === '2') {
          // Enter different number
          reply = { reply: 'Enter the mobile money number to use for payment:' };
          session.step = 'awaiting_mobile_number';
        }
      } else {
        reply = { reply: 'Invalid choice. Please reply with 1 or 2.' };
      }
      break;

    case 'awaiting_mobile_number':
      session.mobileNumber = message;
      console.log('Payment details:', { amount: session.amount, packageName: session.packageName, mobileNumber: session.mobileNumber });
      reply = await processPayment(session.amount, session.packageName, session.mobileNumber);
      if (reply.success) {
        session.transactionId = reply.transactionId;
        session.step = 'awaiting_payment_approval';
      }
      break;

    case 'awaiting_payment_approval':
      if (message.toLowerCase() === 'approved') {
        reply = await processPaymentApproval(session.transactionId, true);
        session.step = 'main_menu';
        // Clear session data
        delete session.username;
        delete session.selectedPackage;
        delete session.mobileNumber;
        delete session.amount;
        delete session.packageName;
        delete session.transactionId;
      } else if (message.toLowerCase() === 'declined') {
        reply = await processPaymentApproval(session.transactionId, false);
        session.step = 'main_menu';
      } else {
        reply = { reply: 'Please reply APPROVED if you approved the payment or DECLINED if you declined it.' };
      }
      break;

    // === STATUS CHECK FLOW ===
    case 'awaiting_status_username':
      reply = checkAccountStatus(message);
      session.step = 'main_menu';
      break;

    // === CALL REQUEST FLOW ===
    case 'awaiting_call_type':
      if (validateCallRequestType(message)) {
        session.callRequestType = message;
        reply = getCallRequestConfirmation(session.phone, message);
        session.step = 'awaiting_call_confirmation';
      } else {
        reply = { reply: 'Invalid choice. Please select a valid option.' };
      }
      break;

    case 'awaiting_call_confirmation':
      if (message.toLowerCase() === 'yes') {
        reply = await processCallRequest(session.phone, session.callRequestType);
        session.step = 'main_menu';
        delete session.callRequestType;
      } else if (message.toLowerCase() === 'no') {
        reply = { reply: 'Call request cancelled. How can I help you?' };
        session.step = 'main_menu';
      } else {
        reply = { reply: 'Please reply YES to confirm or NO to cancel.' };
      }
      break;

    // === FALLBACK ===
    default:
      reply = { reply: 'Session reset. Please start again.' };
      session.step = 'main_menu';
      break;
  }

  await redisClient.set(key, JSON.stringify(session));
  return reply;
}
