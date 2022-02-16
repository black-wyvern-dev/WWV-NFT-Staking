import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';

process.env.ANCHOR_WALLET = __dirname + '\\..\\wallet.json';

console.log(process.env.ANCHOR_WALLET);
import { getStakedNFTsFromWallet } from './script';

const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
app.get('/staked-nfts/*', async (req, res) => {
  const address = req.params[0];
  if (!address) res.status(404).send('Invalid address');
  else {
    console.log(address);
    const result = await getStakedNFTsFromWallet(address as string);
    console.log(result);
    if (!result) res.status(502).send('Internal server error');
    else res.send(result);
  }
});

server.listen(8080, async () => {
  console.log('--@ Start: Listening on http://localhost:8080');
});
