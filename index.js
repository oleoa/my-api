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

      let vehicleTranslator = {
        "a1": "Panda",
        "a2": "Up",
        "a3": "500",
        "b1": "Spacestar",
        "c1": "Clio",
        "c2": "Sandero"
      };

      let cadeiras = 0;
      let assentos = 0;
      if(reservation.optionals.extras)
        reservation.optionals.extras.forEach(extra => {
          if(extra.code == "cadeira")
            cadeiras = extra.quantity;
          if(extra.code == "assento")
            assento = extra.quantity;
        });

      (async () => {

        let lavagem = await notion.pages.create({
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
                "select": { "name": "Lavagem" }
              },
              "Grupo": {
                "type": "select",
                "select": { "name": vehicleTranslator[reservation.group] }
              },
              "Data": {
                "type": "date",
                "date": { "start": reservation.pickup_date.split(" ")[0] }
              },
              "Local": {
                "type": "select",
                "select": { "name": "Casa" }
              },
              "Anyrent": {
                "type": "url",
                "url": "https://achieverac.s12.anyrent.pt/app/jedeye/anyrent/reservations/update/"+reservation.booking_nr
              },
              "Cadeiras": {
                "type": "number",
                "number": cadeiras
              },
              "Assentos": {
                "type": "number",
                "number": assentos
              },
          }
        });

        let entrega = await notion.pages.create({
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
              "Grupo": {
                "type": "select",
                "select": { "name": vehicleTranslator[reservation.group] }
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
                "url": "https://achieverac.s12.anyrent.pt/app/jedeye/anyrent/reservations/update/"+reservation.booking_nr
              },
              "Envio": {
                "type": "url",
                "url": "https://wa.me/"+reservation.customer.phone+"?text=Ol%C3%A1%2C%20tudo%20bem%3F%0ASou%20o%20Leonardo%2C%20da%20Achieve%20Rent%20a%20Car.%0ATemos%20programada%20a%20entrega%20de%20um%20carro%20para%20si%20hoje%20%2F%20amanh%C3%A3%20%C3%A0s%2010%3A00%20no%20aeroporto.%0APodemos%20confirmar%3F"
              },
              "Voo": {
                "type": "url",
                "url": "https://www.flightaware.com/live/flight/"+reservation.arrival_flight
              },
              "Cadeiras": {
                "type": "number",
                "number": cadeiras
              },
              "Assentos": {
                "type": "number",
                "number": assentos
              },
          }
        });

        let recolha = await notion.pages.create({
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
                "select": { "name": "Recolha" }
              },
              "Grupo": {
                "type": "select",
                "select": { "name": vehicleTranslator[reservation.group] }
              },
              "Data": {
                "type": "date",
                "date": { "start": new Date(reservation.dropoff_date).toISOString() }
              },
              "Local": {
                "type": "select",
                "select": { "name": localTranslator[reservation.dropoff_station] }
              },
              "Anyrent": {
                "type": "url",
                "url": "https://achieverac.s12.anyrent.pt/app/jedeye/anyrent/reservations/update/"+reservation.booking_nr
              },
              "Envio": {
                "type": "url",
                "url": "https://wa.me/"+reservation.customer.phone+"?text=Ol%C3%A1%2C%20tudo%20bem%3F%0ASou%20o%20Leonardo%2C%20da%20Achieve%20Rent%20a%20Car.%0ATemos%20programada%20a%20entrega%20de%20um%20carro%20para%20si%20hoje%20%2F%20amanh%C3%A3%20%C3%A0s%2010%3A00%20no%20aeroporto.%0APodemos%20confirmar%3F"
              },
              "Voo": {
                "type": "url",
                "url": "https://www.flightaware.com/live/flight/"+reservation.departure_flight
              },
              "Cadeiras": {
                "type": "number",
                "number": cadeiras
              },
              "Assentos": {
                "type": "number",
                "number": assentos
              },
          }
        });

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
