/**
 * Article routes for handling CRUD operations on article entities
 * 
 * This module defines API endpoints for creating, reading, updating, and deleting
 * article documents in the MongoDB database.
 */
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');

/**
 * @route   GET /api/articles
 * @desc    Get all articles with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', articleController.getAllArticles);

/**
 * @route   GET /api/articles/:id
 * @desc    Get a single article by ID
 * @access  Public
 */
router.get('/:id', articleController.getArticleById);

/**
 * @route   POST /api/articles
 * @desc    Create a new article
 * @access  Public
 */
router.post('/', articleController.createArticle);

/**
 * @route   PUT /api/articles/:id
 * @desc    Update an existing article
 * @access  Public
 */
router.put('/:id', articleController.updateArticle);

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete an article
 * @access  Public
 */
router.delete('/:id', articleController.deleteArticle);

/**
 * @route   GET /api/articles/search
 * @desc    Search articles by keyword
 * @access  Public
 */
router.get('/search', articleController.searchArticles);

/**
 * @route   GET /api/articles/topic/:topicId
 * @desc    Get articles by topic ID
 * @access  Public
 */
router.get('/topic/:topicId', articleController.getArticlesByTopic);

/**
 * @route   GET /api/articles/category/:categoryId
 * @desc    Get articles by category ID
 * @access  Public
 */
router.get('/category/:categoryId', articleController.getArticlesByCategory);

/**
 * @route   GET /api/articles/event/:eventId
 * @desc    Get articles by event ID
 * @access  Public
 */
router.get('/event/:eventId', articleController.getArticlesByEvent);

/**
 * @route   GET /api/articles/priority
 * @desc    Get priority articles
 * @access  Public
 */
router.get('/priority', articleController.getPriorityArticles);

/**
 * @route   GET /api/articles/unread
 * @desc    Get unread articles
 * @access  Public
 */
router.get('/unread', articleController.getUnreadArticles);

module.exports = router;
