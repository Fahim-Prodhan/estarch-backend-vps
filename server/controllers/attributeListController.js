
import AttributeList from '../models/attributeList.js';

// Create a new attribute
export const createAttribute = async (req, res) => {
    try {
        const attribute = new AttributeList(req.body);
        await attribute.save();
        res.status(201).json(attribute);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all attributes
export const getAttributes = async (req, res) => {
    try {
        const attributes = await AttributeList.find();
        res.status(200).json(attributes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an attribute
export const updateAttribute = async (req, res) => {
    const { id } = req.params;
    try {
        const attribute = await AttributeList.findByIdAndUpdate(id, req.body, { new: true });
        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.status(200).json(attribute);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an attribute
export const deleteAttribute = async (req, res) => {
    const { id } = req.params;
    try {
        const attribute = await AttributeList.findByIdAndDelete(id);
        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.status(200).json({ message: 'Attribute deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
