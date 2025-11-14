const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Mira AI Server is running
 */
router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Mira AI Server is running' });
});

module.exports = router;
