const express = require('express');
require('dotenv').config();

const auth = require('./middleware/auth');
const { formatPortfolioResponse } = require('./utils/portfolioResponse');
const { Trader } = require('./models/trader');
const { connect } = require('./utils/dbConnect');
const { SortedPortfolioArray } = require('./models/sortedPortfolioArray');
const { PortfolioProgress } = require('./models/portfolioProgress');
connect();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});
app.get('/authToken', async (req, res) => {
  const trader = await Trader.findOne({name: 'Gaurav Agrawal'});
  return res.status(200).send(trader.generateAuthToken());
});
app.get('/welcome', [auth], async (req, res) => {

  const trader = await Trader.findById(req.decodedToken._id)
    .populate({
      path: 'myPortfolios',
      populate: {
        path: 'myFollowersLog orderGroups.orders trader portfolioProgress'
      }
    });
  if (!trader) {
    return res.status(404).send('Trader not found.');
  }

  const getPortfolios = (groupName) => SortedPortfolioArray.findOne({ name: groupName })
  .populate({
    path: 'sortedPortfolios',
    populate: [
      { path: 'portfolioProgress' },
      { path: 'trader', select: '_id name profilePicUrl' }
    ]
  });
  const countPortfolios = async (groupName) => (await SortedPortfolioArray.findOne({ name: groupName }))?.sortedPortfolios.length || 0;

  const bestEquity = await getPortfolios('bestEquity');
  const bestEquityCount = await countPortfolios('bestEquity');
  const formattedBestEquity = [];
  for (i = 0; i < bestEquity.sortedPortfolios.length; i++) {
    formattedBestEquity.push(await formatPortfolioResponse(bestEquity.sortedPortfolios[i], trader));
  }
  const response = {
    bestEquity: formattedBestEquity,
    bestEquityCount
  };
  // console.timeEnd('bestportfolios');
  return res.send(response);
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

module.exports = { app };
