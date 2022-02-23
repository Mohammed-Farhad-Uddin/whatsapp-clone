//importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';


//app config
const app = express();

const port = process.env.PORT || 8000;
const pusher = new Pusher({
    appId: "1351127",
    key: "bea134c3ae58378809ad",
    secret: "878e9e0bc0abbb453e76",
    cluster: "ap2",
    useTLS: true
  });


//middleware
app.use(express.json());
app.use(cors())
// // for secure msg cors er bodle use kore
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin','*')
//     res.setHeader('Access-Control-Allow-Headers','*')
//     next();
// });


//dbconfig
const connection_url='mongodb+srv://Mohammed-Farhad-Uddin:f1234567@cluster0.cdyee.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    // useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db= mongoose.connection

db.once("open",() =>{
    console.log('DB connected');

    const msgCollection = db.collection("messagecontents");
    // console.log(msgCollection);
    const changeStream = msgCollection.watch();
    // console.log(changeStream);

    changeStream.on('change',(change) =>{
        console.log("A change occured",change);

        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',
            {
                name: messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            });
        }else{
            console.log("Error triggered pusher");
        }
    });
});


//????

//api routes
app.get('/',(req, res) => res.status(200).send("Assalamualaikum"));

app.get('/messages/sync',(req, res) =>{
    const dbMessage = req.body

    Messages.find((err,data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
});


app.post('/messages/new',(req, res) =>{
    const dbMessage = req.body

    Messages.create(dbMessage, (err,data) =>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
});


//listener
app.listen(port,()=>console.log(`listening on port: ${port}`));