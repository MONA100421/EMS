import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
