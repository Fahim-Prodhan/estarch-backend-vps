import HomeImage from "../models/HomeImage.js";

// Create or Update Home Image
export const createOrUpdateHomeImage = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Files:', req.files);

        const { name, link, active } = req.body;
        const images = req.files ? req.files.map(file => file.path) : [];

        if (req.params.id) {
            // Update existing HomeImage
            const updatedHomeImage = await HomeImage.findByIdAndUpdate(
                req.params.id,
                { name, images, link, active },
                { new: true }
            );
            
            if (!updatedHomeImage) {
                return res.status(404).send('HomeImage not found');
            }

            res.json(updatedHomeImage);
        } else {
            // Create new HomeImage
            const newHomeImage = new HomeImage({
                name,
                images,
                link,
                active
            });

            await newHomeImage.save();
            res.status(201).json(newHomeImage);
        }
    } catch (error) {
        console.error('Error creating or updating HomeImage:', error);
        res.status(500).send('Server error');
    }
};

// Get All Home Images
export const getHomeImage = async (req, res) => {
    try {
        const homeImages = await HomeImage.find();
        res.json(homeImages);
    } catch (error) {
        console.error('Error fetching HomeImages:', error);
        res.status(500).send('Server error');
    }
};

// Delete Home Image
export const deleteHomeImage = async (req, res) => {
    try {
        const homeImage = await HomeImage.findByIdAndDelete(req.params.id);
        
        if (!homeImage) {
            return res.status(404).send('HomeImage not found');
        }

        res.json({ message: 'HomeImage deleted successfully' });
    } catch (error) {
        console.error('Error deleting HomeImage:', error);
        res.status(500).send('Server error');
    }
};

// Toggle Active Status
export const toggleHomeImageStatus = async (req, res) => {
    try {
        const { active } = req.body;

        const updatedHomeImage = await HomeImage.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        );

        if (!updatedHomeImage) {
            return res.status(404).send('HomeImage not found');
        }

        res.json(updatedHomeImage);
    } catch (error) {
        console.error('Error updating HomeImage status:', error);
        res.status(500).send('Server error');
    }
};
