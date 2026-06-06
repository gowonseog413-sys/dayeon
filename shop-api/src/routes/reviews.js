import { Router } from "express";
import { readDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { syncOrderDeliveryStatus } from "../order-delivery.js";
import {
  listUserReviewableItems,
  listUserReviews,
} from "../review-eligibility.js";

const router = Router();

router.get("/mine", authRequired, (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();

  res.json({
    reviews: listUserReviews(fresh, req.user.sub),
    reviewable: listUserReviewableItems(fresh, req.user.sub),
  });
});

export default router;
