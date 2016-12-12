const express = require('express');

const app = express();
const router = express.Router();

router.use('/', (req, res) => {
	res.json({ message: "IT'S WORKING!" });
});

app.use('/api/v1', router);

app.listen(3000, () => {
    console.log('Honesty store API app is listening on port 3000');
});