import express from "express";

const router = express.Router();

router.delete("/test/:id", (req, res) => {
  console.log("✅ Reached test delete route");
  console.log("ID param:", req.params.id);
  res.json({ message: "Test route working" });
});

export default router;
