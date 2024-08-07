import Supplier from '../models/supplier.js';

// Create a new supplier
export const createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a supplier
export const updateSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a supplier
export const deleteSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const supplier = await Supplier.findByIdAndDelete(id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
