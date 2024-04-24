const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Server } = require("socket.io");
const cors = require('cors');
const http = require("http");


//mongoose
const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
//To test on postman
const bodyParser = require('body-parser');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/Users/users');
const adminRouter = require('./routes/Admin/admin');
const articleRouter = require('./routes/Articles/articles');
const SaveMessage = require('./routes/Users/SaveMessage');
const GetMessage = require('./routes/Users/GetMessage');

const app = express();

// Config Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
const usersInRooms = {};

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  // Listen for 'join_room' event
  socket.on('join_room', async (data) => {
    const { userId, name, department, email } = data;

    // Check if userId already exists in the room
    if (usersInRooms[department] && usersInRooms[department].includes(userId)) {
      // User with the same userId already exists in the room
      socket.emit('join_room_error', { message: 'User with the same userId is already in the room.' });
      return;
    }

    // Join the user to the room
    socket.join(department);

    // Store the userId in the usersInRooms object
    if (!usersInRooms[department]) {
      usersInRooms[department] = [];
    }
    usersInRooms[department].push({ userId, socketId: socket.id, name, email });

    // Emit updated list of users in the department to all users in the room
    io.to(department).emit('chatroom_users', usersInRooms[department]);

    // Send welcome message to all users in the room
    let createdTime = Date.now();
    io.to(department).emit('receive_message', {
      message: `${name} has joined the chat room`,
      username: CHAT_BOT,
      createdTime,
    });

    // Send last 100 messages to the user who just joined
    try {
      const last100Messages = await GetMessage(department);
      socket.emit('last_100_messages', last100Messages);
    } catch (error) {
      console.error('Error fetching last 100 messages:', error);
    }
  });

  // Listen for 'send_message' event
  socket.on('send_message', async (data) => {
    const { name, email, department, message, createdTime } = data;
    io.in(department).emit('receive_message', data); // Send to all users in room, including sender
    try {
      await SaveMessage(name, email, department, message, createdTime); // Save message in db
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Listen for 'leave_room' event
  socket.on('leave_room', ({ userId, department }) => {
    // Remove the user from the room's user list
    if (usersInRooms[department]) {
      usersInRooms[department] = usersInRooms[department].filter((user) => user.userId !== userId);
    }

    // Emit an event to notify other users in the room about the departure
    socket.to(department).emit('user_left', { userId });

    // Leave the room
    socket.leave(department);
  });

  // Disconnect event handler
  socket.on('disconnect', () => {
    console.log(`User disconnected ${socket.id}`);
    
    // Loop through all rooms
    for (const room in usersInRooms) {
      if (usersInRooms.hasOwnProperty(room)) {
        // Remove the disconnected user from all rooms
        usersInRooms[room] = usersInRooms[room].filter((user) => user.socketId !== socket.id);
        // Notify other users in the room about the user's disconnection
        io.to(room).emit('user_left', { userId: socket.id });
        // Notify other users in the room about the user's disconnection
        let user = usersInRooms[room].find(user => user.socketId === socket.id);
        if(user){
          io.to(room).emit('receive_message', {
            message: `${user.name} has left the chat room`,
            username: CHAT_BOT,
            createdTime: Date.now(),
          });
        }
      }
    }
  });
});



//cors
app.use(cors())
mongoose.connect("mongodb+srv://nguyenthanhhungthcneu:GQl4XwL687XLQjBy@cluster0.wqgufee.mongodb.net/WebProject")
.then(()=>console.log("ok"))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/articles', articleRouter);



app.use('/images', express.static(path.join(__dirname, 'public/Images')));
app.use('/pdfs', express.static(path.join(__dirname, 'public/PDFs')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//To test on postman
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.json());

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

port = process.env.PORT || 5000
// app.listen(port)

// module.exports = app;
server.listen(port, () => 'Server is running on port 5000');
module.exports = app