'use client'
import { useContractContext } from "@/app/Contract/ContractContext";


import {  useEffect, useState } from "react";

import { useAccount } from "wagmi";

export default function MyEvent(){


const contractFactoryContext = useContractContext();
const {address} = useAccount();
const [finish, setFinish]= useState(false);


const [eventRender, setEventRender] = useState([]);
const [eventsMetada, setEventMetada] = useState([]);
const [eventStatus, setEventStatus] = useState([]);
const[names, setNames] = useState([]);


useEffect(()=>{


  const fetch = async()=>{
    return  await contractFactoryContext.lastevents(address);
  }

  fetch().then((receivedEvents)=>{
    let args = receivedEvents.map(element => element.args.ticketAddress);
  
      lookForEvent(args).then(()=>{
      
      });
       

  })
 


   const lookForEvent = async(arg)=>{

        await Promise.all(arg.map(async(e)=>{
            const m = await  contractFactoryContext.getMeta(e);
            const st = await contractFactoryContext.getStatus(e);
            const name = await contractFactoryContext.getName(e);
            eventsMetada.push(m);
            eventStatus.push(st);
            names.push(name);

           

        }))
       setFinish(true);

}



   
},[])

useEffect(()=>{
 if(finish){
   

   let events =[];

    eventsMetada.forEach((m)=>{

        events.push({address:m.address, desc:m.metadata[1],  location: m.metadata[2], date:m.metadata[0]})
        
    
    })


    eventStatus.forEach((m)=>{
             let newEvents = events.map(el => {       
                if(el.address===m.address){
               
                   return  {...el, status: m.status}
                }
                return el;}
             )
             events = newEvents;
         
    
    
    })

    names.forEach((n)=>{
        let newEvents = events.map(el => {       
            if(el.address===n.address){
           
               return  {...el, name: n.name}
            }
            return el;}
         )
         events = newEvents;

      })


    setEventRender(events);

 }


}, [finish])










function startSell(adr) {
    contractFactoryContext.startSelling(adr).then(function(){
        console.log("called then")
        contractFactoryContext.getStatus(adr);
    });
   
}


return(<><div className="p-4">
<h1 className="text-xl font-bold mb-2">Liste d'événements :</h1>
<ul className="divide-y divide-gray-200">
    {eventRender.map((event, index) => (
        <li key={index} className="py-2">
             <p className="text-white-600">Name : {event.name?event.name:"" }</p>
            <p className="text-white-600">Date : {event.date?event.date:"" }</p>
            <p className="text-white-600">Description : {event.desc? event.desc :""}</p>
            <p className="text-white-600">Lieu : {event.location? event.location :""}</p>
            <p className="text-white-600">Statut : {event.status ? event.status :""
            }
            </p>
            <button key={event.adr} class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded " onClick={(e)=>startSell(event.adr)}>
                startSelling
</button>
            
        </li>
    ))}
</ul>
</div></>)

    }