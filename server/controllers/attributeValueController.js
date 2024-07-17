import AttributeValue from '../models/attributeValue.js';

// Create a new attribute value
export const createAttributeValue = async (req, res) => {
    try {
        const attributeValue = new AttributeValue(req.body);
        await attributeValue.save();
        res.status(201).json(attributeValue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all attribute values
export const getAttributeValues = async (req, res) => {
    try {
        const attributeValues = await AttributeValue.find().populate('attribute');
        res.status(200).json(attributeValues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an attribute value
export const updateAttributeValue = async (req, res) => {
    const { id } = req.params;
    try {
        const attributeValue = await AttributeValue.findByIdAndUpdate(id, req.body, { new: true });
        if (!attributeValue) {
            return res.status(404).json({ message: 'Attribute value not found' });
        }
        res.status(200).json(attributeValue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an attribute value
export const deleteAttributeValue = async (req, res) => {
    const { id } = req.params;
    try {
        const attributeValue = await AttributeValue.findByIdAndDelete(id);
        if (!attributeValue) {
            return res.status(404).json({ message: 'Attribute value not found' });
        }
        res.status(200).json({ message: 'Attribute value deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
