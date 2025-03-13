import express from "express";
import { createMembershipCard, applyMembershipCard,getMembershipCards,toggleActiveStatus,getMembershipCardByPhone, getMembershipCardByCardNumber } from "../controllers/membershipController.js";

const router = express.Router();

router.post("/create", createMembershipCard);
router.get("/", getMembershipCards);
router.post("/apply", applyMembershipCard);
router.patch("/:cardId/toggle-active", toggleActiveStatus);
router.get("/phone/:phone", getMembershipCardByPhone);
router.get("/card-number/:cardNumber", getMembershipCardByCardNumber);

export default router;