// Call request service for Cheetahnet Internet Services

// Call request types
const CALL_REQUEST_TYPES = {
  '1': 'Technical Support',
  '2': 'Account Issues',
  '3': 'Billing Inquiry',
  '4': 'Package Information',
  '5': 'General Inquiry'
};

// Get call request options
export function getCallRequestOptions() {
  let optionsText = "📞 Request a Call\n\n";
  optionsText += "Please select the reason for your call:\n\n";
  
  Object.entries(CALL_REQUEST_TYPES).forEach(([key, type]) => {
    optionsText += `${key}. ${type}\n`;
  });
  
  optionsText += "\nReply with the number of your inquiry type:";
  
  return { reply: optionsText };
}

// Validate call request type
export function validateCallRequestType(typeId) {
  return CALL_REQUEST_TYPES.hasOwnProperty(typeId);
}

// Get call request type name
export function getCallRequestTypeName(typeId) {
  return CALL_REQUEST_TYPES[typeId] || 'Unknown Type';
}

// Process call request
export async function processCallRequest(phoneNumber, requestType, additionalInfo = '') {
  const requestId = `CR${Date.now()}`;
  const typeName = getCallRequestTypeName(requestType);
  
  // Simulate call request processing
  const estimatedWaitTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
  
  return {
    reply: `📞 Call Request Submitted\n\n🆔 Request ID: ${requestId}\n📱 Your Number: ${phoneNumber}\n📋 Inquiry Type: ${typeName}\n⏰ Estimated Wait: ${estimatedWaitTime} minutes\n\n✅ Our support team will call you shortly.\n\n💡 Keep your phone nearby and ensure good network coverage.`,
    success: true,
    requestId: requestId,
    estimatedWaitTime: estimatedWaitTime
  };
}

// Get call request confirmation
export function getCallRequestConfirmation(phoneNumber, requestType) {
  const typeName = getCallRequestTypeName(requestType);
  
  return {
    reply: `📞 Confirm Call Request\n\n📱 Number: ${phoneNumber}\n📋 Inquiry: ${typeName}\n\n✅ Confirm this call request? (Reply YES to confirm or NO to cancel)`,
    phoneNumber: phoneNumber,
    requestType: requestType
  };
}

// Get call request status
export function getCallRequestStatus(requestId) {
  // Simulate different statuses
  const statuses = ['Pending', 'In Queue', 'Calling', 'Completed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    reply: `📞 Call Request Status\n\n🆔 Request ID: ${requestId}\n📊 Status: ${randomStatus}\n\n${getStatusMessage(randomStatus)}`,
    status: randomStatus
  };
}

// Get status message based on current status
function getStatusMessage(status) {
  switch (status) {
    case 'Pending':
      return "⏳ Your request is being processed. Please wait.";
    case 'In Queue':
      return "📋 You're in the queue. Our team will call you soon.";
    case 'Calling':
      return "📞 We're calling you now. Please answer your phone.";
    case 'Completed':
      return "✅ Your call request has been completed. Thank you!";
    default:
      return "📞 Your call request is being handled.";
  }
}
