import MembershipCard from "../models/membership.js";

const generateCardNumber = () => {
    return Math.floor(Math.random() * 100000000);
};

export const createMembershipCard = async (req, res) => {
    try {
        const { tier, discountPercentage } = req.body;

        if (!tier || discountPercentage === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        let cardNumber;
        let cardExists = true;

        // Ensure the card number is unique
        while (cardExists) {
            cardNumber = generateCardNumber();
            const existingCard = await MembershipCard.findOne({ cardNumber });
            if (!existingCard) {
                cardExists = false;
            }
        }

        const newCard = await MembershipCard.create({
            cardNumber,
            tier,
            discountPercentage,
            isActive: false
        });

        res.status(201).json({ success: true, message: "Membership card created successfully.", card: newCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller to get all membership cards
export const getMembershipCards = async (req, res) => {
    try {
        // Fetch all membership cards from the database
        const membershipCards = await MembershipCard.find().populate("issuedTo");

        // Return the list of membership cards as JSON
        res.status(200).json(membershipCards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching membership cards' });
    }
};


export const applyMembershipCard = async (req, res) => {
    try {
        const { cardNumber, name, phone, address } = req.body;

        console.log({ cardNumber, name, phone, address });
        

        if (!cardNumber || !name || !phone || !address) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const newCard = await MembershipCard.findOne({ cardNumber });
        const existingCard = await MembershipCard.findOne({ 'issuedTo.phone': phone })

        if (!newCard) {
            return res.status(404).json({ success: false, message: "Membership card not found." });
        }

        // If the card already has a user with the provided phone number, update the issuedTo field
        if (existingCard && existingCard.cardNumber != cardNumber && existingCard.isActive) {
            existingCard.issuedTo = null;
            existingCard.isActive = false;
            await existingCard.save();
        } else if (newCard && !newCard.isActive) {
            newCard.issuedTo = { name, phone, address, assignedAt: new Date() };
            newCard.isActive = true;
            await newCard.save();
        }else{
            return res.status(404).json({ success: false, message: "Membership card is already assigned to other" });
        }

        res.status(200).json({ success: true, message: "Membership card assigned or updated successfully.", newCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const toggleActiveStatus = async (req, res) => {
    const { cardId } = req.params;
    const { isActive } = req.body; // Removed 'issuedTo' as it's not needed for deactivating the card

    try {
        const card = await MembershipCard.findById(cardId);

        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Check if the card is already inactive
        if (card.isActive === false && isActive === false) {
            return res.status(400).json({ message: "Card is already inactive." });
        }

        card.isActive = isActive;

        // If deactivating, clear the issuedTo field
        if (!isActive) {
            card.issuedTo = null;  // Clear issuedTo if the card is inactive
        }

        await card.save();

        return res.status(200).json({ isActive, issuedTo: card.issuedTo });
    } catch (error) {
        res.status(500).json({ message: "Error updating card status", error: error.message });
    }
};


export const getMembershipCardByPhone = async (req, res) => {
    const { phone } = req.params;

    try {
        // Find the card where issuedTo.phone matches the provided phone number
        const card = await MembershipCard.findOne({ "issuedTo.phone": phone });

        if (!card) {
            return res.status(404).json({ message: "Card not found for the provided phone number." });
        }

        // Return the card details
        return res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ message: "Error fetching membership card", error: error.message });
    }
};


export const getMembershipCardByCardNumber = async (req, res) => {
    const { cardNumber } = req.params;

    try {
        // Find the card where issuedTo.phone matches the provided phone number
        const card = await MembershipCard.findOne({ cardNumber });

        if (!card) {
            return res.status(404).json({ message: "Card not found for the provided phone number." });
        }

        // Return the card details
        return res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ message: "Error fetching membership card", error: error.message });
    }
};
