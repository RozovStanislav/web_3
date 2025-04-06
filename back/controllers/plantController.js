const Plant = require('../models/plantModel');

exports.getPlants = async (req, res) => {
    try {
        const plants = await Plant.findAll();
        res.json(plants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPlant = async (req, res) => {
    try {
        const { name, description, city, contact } = req.body;
        const newPlant = await Plant.create(name, description, city, contact);
        res.status(201).json(newPlant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePlant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, city, contact } = req.body;
        const updatedPlant = await Plant.update(id, name, description, city, contact);
        if (updatedPlant) {
            res.status(200).json(updatedPlant);
        } else {
            res.status(404).json({ error: 'Plant not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePlant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Plant.delete(id);
        if (deleted) {
            res.status(204).send('Plant deleted');
        } else {
            res.status(404).json({ error: 'Plant not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
