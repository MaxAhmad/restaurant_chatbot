const express = require("express");
const app = express();
const http = require("http");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env'});
const logger = require("./logging/logger")

const restuarantDb = require('./database/db')

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

// Serving static files
app.use(express.static(`${__dirname}/public`));

const orders = [];
const orderHistory = []

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  logger.info("client connected", socket.id);

  socket.emit("connected", "connected to backend server");

  socket.on("disconnect", () => {
    logger.info("client disconnected", socket.id);
  });

  // emit restuarant menu
  socket.emit("order", restuarantDb.menu);

  // Receive customer's order event
  socket.on("order_requested", (data) => {
    const { orderItem } = data;
    const menuItemindex = restuarantDb.menu.indexOf(orderItem)
    itemPrice = restuarantDb.price[menuItemindex]
    const order = { orderItem, itemPrice};
    orders.push(order);
    logger.info(`customer requested ${orderItem}`);
    socket.emit("processing_order", {
      message: `Your ${orderItem} is been processed, Please proceed to checkout your order`,
      order
    });
  });

  // Receive order confimation event
  socket.on('order_confirmed', (data) =>{
    const {action, confirmedOrder} = data
    orderHistory.push(confirmedOrder)
    if(action === 'confirmed order'){
      socket.emit('order_history', orderHistory)
    }
    socket.emit('current_order', confirmedOrder)
  })

  // Receive cancelled event
  socket.on("order_cancelled", (data) => {
    const {message} = data
    logger.info(message)
  })
});

const port = process.env.PORT

server.listen(port, () => {
  logger.info(`listening on *:${port}`);
});
