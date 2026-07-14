require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

//rutas
const auth_middleware = require('./middleware/auth');
const logginRoutes = require('./routes/login');
const personRoutes = require('./routes/person')

app.use(cors());
app.use(express.json());

app.use('/api/login', logginRoutes);

app.use('/api/persons', auth_middleware, personRoutes);

app.listen(process.env.API_PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.API_PORT}`)
})