'use client'

import { useAccount } from "wagmi";
import { useContractContext } from "@/app/Contract/ContractContext";


import { useEffect, useState } from "react";
import Connect from "@/Components/Connect";

export default function Buyer() {
    const { isConnected} = useAccount();


    const contractFactoryContext = useContractContext();

    const [eventRender, setEventRender] = useState([]);
    const [eventsMetada, setEventMetada] = useState([]);
    const [eventStatus, setEventStatus] = useState([]);
    const[categories, setCategories] = useState([]);
    const[names, setNames] = useState([]);
    
    const [finish, setFinish]= useState(false);


    useEffect(()=>{

        const fetch = async()=>{
          return  await contractFactoryContext.lastOpenSell();
        }
      
        fetch().then((receivedEvents)=>{
          let args = receivedEvents.map(element => element.args.eventAddress);
            lookForEvent(args);
             
        })
       
      
      
         const lookForEvent = async(arg)=>{
      
              await Promise.all(arg.map(async(e)=>{
                  const m = await  contractFactoryContext.getMeta(e);
                  const st = await contractFactoryContext.getStatus(e);
                  const name = await contractFactoryContext.getName(e);
                  const cat = await contractFactoryContext.getCategories(e);
                  eventsMetada.push(m);
                  eventStatus.push(st);
                  names.push(name);
                  categories.push(cat);
      
      
              }))
             setFinish(true);
      
      }
      
      
      
         
      },[])
      
      useEffect(()=>{
       if(finish){
         
      
         let events =[];
      
          eventsMetada.forEach((m)=>{
      
              events.push({address:m.address, desc:m.metadata[1],  location: m.metadata[2], date:Date(Number(m.metadata[0]))})
              
          
          })
      
          console.log(names);
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


          categories.forEach((c)=>{
            let newEvents = events.map(el => {       
                if(el.address===c.address){
               
                   return  {...el, categ: c.categories}
                }
                return el;}
             )
             events = newEvents;

          })
         console.log(events);
      
          setEventRender(events);
      
       }
      
      
      }, [finish])






    return ( <>{!isConnected ? <div className=" flex justify-center mt-20"> <Connect/></div>:(<div className="p-4">
        <h1 className="text-xl font-bold mb-2">Liste d'événements :</h1>
        <ul className="divide-y divide-gray-200">
            {eventRender.map((event, index) => (
                <li className="py-2">
                     <p className="text-white-600">Name : {event.name ? event.name : ""}</p>
                    <p className="text-white-600">Date : {event.date ? event.date : ""}</p>
                    <p className="text-white-600">Description : {event.desc ? event.desc : ""}</p>
                    <p className="text-white-600">Lieu : {event.location ? event.location : ""}</p>
                    <ul className="text-white-600">
                    
                     {event.categ? (event.categ.map((c,index)=>(
                        <div>
                        <li>
                         <p className="text-white-600">Categorie  : {c.category ? c.category : ""}</p>
                         </li>

                         <li>
                         <p className="text-white-600">Prix en ether  : {c.price ? c.price : ""}</p>
                         </li>
                         </div>

                         ))):(<></>)
                     }

                    </ul>

                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ">
                        buy a ticket
                    </button>

                </li>
            ))}
        </ul>
    </div>)}</>)
}

