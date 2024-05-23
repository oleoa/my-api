const http = require('http');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PORT } = process.env;
const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/anyrent') {
    try {
      const result = await pool.query('SELECT * FROM anyrent');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
    }
  } else if (req.method === 'POST' && req.url === '/anyrent') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { debug } = JSON.parse(body);
      try {
        const result = await pool.query(
          'INSERT INTO anyrent (debug) VALUES ($1) RETURNING *',
          [debug]
        );
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
