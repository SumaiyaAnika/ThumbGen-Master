require('dotenv').config();
const { reverseBrainstorm } = require('./controllers/creatorlens.controller');


const req = {
    body: {
        image: 'data:image/png;base64,iBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
};

const res = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('Status:', this.statusCode, 'Data:', data);
    }
};

reverseBrainstorm(req, res).catch(console.error);
