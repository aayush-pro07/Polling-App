import mongoose from "mongoose";
const optionSchema = new mongoose.Schema({
  text: String,
  votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema]
});

export default mongoose.model("Poll", pollSchema);
