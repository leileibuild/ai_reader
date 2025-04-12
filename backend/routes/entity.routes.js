/**
 * Consolidated entity routes for handling operations on topics, categories, events, and notes
 * 
 * This module defines API endpoints for creating, reading, updating, and deleting
 * multiple entity types in the MongoDB database using a single API.
 */
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entity.controller');

/**
 * @route   POST /api/entities
 * @desc    Create or update multiple entities (topics, categories, events, notes) in a single request
 * @access  Public
 * 
 * Request body can contain any combination of:
 * - topics: array of topic objects to create/update
 * - categories: array of category objects to create/update
 * - events: array of event objects to create/update
 * - notes: array of note objects to create/update
 */
router.post('/', entityController.createOrUpdateEntities);

/**
 * @route   GET /api/entities
 * @desc    Get multiple entities by their IDs
 * @access  Public
 * 
 * Query parameters:
 * - topicIds: comma-separated list of topic IDs
 * - categoryIds: comma-separated list of category IDs
 * - eventIds: comma-separated list of event IDs
 * - noteIds: comma-separated list of note IDs
 */
router.get('/', entityController.getEntities);

/**
 * @route   DELETE /api/entities
 * @desc    Delete multiple entities by their IDs
 * @access  Public
 * 
 * Request body:
 * - topicIds: array of topic IDs to delete
 * - categoryIds: array of category IDs to delete
 * - eventIds: array of event IDs to delete
 * - noteIds: array of note IDs to delete
 */
router.delete('/', entityController.deleteEntities);

/**
 * @route   GET /api/entities/topics
 * @desc    Get all topics with optional filtering
 * @access  Public
 */
router.get('/topics', entityController.getAllTopics);

/**
 * @route   GET /api/entities/categories
 * @desc    Get all categories with optional filtering
 * @access  Public
 */
router.get('/categories', entityController.getAllCategories);

/**
 * @route   GET /api/entities/events
 * @desc    Get all events with optional filtering
 * @access  Public
 */
router.get('/events', entityController.getAllEvents);

/**
 * @route   GET /api/entities/notes
 * @desc    Get all notes with optional filtering
 * @access  Public
 */
router.get('/notes', entityController.getAllNotes);

/**
 * @route   GET /api/entities/search
 * @desc    Search across all entity types
 * @access  Public
 * 
 * Query parameters:
 * - q: search query
 * - types: comma-separated list of entity types to search (topics,categories,events,notes)
 */
router.get('/search', entityController.searchEntities);

module.exports = router;
