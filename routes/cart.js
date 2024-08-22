const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const CartModel = require('../models/CartModel');
const fooditem = require('../models/fooditem');
const addfood = require('./addfood');
const cart = require('../models/CartModel');
const CouponModel = require('../models/CouponModel');

const router = express.Router();

router.get('/', async (req, res) => {
    let allfood = [];
    let totalPrice = 0;
    let discount = 0;
    let totalAmount = 0;

    try {
        const userId = req.payload; // Replace this with how you actually get the user ID from the request
        console.log(userId);
        const cartAllData = await cart.find({ userId: userId });

        const promises = cartAllData.map(async (cart) => {
            const foodItem = await fooditem.findById(cart.fooditemId);
            allfood.push(foodItem);
        });
        await Promise.all(promises);

        // Filter out any null or undefined food items
        allfood = allfood.filter(item => item !== null && item !== undefined);

        // Calculate the total price after filtering
        allfood.forEach((food) => {
            totalPrice += food.price;
        });

    } catch (error) {
        console.error('Error fetching cart data:', error);
        return res.render('cart', { allfood, totalPrice, discount, totalAmount });
    }

    res.render('cart', { allfood, totalPrice, discount, totalAmount });
});

router.post('/AddToCart', async (req, res) => {

    const result = await CartModel.create({
        userId: req.payload,
        fooditemId: req.body.productId,
        paymentStatus: false,
        timestamp: new Date(),
    });
    console.log(result);
    res.status(200).redirect('/cart');
});

router.post('/remove', async (req, res) => {
    try {
        await cart.deleteOne({ fooditemId: req.body.fooditemId, userId: req.payload });
    } catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        });
    }
    res.status(200).redirect('/cart');
});

module.exports = router;
