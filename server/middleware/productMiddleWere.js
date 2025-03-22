const productMiddleware = (req, res, next) => {
    const { name, sku, sizes, price, quantity, images, category } = req.body;

    if (!name || !sku || !sizes || !price || !quantity || !images || !category) {
        return res.status(400).json({ msg: 'Please include all required fields' });
    }

    if (!Array.isArray(sizes) || !Array.isArray(images)) {
        return res.status(400).json({ msg: 'Sizes and images should be arrays' });
    }

    next();
};

export default productMiddleware;
