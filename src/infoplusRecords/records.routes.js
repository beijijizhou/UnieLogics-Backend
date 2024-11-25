const express = require('express');
const recordsController = require('./records.controller');
const router = express.Router();

router.post('/add', recordsController.addRecord);
router.get('/all', recordsController.getAllRecords);
router.put('/update', recordsController.updateRecord);
router.delete('/delete', recordsController.deleteRecord);

module.exports = router;
