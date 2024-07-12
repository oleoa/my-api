// EMAIL AND SERVER
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
require('dotenv').config();

// NOTION
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Rota para receber webhooks de e-mail
app.post('/email', (req, res) => {
  
  const emailData = req.body;

  // Faça alguma ação com o e-mail recebido
  console.log('Novo e-mail recebido:', emailData);

  // Month - Day - Year  Hour : Minute
  const event = new Date('12-07-2024 14:48');

  (async () => {
    const response = await notion.pages.create({
      "parent": {
        "type": "database_id",
        "database_id": "7107291622514df2ac798e53e3291541"
      },
      "properties": {
          "Reserva": {
            "type": "title",
            "title": [{ "type": "text", "text": { "content": "#2412" } }]
          },
          "Data": {
            "type": "date",
            "date": { "start": event.toISOString() }
          }
      }
  });
    console.log(response);
  })();

  res.status(200).send('E-mail recebido com sucesso!');  
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
