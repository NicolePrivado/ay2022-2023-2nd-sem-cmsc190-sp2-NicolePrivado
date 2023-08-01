const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const router = require('./router');

exports.start = () => {
    
    const app = express()
    app.use(express.json())
    app.use(cookieParser())
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'https://localhost:3000', 'http://localhost:8081', 'https://localhost:8081', 'https://uplb-cns.onrender.com'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONSS',
        allowedHeaders: ['Content-Type','Authorization','Origin','Accept','X-Requested-With','Access-Control-Request-Method','Access-Control-Request-Headers']
    }))
    app.use(express.urlencoded({ extended: true }))
    
    app.use('/', router);

    app.listen(3001, (err) => {
        if (err) { console.log(err) }
        else {
        console.log('Server is running.')}
    })
    
}