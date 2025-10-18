import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Replace with your MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://aayush:aayush07@cluster0.32puwwl.mongodb.net/";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Schema & Model
const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  votes: [{ type: Number, default: 0 }]
});

const Poll = mongoose.model("Poll", pollSchema);

// GET /polls - fetch all polls
app.get('/polls', async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// POST /polls - create a new poll
app.post('/polls', async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }
    const votes = Array(options.length).fill(0);
    const poll = new Poll({ question, options, votes });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// POST /vote/:id - vote for an option
app.post('/vote/:id', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }
    poll.votes[optionIndex] += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// (Optional) DELETE /polls/:id - delete a poll
app.delete('/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ message: 'Poll deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// ✅ Start Server
app.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
