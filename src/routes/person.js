const express = require('express');
const db = require('../config/database');
const paginate = require('../helpers/pagination');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await paginate('PERSON', req.query)
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' })
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [person] = await db.query('SELECT * FROM PERSON WHERE ID = ?', [id])

        if (person.length === 0) {
            return res.status(404).json({ message: 'Persona no encontrada' })
        }

        const [credentials] = await db.query('SELECT * FROM EDUCATIONAL_CREDENTIALS WHERE PERSON_ID = ?', [id]);

        res.json({
            ...person[0],
            credentials: credentials
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' })
    }

});

router.post('/', async (req, res) => {
    try {
        const { NIT, NAME_PERSON, ADDRESS_PERSON, PHONE_NUMBER, credentials } = req.body;

        if (!NIT || !NAME_PERSON || !ADDRESS_PERSON || !PHONE_NUMBER) {
            return res.status(400).json({ message: 'Todos los campos requeridos' })
        }

        if (!credentials || credentials.length === 0) {
            return res.status(400).json({ message: 'Debe agregar al emnos una credencial' })
        }

        const [personResult] = await db.query('INSERT INTO PERSON (NIT, NAME_PERSON, ADDRESS_PERSON, PHONE_NUMBER) VALUES (?, ?, ?, ?)',
            [NIT, NAME_PERSON, ADDRESS_PERSON, PHONE_NUMBER]
        );

        const personId = personResult.insertId;

        for (const cred of credentials) {
            await db.query('INSERT INTO EDUCATIONAL_CREDENTIALS (PERSON_ID, TYPE_CREDENTIAL, ORGANIZATION, ACQUIRED_CREDENTIAL, YEAR_CREDENTIAL) VALUES (?, ?, ? ,? ,?)',
                [personId, cred.TYPE_CREDENTIAL, cred.ORGANIZATION, cred.ACQUIRED_CREDENTIAL, cred.YEAR_CREDENTIAL]
            );
        }

        const [newPerson] = await db.query('SELECT * FROM PERSON WHERE ID = ?', [personId]);
        const [newcredentials] = await db.query('SELECT * FROM EDUCATIONAL_CREDENTIALS WHERE PERSON_ID = ?', [personId])

        res.status(201).json({
            ...newPerson[0],
            credentials: newcredentials
        });
    } catch (error) {
        console.error(error);
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({message: 'El NIT ya existe'})
        }
        res.status(500).json({message: 'Error del servidor'})
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME_PERSON, ADDRESS_PERSON, PHONE_NUMBER, credentials } = req.body;

        const [existing] = await db.query('SELECT * FROM PERSON WHERE ID = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        if (!NAME_PERSON || !ADDRESS_PERSON || !PHONE_NUMBER) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (!credentials || credentials.length === 0) {
            return res.status(400).json({ message: 'Debe agregar al menos una credencial' });
        }

        await db.query(
            'UPDATE PERSON SET NAME_PERSON = ?, ADDRESS_PERSON = ?, PHONE_NUMBER = ? WHERE ID = ?',
            [NAME_PERSON, ADDRESS_PERSON, PHONE_NUMBER, id]
        );

        await db.query('DELETE FROM EDUCATIONAL_CREDENTIALS WHERE PERSON_ID = ?', [id]);

        for (const cred of credentials) {
            await db.query(
                'INSERT INTO EDUCATIONAL_CREDENTIALS (PERSON_ID, TYPE_CREDENTIAL, ORGANIZATION, ACQUIRED_CREDENTIAL, YEAR_CREDENTIAL) VALUES (?, ?, ?, ?, ?)',
                [id, cred.TYPE_CREDENTIAL, cred.ORGANIZATION, cred.ACQUIRED_CREDENTIAL, cred.YEAR_CREDENTIAL]
            );
        }

        const [updatedPerson] = await db.query('SELECT * FROM PERSON WHERE ID = ?', [id]);
        const [updatedCredentials] = await db.query('SELECT * FROM EDUCATIONAL_CREDENTIALS WHERE PERSON_ID = ?', [id]);

        res.json({
            ...updatedPerson[0],
            credentials: updatedCredentials
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM PERSON WHERE ID = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        await db.query('DELETE FROM EDUCATIONAL_CREDENTIALS WHERE PERSON_ID = ?', [id]);
        await db.query('DELETE FROM PERSON WHERE ID = ?', [id]);

        res.json({ message: 'Persona eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;

