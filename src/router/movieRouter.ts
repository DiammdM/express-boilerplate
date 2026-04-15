import express, { type Router } from "express";

const router: Router = express.Router();

router.get("/hello", (req, res) => {
  res.json({ messages: "This is movie hello!" });
});

router.get("/", (req, res) => {
  res.json({ httpMethod: "Get" });
});

router.post("/", (req, res) => {
  res.json({ httpMethod: "Post" });
});

router.put("/", (req, res) => {
  res.json({ httpMethod: "Put" });
});

router.delete("/", (req, res) => {
  res.json({ httpMethod: "Delete" });
});

export default router;
