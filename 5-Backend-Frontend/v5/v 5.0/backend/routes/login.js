import { Router } from "express";
import pool from "../db";

const router = Router();

router.get('/', async (req, res) =>{
    try{
        const [rows] = await pool.query( 
            'SELECT * FROM usuario WHERE email = ?', 
            [req.params.email]
        );
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

