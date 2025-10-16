const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const socialLinksController = require('../../controllers/socialLinksController');
const { authorize } = require('../../middleware/authMiddleware');

// Temporarily disable authentication for demo purposes
// TODO: Re-enable authentication when admin accounts are set up
// router.use(authorize(['admin']));

// GET all social links
router.get('/', socialLinksController.getAllSocialLinks);

// GET single social link by ID
router.get('/:id', socialLinksController.getSocialLinkById);

// POST create new social link
router.post(
  '/',
  [
    check('platform', 'Platform name is required').not().isEmpty(),
    check('url', 'Valid URL is required').isURL(),
    check('displayName', 'Display name is required').not().isEmpty(),
    check('icon', 'Icon is optional').optional(),
    check('isActive', 'isActive must be a boolean').optional().isBoolean(),
    check('sortOrder', 'sortOrder must be a number').optional().isNumeric()
  ],
  socialLinksController.createSocialLink
);

// PUT update social link
router.put(
  '/:id',
  [
    check('platform', 'Platform name is required').optional().not().isEmpty(),
    check('url', 'Valid URL is required').optional().isURL(),
    check('displayName', 'Display name is required').optional().not().isEmpty(),
    check('icon', 'Icon is optional').optional(),
    check('isActive', 'isActive must be a boolean').optional().isBoolean(),
    check('sortOrder', 'sortOrder must be a number').optional().isNumeric()
  ],
  socialLinksController.updateSocialLink
);

// DELETE social link
router.delete('/:id', socialLinksController.deleteSocialLink);

module.exports = router;