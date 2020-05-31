/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const expect = require('chai').expect
const MongoClient = require('mongodb')
const fetch = require('node-fetch')
const mongoose = require('mongoose')

const CONNECTION_STRING = process.env.DB //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const stockSchema = new mongoose.Schema({
  stock: String,
  likes: [String]
})

const Stock = mongoose.model('stock', stockSchema)

const getPrice = async (stock) => {
  const response =
    await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)
  const json = await response.json()
  return json.latestPrice
}

const getLikes = async (stock) => {
  const doc = await Stock.findOne({ stock })
  return !doc || !doc.get('likes') ? 0 : doc.get('likes').length
}

const getData = async (stock) => {
  if (Array.isArray(stock)) {
    const stocks = stock.map(async st => {
      const results = await Promise.all([getPrice(st), getLikes(st)])
      return {
        stock: st,
        price: results[0],
        likes: results[1]
      }
    })
    const results = await Promise.all(stocks)
    const diff = Math.abs(results[0].likes - results[1].likes)
    return results.map(stock => ({ ...stock, rel_likes: diff }))
  } else {
    const results = await Promise.all([getPrice(stock), getLikes(stock)])
    return { stock, price: results[0], likes: results[1] }
  }
}

const setLike = async (stock, ip) => {
  if (Array.isArray(stock)) {
    stock.forEach(async st =>
      await Stock.findOneAndUpdate(
        { stock: st },
        { $addToSet: { likes: ip } },
        { upsert: true })
    )
  } else {
    await Stock.findOneAndUpdate(
      { stock },
      { $addToSet: { likes: ip } },
      { upsert: true })
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query
      try {
        if (like) await setLike(stock, req.ip)
        const data = await getData(stock)
        res.json(data)
      } catch (error) {
        console.error(error)
        res.sendStatus(500)
      }
    })
}
