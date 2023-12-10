'use client'
import { useContext, createContext, useEffect, useReducer, useState } from 'react';
import { abi, factory_address, abi_ticket } from './constant';
import {

  prepareWriteContract,
  writeContract,
  readContract
 
} from "@wagmi/core";

import { useContractEvent, usePublicClient } from 'wagmi';
import { parseAbiItem, parseEther } from 'viem'





const ContractContext = createContext();

export const ContractContextProvider = ({ children }) => {
  const publicClient = usePublicClient();
  const [meta, setMeta] = useState([]);
  const [status, setStatus ] = useState([]);
 
  


  const lastevents = async(ownerAddress) =>{ 
  
    const events = await publicClient.getLogs({
    address: factory_address,
    event: parseAbiItem('event EventCreated(address indexed ticketAddress, address indexed owner)'),
    args: { 
      owner:  ownerAddress
    },
    fromBlock: 0n,
    toBlock: 'latest',
  })
  return events;
}

const lastOpenSell = async() =>{ 
  
  const events = await publicClient.getLogs({
  event: parseAbiItem('event SellingStarted(address indexed eventAddress)'),
  fromBlock: 0n,
  toBlock: 'latest',
})
return events;
}


const create = async(eventName, date, desc, location,categories ) => {
  console.log("creation")
  console.log(categories);
      const { request } = await prepareWriteContract({
            address: factory_address,
            abi: abi,
            functionName: "create",
            args: [eventName, eventName, date,desc,location, categories],
        });
        const { hash } = await writeContract(request)
}




const getMeta = async (contractAddress) => {
    const ret = await readContract({
    address: contractAddress,
    abi: abi_ticket,
    functionName:  'eventMeta',
  });

 
 return    { metadata:ret, address: contractAddress};
 
 
}
const getName = async (contractAddress) => {
  const ret = await readContract({
  address: contractAddress,
  abi: abi_ticket,
  functionName:  'name',
});


return    { name:ret, address: contractAddress};


}

const getStatus = async (contractAddress) => {
  const ret = await readContract({
  address: contractAddress,
  abi: abi_ticket,
  functionName:  'eventStatus',
});

return    { status:ret, address: contractAddress};

  

}

const startSelling = async (adr) => {
  try{
  const { request }  = await prepareWriteContract({
  address: adr,
  abi: abi_ticket,
  functionName:  'startSell',
});

const { hash } = await writeContract(request)
  } catch(err){
    console.log(err);
  }


}

const buy = async (adr, seat, category, tokenUri, price) => {
  console.log(price);
  try{
  const { request }  = await prepareWriteContract({
  address: adr,
  abi: abi_ticket,
  functionName:  'buy',
  args: [seat, category, tokenUri],
  value: parseEther(String(price)),
});

const { hash } = await writeContract(request)
  } catch(err){
    console.log(err);
  }


}

const getCategories= async(adr)=>{
  const ret = await readContract({
    address: adr,
    abi: abi_ticket,
    functionName:  'getCategories',
  });

  return    { categories:ret, address: adr};


}





const value = { create, lastevents,getMeta, getStatus, startSelling, meta,setMeta, status, setStatus,lastOpenSell, getName, getCategories,buy};

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};


export const useContractContext = () => useContext(ContractContext);