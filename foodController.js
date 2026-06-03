const FoodModel = require('../models/foodModel');

exports.getAllFoods = async (req, res) => {
    try { res.json(await FoodModel.getAll()); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addFood = async (req, res) => {
    try {
        await FoodModel.create(req.body);
        res.status(201).json({ message: "OK" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFood = async (req, res) => {
    try {
        await FoodModel.update(req.params.id, req.body);
        res.json({ message: "OK" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteFood = async (req, res) => {
    try {
        await FoodModel.delete(req.params.id);
        res.json({ message: "OK" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};