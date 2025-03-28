import express from "express";
import { createMembershipCard,updateMembershipCard, applyMembershipCard,getMembershipCards,toggleActiveStatus,getMembershipCardByPhone, getMembershipCardByCardNumber } from "../controllers/membershipController.js";

const router = express.Router();

router.post("/create", createMembershipCard);
router.get("/", getMembershipCards);
router.post("/apply", applyMembershipCard);
router.patch("/:cardId/toggle-active", toggleActiveStatus);
router.put("/update/:cardNumber", updateMembershipCard);
router.get("/phone/:phone", getMembershipCardByPhone);
router.get("/card-number/:cardNumber", getMembershipCardByCardNumber);

export default router;