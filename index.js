import express from 'express';
import bodyParser from 'body-parser';
import { handleAgentResponse } from './menu-logic.js';

const app = express();
app.use(bodyParser.json());

// WhatsApp webhook endpoint
app.post('/whatsapp-webhook', async (req, res) => {
  try {
    const { phone, message } = req.body;
    console.log("Body",req.body)

    if (!phone) {
       console.log("phone",phone)
      return res.status(400).json({ reply: 'Missing phone or message' });
    }

    const reply = await handleAgentResponse(phone, message.trim());
    console.log(`[BOT -> ${phone}]: ${reply}`);

    // You can integrate your WhatsApp API send logic here
    res.json( reply );
  } catch (err) {
    console.error('Error handling message:', err);
    res.status(500).json({ reply: 'Internal server error' });
  }
});

app.listen(5000, () => console.log('Quickteller Agent Bot running on port 3000'));
