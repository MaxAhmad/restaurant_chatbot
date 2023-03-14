const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const restuarant = {
  name: 'GoodFellas',
  menu: ['Vegetable Salad', 'Corn', 'Ewa', 'Agbado', 'Casava', 'Garri', 'Rice'],
  price: [2300, 800, 900, 1100, 1500, 1200, 2800]
}

const orders = [];
const orderHistory = []

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.emit("connected", "connected to backend server");

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });

  socket.emit("order", restuarant.menu);

  socket.on("order_requested", (data) => {
    const { orderId, orderItem } = data;
    const menuItemindex = restuarant.menu.indexOf(orderItem)
    itemPrice = restuarant.price[menuItemindex]
    const order = { orderId, orderItem, itemPrice};
    orders.push(order);
    console.log(`customer requested ${orderItem}`);
    socket.emit("processing_order", {
      message: `Your ${orderItem} is been processed`,
      id: orderId,
      order
    });
  });

  socket.on('order_confirmed', (data) =>{
    const {action, confirmedOrder} = data
    orderHistory.push(confirmedOrder)
    console.log(orderHistory)
    if(action === 'confirmed order'){
      socket.emit('order_history', orderHistory)
    }
    socket.emit('current_order', confirmedOrder)
  })
});

server.listen(5500, () => {
  console.log("listening on *:5500");
});
