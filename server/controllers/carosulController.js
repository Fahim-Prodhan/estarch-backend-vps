import Carosul from "../models/carosul.js";

export const createCarosul = async (req, res) => {
    try { 
        const images = req.files.map(file => file.path);
        const carosulData = {
            images
        }
        const carosul = new Carosul(carosulData)
        await carosul.save()
        res.status(201).json(carosul)
    } catch(err) {
        res.status(400).json({message:err.message})
    }
}
// Get all categories
export const getCarosul = async (req, res) => {
    try {
        const carosuls = await Carosul.find();
        res.status(200).json(carosuls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateCarosul= async (req, res) => {
    const { id } = req.params;
    try {
        const carosul = await Carosul.findByIdAndUpdate(id, req.body, { new: true });
        if (!carosul) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(carosul);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category
export const deleteCarosul = async (req, res) => {
    const { id } = req.params;
    try {
        const carosul = await Carosul.findByIdAndDelete(id);
        if (!carosul) {
            return res.status(404).json({ message: 'Carosul not found' });
        }
        res.status(200).json({ message: 'Carosul deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};