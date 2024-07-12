// EMAIL AND SERVER
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
require('dotenv').config();

// NOTION
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// GET ANYRENT INFORMATION
const axios = require('axios');

// Rota para receber webhooks de e-mail
app.post('/email', (req, res) => {
  
  // Recebe o ID da nova reserva
  const idReserva = req.body.id;

  // Pede informações ao anyrent
  axios.get('https://achieverac.api.anyrent.pt/v1/bookings/'+idReserva+'?api_key='+process.env.ANYRENT_API_KEY)
    .then(response => {

      // Se existir, cria tres novas linhas na base de dados notion (lavagem, entrega e recolha)
      let reservation = response.data;
      console.log(reservation);

      let localTranslator = {
        "aeroporto": "Aeroporto",
        "funchal": "Funchal",
        "santa-cruz": "Santa Cruz",
        "porto-moniz": "Porto Moniz",
        "sao-vicente": "São Vicente",
        "santana": "Santana",
        "calheta": "Calheta",
        "ponta-do-sol": "Ponta do Sol",
        "ribeira-brava": "Ribeira Brava",
        "camara-de-lobos": "Câmara de Lobos",
        "machico": "Machico",
        "canico": "Caniço"
      };

      (async () => {
        const response = await notion.pages.create({
          "parent": {
            "type": "database_id",
            "database_id": "7107291622514df2ac798e53e3291541"
          },
          "properties": {
              "Reserva": {
                "type": "title",
                "title": [{ "type": "text", "text": { "content": '#'+reservation.booking_nr } }]
              },
              "Operação": {
                "type": "select",
                "select": { "name": "Entrega" }
              },
              "Data": {
                "type": "date",
                "date": { "start": new Date(reservation.pickup_date).toISOString() }
              },
              "Local": {
                "type": "select",
                "select": { "name": localTranslator[reservation.pickup_station] }
              },
              "Anyrent": {
                "type": "url",
                "url": "https://www.twilio.com/en-us/blog/manipulate-notion-database-using-node-js"
              }
          }
      });
        console.log(response);
      })();
    })
    .catch(error => {
      console.error('Error making GET request:', error);
    });

  res.status(200).send('Reserva recebida com sucesso! '+idReserva);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
