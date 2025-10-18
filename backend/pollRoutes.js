import express from "express";
import Poll from "../models/Poll.js";
const router = express.Router();

// Create new poll
router.post("/create", async (req, res) => {
  try {
    const poll = new Poll(req.body);
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all polls
router.get("/", async (req, res) => {
  const polls = await Poll.find();
  res.json(polls);
});

// Vote on poll
router.post("/:id/vote", async (req, res) => {
  const { optionIndex } = req.body; // which option was selected
  const poll = await Poll.findById(req.params.id);
  poll.options[optionIndex].votes += 1;
  await poll.save();
  res.json(poll);
});

export default router;
