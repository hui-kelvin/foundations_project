const express = require('express');
const router = express.Router();

//import router

router.get('/',(req,res) => {
    res.send("Hello World!");

});

module.exports = router;

