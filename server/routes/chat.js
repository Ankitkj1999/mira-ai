const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');
const propertyService = require('../services/propertyService');

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a message to the AI chatbot
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       200:
 *         description: AI response with relevant properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/message', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string',
      });
    }

    const result = await ragService.processUserMessage(message);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/chat/filter:
 *   post:
 *     summary: Filter properties by specific criteria
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minPrice:
 *                 type: number
 *                 example: 300000
 *               maxPrice:
 *                 type: number
 *                 example: 600000
 *               bedrooms:
 *                 type: number
 *                 example: 3
 *               location:
 *                 type: string
 *                 example: "New York"
 *     responses:
 *       200:
 *         description: Filtered properties
 *       500:
 *         description: Server error
 */
router.post('/filter', async (req, res, next) => {
  try {
    const filters = req.body;
    const properties = await propertyService.filterProperties(filters);

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
