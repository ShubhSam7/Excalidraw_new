import {WebSocketServer} from 'ws';
import jwt from 'jsonwebtoken'

const wss = new WebSocketServer({port: 8080});

wss.on('connection', (ws, request) => {
    const url = request.url;
    if(!url){
        return;
    }

    const queryParam = new URLSearchParams(url.split('?')[1]);
    const token = queryParam.get('token') || "";

    const decoded = jwt.verify(token, process.env.jwt_SECRET as string)

    if(typeof decoded == "string"){
        ws.close();
        return;
    }
    if(!decoded){
        ws.close();
        return
    }

    ws.on('message', function message(){
        ws.send('pong');    
    })
});