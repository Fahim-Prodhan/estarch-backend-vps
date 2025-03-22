import SizeType from '../models/sizeType.js';

export const getAllSizeTypes = async (req, res) => {
    try {
        const sizeTypes = await SizeType.find();
        res.status(200).json(sizeTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSizeType = async (req, res) => {
    const { name } = req.body;

    try {
        const newSizeType = new SizeType({ name });
        await newSizeType.save();
        res.status(201).json(newSizeType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSizeType = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedSizeType = await SizeType.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedSizeType) {
            return res.status(404).json({ message: 'SizeType not found' });
        }
        res.status(200).json(updatedSizeType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSizeType = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSizeType = await SizeType.findByIdAndDelete(id);
        if (!deletedSizeType) {
            return res.status(404).json({ message: 'SizeType not found' });
        }
        res.status(200).json({ message: 'SizeType deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
