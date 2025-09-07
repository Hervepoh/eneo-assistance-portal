import { Router } from "express";

// Exemple : nouvelle version avec endpoints différents ou améliorés
const apiV2 = Router();

apiV2.get("/test", (req, res) => {
  res.json({ message: "🚀 API V2 test route" });
});


export { apiV2 };
