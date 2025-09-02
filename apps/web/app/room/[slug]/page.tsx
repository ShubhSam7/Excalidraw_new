import axios from 'axios'
import { BACKEND_URL, WS_URL } from './config';
import {useEffect, useState} from 'react'

async function getRoom(slug: string){
    const response = await axios.get(`${BACKEND_URL}`)
    return response.data.id;
}

export default async function ChatRoom({
    params
} : {
    params: {
        slug: string
    }
}){
    const slug = params.slug;
    const [roomId, setRoomId] = useState([]);
    const roomIdResponse = await getRoom(slug);   
    
    
}