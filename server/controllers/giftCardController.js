import GiftCard from '../models/giftCard.js'
import GiftCardTypes from '../models/giftCardTypes.js'
import Order from '../models/order.js';

export const createGiftCard = async (req, res) => {
    try {
        const { code, amount, expiryDate, isActive } = req.body;

        // Check if the gift card code already exists
        const existingCard = await GiftCard.findOne({ code });
        if (existingCard) {
            return res.status(400).json({ message: "Gift Card code already exists" });
        }

        const newGiftCard = new GiftCard({
            code,
            amount,
            expiryDate,
            isActive: isActive ?? true,
        });

        await newGiftCard.save();
        res.status(201).json({ message: "Gift Card created successfully", newGiftCard });
    } catch (error) {
        res.status(500).json({ message: "Error creating gift card", error: error.message });
    }
};


export const createGiftCardTypes = async (req, res) => {
    try {
        const { amount } = req.body;
        // Check if the gift card code already exists
        const existingCardTypes = await GiftCardTypes.findOne({ amount });
        if (existingCardTypes) {
            return res.status(400).json({ message: "Gift Card Types code already exists" });
        }

        const newGiftCardTypes = new GiftCardTypes({
            amount,
            isActive: true,
        });

        await newGiftCardTypes.save();
        res.status(201).json({ message: "Gift Card created successfully", newGiftCardTypes });
    } catch (error) {
        res.status(500).json({ message: "Error creating gift card", error: error.message });
    }
};



// export const getAllGiftCards = async (req, res) => {
//     try {
//         const giftCards = await GiftCard.find().sort({ createdAt: -1 });
//         res.status(200).json(giftCards);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching gift cards", error: error.message });
//     }
// };

export const getAllGiftCards = async (req, res) => {
    try {
      const giftCards = await GiftCard.aggregate([
        {
          $lookup: {
            from: "orders", // Collection name for Order
            let: { giftCode: "$code" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$giftCard.code", "$$giftCode"] }
                }
              },
              {
                $count: "usageCount"
              }
            ],
            as: "usageData"
          }
        },
        {
          $addFields: {
            usageCount: { $arrayElemAt: ["$usageData.usageCount", 0] }
          }
        },
        {
          $project: {
            usageData: 0 // Exclude the array field
          }
        }
      ]);
  
      res.json(giftCards);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

export const getAllGiftCardTypes = async (req, res) => {
    try {
        const giftCardTypes = await GiftCardTypes.find().sort({ amount: 1 });
        res.status(200).json(giftCardTypes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching gift cards", error: error.message });
    }
};


export const updateGiftCard = async (req, res) => {
    try {
        const { code, amount, expiryDate, isActive } = req.body;

        const updatedGiftCard = await GiftCard.findByIdAndUpdate(
            req.params.id,
            { amount, expiryDate, isActive, code },
            { new: true, runValidators: true }
        );
        

        if (!updatedGiftCard) {
            return res.status(404).json({ message: "Gift Card not found" });
        }

        res.status(200).json({ message: "Gift Card updated successfully", updatedGiftCard });
    } catch (error) {
        res.status(500).json({ message: "Error updating gift card", error: error.message });
    }
};


export const applyGiftCard = async (req, res) => {
    try {
        // Extract the gift card code from params (should use req.params.code)
        const  code  = req.params;

        // Check if the code exists
        if (!code) {
            return res.status(400).send('Gift card code is required');
        }

        // Find the gift card by its code
        const giftCard = await GiftCard.findOne( code );

        // If the gift card doesn't exist
        if (!giftCard) {
            return res.status(404).send('Gift card not found');
        }

        // Check if the card is active or expired
        if (!giftCard.isActive) {
            return res.status(400).send('Card is not active');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's time to 00:00:00.000
        giftCard.expiryDate.setHours(0, 0, 0, 0); // Set expiry date's time to 00:00:00.000

        // Compare the dates, now they will only consider the date part
        if (giftCard.expiryDate < today) {
            return res.status(400).send('Gift Card has expired');
        }

         await GiftCard.findByIdAndUpdate(
            giftCard._id,
            { isActive:false },
            { new: true, runValidators: true }
        );
        // If all checks pass, send the gift card details
        res.status(200).send(giftCard);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the gift card');
    }
};

