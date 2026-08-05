const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta del archivo CSV dentro del contenedor
const DATA_FILE = path.join(__dirname, 'data', 'ventas.csv');

// Crear la carpeta /data y el archivo CSV si no existen
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    const headers = 'ID,Fecha_Hora,Producto,Categoria,Cantidad,Monto,Metodo_Pago\n';
    fs.writeFileSync(DATA_FILE, headers, 'utf8');
}

app.post('/registrar', (req, res) => {
    const { producto, categoria, cantidad, monto, metodo } = req.body;
    const id = Date.now().toString().slice(-4);
    const now = new Date();
    const fechaHora = now.toISOString().replace('T', ' ').substring(0, 19);

    const nuevaFila = `${id},${fechaHora},"${producto}","${categoria}",${cantidad},${parseFloat(monto).toFixed(2)},"${metodo}"\n`;

    fs.appendFile(DATA_FILE, nuevaFila, (err) => {
        if (err) {
            console.error('Error al guardar:', err);
            return res.status(500).send('Error interno');
        }
        console.log(`Venta registrada: ID ${id} - ${producto}`);
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});