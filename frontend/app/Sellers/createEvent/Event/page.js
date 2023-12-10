'use client'

import { useContractContext } from "@/app/Contract/ContractContext";
import { abi, factory_address } from "@/app/Contract/constant";
import { useIpfContext } from "@/app/IPFSContext/IpfsContext";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { useAccount, usePublicClient } from "wagmi";




export default function Event() {
  
    const factoryContext = useContractContext();
    const publicClient = usePublicClient();
    const ipfContext = useIpfContext();
    const{address} = useAccount();
 
    const [startDate, setStartDate] = useState(new Date());
    const [location, setLocation] = useState("");
    const [eventName, setEventName]= useState("");
    const[description, setDescription] = useState();
    const[categName, setCategName]= useState();
    const[price, setPrice] = useState();
    const[priceThreshold, setPriceThreshold] = useState();
    const [file, setFile] = useState("");
    const [cid, setCid] = useState("");
    const [quanity, setQuantity] = useState();
    const [form, setForm] = useState({
        name: "",
        description: "",
      });

    function handleChange(e) {
        setFile(e.target.files[0])
    }
   




      
    const uploadAndCreateContract = async (e) => {
        try {
          e.preventDefault();
          const formData = new FormData();
          formData.append("file", file, { filename: file.name });
          formData.append("namefile", categName);
          formData.append('EventDescription' , description);
          formData.append("localisation", location);
          formData.append("eventName", eventName);
          formData.append("quantity", quanity);
          formData.append("date", startDate);
    
          const res =  await fetch("/api/files", {
            method: "POST",
            body: formData,
          //  headers: { 'Content-Type': 'application/json' },
          });

    
       
         const ipfsHash = await res.json();
     
         
         setCid(ipfsHash.IpfsHash);
   

          
          factoryContext.create(eventName,startDate.getTime(),description, location, [[categName,price, quanity, priceThreshold]]);
          const events = publicClient.watchContractEvent({
            address: factory_address,
            abi: abi,
            eventName: 'EventCreated',
            onLogs: logs =>{
             
                console.log(logs);
              ipfContext.push(logs[0].args.ticketAddress, ipfsHash.IpfsHash);
              console.log(cid);
            
                
                
            }
          })

      
        } catch (e) {
       
          alert("Trouble uploading file");
        }
      };
    
 


    

    return (
        <div>
            <p className="text-3xl mb-10  text-yellow-500">Event Info</p>
            <script src="./node_modules/flowbite/dist/flowbite.min.js"></script>
            <form onSubmit={uploadAndCreateContract}>
                <div class="flex gap-3">
                
                    <input type="text" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nom événement"  onChange={(e)=>setEventName(e.target.value)} />
                   
                    <input type="text" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Localisation" onChange={(e)=>setLocation(e.target.value)} />
                </div>
                <div class="mt-5 flex flex-row">
                    
                    <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Description de l'événement" onChange={(e)=>setDescription(e.target.value)}></textarea>
                </div>
                <div class="mt-5 mb-5 flex ">
                   
                    <div className="flex flex-row gap-2 ">
                        <DatePicker className="w-20 bg-gray-50 border mr-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" selected={startDate} onChange={(date) => setStartDate(date)} />
                
                    </div>
                </div>

                <div><p className="text-3xl mb-10 gap-3 text-yellow-500">Categories</p>
                    <div className="grid grid-flow-row-col grid-cols-2">
                        <div className="mt-5 flex gab-2 flex-row">
                       
                        <input type="text" id="email" className="bg-gray-50  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nom de la categorie"  onChange={(e)=>setCategName(e.target.value)} />
                        </div><div className=" mt-5 ml-2 flex flex-row">
                     
                        <input type="text" id="email" className=" w-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:
                    border-blue-500" placeholder="price"  onChange={(e)=>setPrice(e.target.value)} />
                    </div><div className="mt-5 flex  flex-row">

                                         <input type="text" id="email" className="w-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="quantiy"  onChange={(e)=>setQuantity(e.target.value)} />
                        </div><div className="mt-5 ml-2 flex flex-row">
                     
                        <input type="text" id="email" className=" w-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="threshold price" onChange={(e)=>setPriceThreshold(e.target.value)}  />
                        </div><div className="mt-5  flex  flex-grow">
                         
                        <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"  onChange={handleChange}></input>
                        </div>
                    </div>
                 
                </div>
                <div className="mt-5">
                    <button type="submit" className="text-white bg-blue-700 mb-10 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={(e) => setForm({
                        ...form, 
                        name: e.target.value
                      })}>Création</button>
                    </div>
            </form>





        </div>

    );

}
