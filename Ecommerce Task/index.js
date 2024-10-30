const express = require("express");
const connectToMongooseDb = require('./utils/connect');
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const socketio = require("socket.io");
const http = require("http");


const loggingMiddleware = require("./middlewares/loggingMiddleware");
const errorHandler = require("./middlewares/errorHandler");
const limiter = require("./middlewares/ratelimitMiddleware");

dotenv.config();

const app = express();

const server = http.createServer(app); // HTTP server to integrate socket.io
const io = socketio(server); // Initializing socket.io

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

// Use custom logging middleware
loggingMiddleware(app);





// Socket.io connection confirmation
io.on('connection', (socket) => {
    console.log("User connected");

    socket.on('disconnect', () => {
        console.log("User Disconnected");
    });
});
  
  

// Routes Import
const authRoute= require("./routes/auth.route");
const userRoute= require("./routes/user.route");
const productRoute= require("./routes/product.route");
const orderRoute= require("./routes/order.route");

// API collection
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/order", orderRoute(io));

app.use(errorHandler);


connectToMongooseDb();
app.use(express.static('public'));



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});


module.exports =app;