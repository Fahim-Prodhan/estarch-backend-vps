import Carosul from "../models/HomeImage.js";

export const createOrUpdateCarosul = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Files:', req.files);

        const {name, link, active } = req.body;
        const images = req.files.map(file => file.path);

        if (req.params.id) {
            const carousel = await Carosul.findByIdAndUpdate(req.params.id, { images, link, active }, { new: true });
            if (!carousel) return res.status(404).send('Carousel not found');
            return res.json(carousel);
        } else {
            const newCarousel = new Carosul({ images, link, active });
            await newCarousel.save();
            return res.status(201).json(newCarousel);
        }
    } catch (error) {
        console.error('Error creating or updating carousel:', error);
        res.status(500).send('Server error');
    }
};


// Get All Carousels
export const getCarosul = async (req, res) => {
    try {
        const carousels = await Carosul.find();
        res.json(carousels);
    } catch (error) {
        console.error('Error fetching carousels:', error);
        res.status(500).send('Server error');
    }
};

// Delete Carousel
export const deleteCarosul = async (req, res) => {
    try {
        const carousel = await Carosul.findByIdAndDelete(req.params.id);
        if (!carousel) return res.status(404).send('Carousel not found');
        res.json({ message: 'Carousel deleted successfully' });
    } catch (error) {
        console.error('Error deleting carousel:', error);
        res.status(500).send('Server error');
    }
};

// Toggle Active Status
export const toggleCarosulStatus = async (req, res) => {
    try {
        const { active } = req.body; // new active status
        const carousel = await Carosul.findByIdAndUpdate(req.params.id, { active }, { new: true });
        if (!carousel) return res.status(404).send('Carousel not found');
        res.json(carousel);
    } catch (error) {
        console.error('Error updating carousel status:', error);
        res.status(500).send('Server error');
    }
};