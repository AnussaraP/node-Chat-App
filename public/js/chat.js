const socket = io()

//Element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#share-location')

const $messages =document.querySelector("#messages")


//template or message on screen
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New Message element 
    const $newMessage = $messages.lastElementChild

    //get heigh of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.scrollMarginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height 
    const visibleHeight = $messages.offsetHeight

    //height of messages container 
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled? 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log( message)
    const html = Mustache.render(messageTemplate, {  //message onn scrren1
        username: message.username,
        message: message.text, //from index.html {{message}}
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) //message on scrren2 
    autoscroll()

})
//template for location 
socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {  
    username: message.username,
    url: message.url, 
    createdAt: moment(message.createdAt).format('h:mm a')
})
     $messages.insertAdjacentHTML('beforeend',html) 
     autoscroll()
})


socket.on('roomData', ({room, users})=>{
   const html = Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html

})

//---Message
$messageForm.addEventListener('submit', (e) => { //function will run when button click
    e.preventDefault()
//disable form button after submitted
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    
//--received message 
    socket.emit('sendMessage', message, (error)=>{
        //enable form button
        $messageFormButton.removeAttribute('disabled')
        //clear input form and focus back 
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
        
    })
})



//---Location 
$sendLocationButton.addEventListener('click', ()=>{
    //e.preventDefault()

    if(!navigator.geolocation){
        return alert('Brower doesnt support Geolocation')
    }
    
    $sendLocationButton.setAttribute('disabled','disabled')

    
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('shareLocation',{         
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (error)=>{
            if(error){
                return console.log(error)
            }
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location had shared!')     
        })

    })
    
})

socket.emit('join', {username, room}, (error)=> {
    if(error){
        alert(error)
        location.href= '/'
    }
})


//event acknowledgment
//server (emit) -> client (receive) --acknowladgement--> server 

//client (emit) -> server (receive) --acknowladgement -->client 

