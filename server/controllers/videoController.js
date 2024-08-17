import Video from "../models/video.js";


export const createOrUpdateVideo = async (req, res) => {
    try {
        const name = req.body.videoName
        const link = req.body.videoLink
        const { active } = req.body;
        console.log(name,link,active);
        if (req.params.id) {
            const updatedVideo = await Video.findByIdAndUpdate(
                req.params.id,
                { name, link, active },
                { new: true }
            );
            
            if (!updatedVideo) {
                return res.status(404).send('Video not found');
            }

            res.json(updatedVideo);
        } else {

            const newVideo = new Video({
                name,
                link,
                active
            });

            await newVideo.save();
            res.status(201).json(newVideo);
        }
    } catch (error) {
        console.error('Error creating or updating Video:', error);
        res.status(500).send('Server error');
    }
};

// 
export const getVideos = async (req, res) => {
    try {
        const showAll = req.query.showAll === 'true';  // Check if `showAll` query param is true

        let videos;
        if (showAll) {
            // Fetch all videos (for the admin panel)
            videos = await Video.find();
        } else {
            // Fetch only active videos (for the main frontend)
            videos = await Video.find({ active: true });
        }

        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};



export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        
        if (!video) {
            return res.status(404).send('Video not found');
        }

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting Video:', error);
        res.status(500).send('Server error');
    }
};


export const toggleVideoStatus = async (req, res) => {
    try {
        const { active } = req.body;

        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).send('Video not found');
        }

        res.json(updatedVideo);
    } catch (error) {
        console.error('Error updating Video status:', error);
        res.status(500).send('Server error');
    }
};
