const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const authController = require('../controllers/authController');

// Роуты для растений
router.get('/plants', plantController.getAllPlants);
router.post('/plants', authController.authenticate, plantController.createPlant);
router.get('/plants/:id', plantController.getPlantById);
router.put('/plants/:id', authController.authenticate, plantController.updatePlant);
router.delete('/plants/:id', authController.authenticate, plantController.deletePlant);

// Роуты для пользователей
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;