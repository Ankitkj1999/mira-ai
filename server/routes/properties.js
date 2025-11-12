const express = require('express');
const router = express.Router();
const propertyService = require('../services/propertyService');

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of properties
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await propertyService.getAllProperties(page, limit);

    res.json({
      success: true,
      data: result.properties,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const property = await propertyService.getPropertyById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/properties/compare:
 *   post:
 *     summary: Compare multiple properties
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Properties for comparison
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids must be a non-empty array',
      });
    }

    const properties = await propertyService.compareProperties(ids);

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
