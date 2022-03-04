const users = []   //keep track on users in array 


//addUser ==> allow to track a new user
//removeUser ==>stop track a user when leave the room 
//getuser ==> allow to fetch an exiting users data 
//getUsersInRoom ==> allow to get a complate list of all the users in a specific room 

const addUser = ({id, username, room}) => {
    //Clean the data 
    username = username.trim()
    room = room.trim().toLowerCase()

    //validate the data 
    if(!username || !room){
        return {
            error:'Username and room are required!'
        }
    }

    //Check for existing user 
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate usename 
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //store user into user array
    const user = {id, username, room}
    users.push(user)
    return {user}

}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index,1)[0] //remove the index and only 1 item, then back to index 1 [0]
        //-1 for not match
        //0 || > or greater if Match 

    }

}

const getUser = (id) => {
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
   
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

