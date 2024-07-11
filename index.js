const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Configurar o body-parser para processar requisições JSON
app.use(bodyParser.json());

// Rota para receber webhooks de e-mail
app.post('/email', (req, res) => {
  
  const emailData = req.body;

  // Faça alguma ação com o e-mail recebido
  console.log('Novo e-mail recebido:', emailData);

  // Enviar uma resposta ao serviço de e-mail
  res.status(200).send('E-mail recebido com sucesso!');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
