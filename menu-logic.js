import redisClient from './redis-client.js';

// Dummy backend operations (replace with your real service calls)
async function checkTransactionStatus(ref) {
  return {reply:`Transaction ${ref} is SUCCESSFUL, Amount: UGX 25,000.`};
}

async function requestStatement(agentNumber, fromDate, toDate) {
  return {reply:`Statement for Agent ${agentNumber} from ${fromDate} to ${toDate} has been sent to your email.`,media:'https://www.impact-bank.com/user/file/dummy_statement.pdf'};
}

async function requestReversal(customerNumber, txnId) {
  return {reply:`Reversal request for Txn ${txnId} (Customer ${customerNumber}) has been logged for review.`};
}

// Main menu handler
export async function handleAgentResponse(phone, message) {
  const key = `agent:${phone}`;
  let session = await redisClient.get(key);
  session = session ? JSON.parse(session) : { step: 'main_menu' };

  let reply = 'Please try again';

  switch (session.step) {
    // === MAIN MENU ===
    case 'main_menu':
      reply ={reply:`Welcome to Quickteller Agent Support.\nPlease choose an option:\n1. Check Transaction Status\n2. Request Statement\n3. Request Reversal`};
      session.step = 'awaiting_main_choice';
      break;

    // === MAIN CHOICE ===
    case 'awaiting_main_choice':
      if (message === '1') {
        reply = 'Enter Transaction Reference Number:';
        session.step = 'awaiting_txn_ref';
      } else if (message === '2') {
        reply = 'Enter your Agent Number:';
        session.step = 'awaiting_agent_number';
      } else if (message === '3') {
        reply = 'Enter Customer Phone Number:';
        session.step = 'awaiting_reversal_customer';
      } else {
        reply = 'Invalid choice. Please reply with 1, 2, or 3.';
      }
      reply= {reply};
      break;

    // === TRANSACTION STATUS ===
    case 'awaiting_txn_ref':
      reply = await checkTransactionStatus(message);
      session.step = 'main_menu';
      break;

    // === STATEMENT REQUEST ===
    case 'awaiting_agent_number':
      session.agentNumber = message;
      reply = {reply:'Enter Start Date (YYYY-MM-DD):'};
      session.step = 'awaiting_start_date';
      break;

    case 'awaiting_start_date':
      session.dateFrom = message;
      reply = {reply:'Enter End Date (YYYY-MM-DD):'};
      session.step = 'awaiting_end_date';
      break;

    case 'awaiting_end_date':
      const { agentNumber, dateFrom } = session;
      const dateTo = message;
      reply = await requestStatement(agentNumber, dateFrom, dateTo);
      session.step = 'main_menu';
      delete session.agentNumber;
      delete session.dateFrom;
      break;

    // === REVERSAL REQUEST ===
    case 'awaiting_reversal_customer':
      session.customerNumber = message;
      reply = {reply:'Enter Transaction Reference Number:'};
      session.step = 'awaiting_reversal_txn';
      break;

    case 'awaiting_reversal_txn':
      reply = await requestReversal(session.customerNumber, message);
      session.step = 'main_menu';
      delete session.customerNumber;
      break;

    // === FALLBACK ===
    default:
      reply = {reply:'Session reset. Please start again.'};
      session.step = 'main_menu';
      break;
  }

  await redisClient.set(key, JSON.stringify(session));
  return reply;
}
