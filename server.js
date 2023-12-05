require('dotenv').config();
require('./schema/index');
const app = require('./router');
const PORT = 8000;

app.listen(PORT, (req, res) => {
    console.log("Server listening on port", PORT);
})
