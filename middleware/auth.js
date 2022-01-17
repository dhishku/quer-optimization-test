const jwt = require('jsonwebtoken');
const config = require('config');

const { Trader } = require('../models/trader');


const auth = async (req, res, next) => {
  const token = req.header('user-access-token');
  if (!token) return res.status(403).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.decodedToken = decoded;

    return next();
  } catch (error) {
    return res.status(403).send(error.message);
  }
};

module.exports = auth;
