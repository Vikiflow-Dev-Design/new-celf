const express = require('express');
const router = express.Router();
const { check, query } = require('express-validator');
const youtubeController = require('../controllers/youtubeController');
const { authorize } = require('../middleware/authMiddleware');

// Public routes for fetching YouTube content

/**
 * @route GET /api/youtube/videos
 * @desc Get latest YouTube videos
 * @access Public
 */
router.get(
  '/videos',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('forceRefresh')
      .optional()
      .isBoolean()
      .withMessage('forceRefresh must be a boolean'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],
  youtubeController.getLatestVideos
);

/**
 * @route GET /api/youtube/videos/popular
 * @desc Get popular YouTube videos (sorted by view count)
 * @access Public
 */
router.get(
  '/videos/popular',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  youtubeController.getPopularVideos
);

/**
 * @route GET /api/youtube/videos/:videoId
 * @desc Get specific YouTube video by ID
 * @access Public
 */
router.get(
  '/videos/:videoId',
  [
    check('videoId')
      .isLength({ min: 11, max: 11 })
      .withMessage('Invalid YouTube video ID format')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Video ID contains invalid characters')
  ],
  youtubeController.getVideoById
);

/**
 * @route GET /api/youtube/search
 * @desc Search YouTube videos on the channel
 * @access Public
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  youtubeController.searchVideos
);

/**
 * @route GET /api/youtube/channel
 * @desc Get YouTube channel information
 * @access Public
 */
router.get('/channel', youtubeController.getChannelInfo);

/**
 * @route GET /api/youtube/test
 * @desc Test YouTube API connection
 * @access Public (temporarily for demo - should be admin only)
 */
router.get('/test', youtubeController.testConnection);

// Admin routes (temporarily public for demo purposes)
// TODO: Re-enable authentication when admin accounts are set up

/**
 * @route POST /api/youtube/refresh
 * @desc Manually refresh YouTube video cache
 * @access Admin (temporarily public)
 */
router.post(
  '/refresh',
  // authorize(['admin']), // TODO: Uncomment when admin auth is ready
  [
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  youtubeController.refreshCache
);

module.exports = router;