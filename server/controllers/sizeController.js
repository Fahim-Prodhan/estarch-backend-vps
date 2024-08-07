import Size from '../models/size.js';
import SizeType from '../models/sizeType.js';


export const getSizesBySizeTypeName = async (req, res) => {
    const { name } = req.params;
    try {
        const sizeType = await SizeType.findOne({ name });

        if (!sizeType) {
            return res.status(404).json({ message: 'Size type not found' });
        }

        const sizes = await Size.find({ sizeType: sizeType._id });

        res.status(200).json(sizes);
    } catch (error) {
        console.error('Error getting sizes by size type name:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllSizes = async (req, res) => {
    try {
        const sizes = await Size.find().populate('sizeType', 'name'); 
        res.status(200).json(sizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSize = async (req, res) => {
    const { sizeType, sizes } = req.body;

    try {
        const newSize = new Size({ sizeType, sizes });
        await newSize.save();
        res.status(201).json(newSize);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSize = async (req, res) => {
    const { id } = req.params;
    const { sizeType, sizes } = req.body;

    try {
        const updatedSize = await Size.findByIdAndUpdate(id, { sizeType, sizes }, { new: true }).populate('sizeType', 'name');
        if (!updatedSize) {
            return res.status(404).json({ message: 'Size not found' });
        }
        res.status(200).json(updatedSize);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSize = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSize = await Size.findByIdAndDelete(id);
        if (!deletedSize) {
            return res.status(404).json({ message: 'Size not found' });
        }
        res.status(200).json({ message: 'Size deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
