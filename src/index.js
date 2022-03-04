const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


//allow to run code, when client connected to server
//CONNECTION
io.on('connection', (socket) => { 
        console.log('New WebSocket connection') 


//JOIN /ROOM
        socket.on('join', (options, callback) => {
           const {error, user} =  addUser({id: socket.id, ...options})
            if(error){
                return callback(error)
            }
            socket.join(user.room)

        //to send a particular connection .emit 
        socket.emit('message', generateMessage('Admin: ',`Welcome! ${user.username}`)) 
        //to send 'message' to everyone, but paticular connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin:',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

        })


 //send 'message' to everyone
        socket.on('sendMessage', (message, callback) => {  
            const user = getUser(socket.id)

            //bad-words
            const filter = new Filter()
            if(filter.isProfane(message)){
                return callback('Profanity is not allowed')
            }

            io.to(user.room).emit('message', generateMessage(user.username, message))   
            callback()
        })
//share LOCATION
        socket.on('shareLocation',(coords, callback)=>{
            const user = getUser(socket.id)

            io.to(user.room).emit('locationMessage',generateLocationMessage (user.username,`https://google.com/maps?=${coords.latitude},${coords.longitude}`))
            callback()
        })
   


        //to send 'message' to everyone, but particular connection
//DISCONNECT
        socket.on('disconnect', ()=>{
           const user = removeUser(socket.id)

           if(user){
                io.to(user.room).emit('message', generateMessage('Admin:',`${user.username} has left!`))
                io.to(user.room).emit('roomData', {
                    room:user.room,
                    users:getUsersInRoom(user.room)
                })
           }
        })
})

server.listen(port, ()=> {
    console.log(`Server is up on portt ${port}! `)
    if(!port)
    throw new Error('there is no port')
})



//stop PORT 3000 to stop working by keep opening a new terminal 

process.on('SIGINT', () => { 
    console.log('exiting safely');
    process.exit();
})


//we sent events from server to client using 3 methods 
//1. socket.emit => send an event to a specific client
//2. socket.io => sends an event to every connected client 
//3. socket.broadcast emit =>send an events to every cnnected client, except socket

//introduction of Room, use 2 set up for emitting messages 
//1. variation of io.emit ==> io.to().emit() -->emit an event to everyone in specific room 
//2. variation of socket.broadcast.emit  ==>socket.broadcast.to().emit() --> send an event to everyone expect for specific client, 
//  limiting to specific chat room 

// //emit = กระจาย ปล่อย 
// //server (emit) --> client (receive) - countUpdated
// //client (emit) --> server (receive) - increment
