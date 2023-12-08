'use client'
import { useContractContext } from "@/app/Contract/ContractContext";


import {  useEffect, useState } from "react";

import { useAccount } from "wagmi";

export default function MyEvent(){


const contractFactoryContext = useContractContext();
const {address} = useAccount();
const [finish, setFinish] = useState(false );
const [events, setEvents] = useState([]);
const [eventRender, setEventRender] = useState([]);





useEffect(()=>{
    console.log("start");
   const receivedEvents =  contractFactoryContext.lastevents(address);
   
   receivedEvents.then(function(result){
   let args = result.map(element => element.args.ticketAddress);
    let tempEvent = [];

    args.forEach(address => {
       
      
        const event = {
            adr : address,
            date: "",
            desc : "",
            location:"",
            status:""
        

        }
       tempEvent.push(event); 
    
     
     
    });

    setEvents(tempEvent)
    tempEvent= [];

    

   
   });
   
   console.log(events);
   console.log("finish")

   
},[])

useEffect(()=>{
    if(events.length>0){
    events.forEach((e)=>{
        
        contractFactoryContext.getMeta(e.adr);
        contractFactoryContext.getStatus(e.adr);

    })
    console.log("finish fetching meta")
}

},[events]);

useEffect(()=>{

    if(events.length>0){
    console.log("fSomthing changed")
    
    let metas = contractFactoryContext.meta;
    console.log("meta"+metas);

    metas.forEach((m)=>{
        let ele = events.find((e)=>m.address===e.adr);
        let index =events.indexOf(ele);
        if(ele!=undefined){
        ele.date = m.metadata[0];
        ele.desc = m.metadata[1]
        ele.location = m.metadata[2]
        eventRender.splice(index, 1, ele);
       
        }
        
    })


}

setEventRender(eventRender);


},[contractFactoryContext.meta]);


useEffect(()=>{
    console.log("fSomthing changed")
    
    let status = contractFactoryContext.status;
   

    status.forEach((m)=>{
        let ele = events.find((e)=>m.address===e.adr);
        let index = events.indexOf(ele);
        if(ele!=undefined){
         if(m.st ===0 ){
            ele.status = "Event not started";
         } else if(m.st ===1){
            ele.status = "Selling started";
         }
    
         eventRender.splice(index, 1,  ele);
        
       
        }
        
    }
)




},[contractFactoryContext.status]);







return(<><div className="p-4">
<h1 className="text-xl font-bold mb-2">Liste d'événements :</h1>
<ul className="divide-y divide-gray-200">
    {eventRender.map((event, index) => (
        <li key={index} className="py-2">
            <p className="text-white-600">Date : {event.date?event.date:"" }</p>
            <p className="text-white-600">Description : {event.desc? event.desc :""}</p>
            <p className="text-white-600">Lieu : {event.location? event.location :""}</p>
            <p className="text-white-600">Statut : {event.status ? event.status :""}</p>
            
        </li>
    ))}
</ul>
</div></>)

    }