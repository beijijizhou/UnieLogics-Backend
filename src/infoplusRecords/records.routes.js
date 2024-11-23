const express = require('express');
const recordsController = require('./records.controller');
const router = express.Router();

router.post('/add', recordsController.addRecord);
router.get('/all', recordsController.getAllRecords);
router.put('/update', recordsController.updateRecord);
router.delete('/delete', recordsController.deleteRecord);

// Test endpoints only for test for now
router.get('/api/:searchModule/search', recordsController.searchInfoPlusRecords);
router.get('/api/:searchModule/searchByFilters', recordsController.searchInfoPlusRecordsByFilters);
router.get('/api/create', recordsController.createInfoPlusRecords);
router.get('/api/update', recordsController.updateInfoPlusRecords);
router.get('/api/get', recordsController.getInfoPlusRecords);
router.get('/api/delete', recordsController.deleteInfoPlusRecords);

module.exports = router;
