import express from 'express';
import cors from 'cors';
import { tempail } from '../shared/tempail.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/email/create', async (req, res) => {
  const result = await tempail.createEmail();
  res.status(result.code).json(result);
});

app.get('/api/email/messages/:token', async (req, res) => {
  const result = await tempail.getMessages(req.params.token);
  res.status(result.code).json(result);
});

app.get('/api/email/message/:id', async (req, res) => {
  const result = await tempail.getMessage(req.params.id);
  res.status(result.code).json(result);
});

app.listen(PORT, () => {
  console.log(`TempMail API server running on port ${PORT}`);
});
