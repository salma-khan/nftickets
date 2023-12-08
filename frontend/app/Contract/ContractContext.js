'use client'
import { useContext, createContext, useEffect, useReducer, useState } from 'react';
import { abi, factory_address, abi_ticket } from './constant';
import {

  prepareWriteContract,
  writeContract,
  readContract
 
} from "@wagmi/core";

import { useContractEvent, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem'




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



const create = async(eventName, date, desc, location,categories ) => {
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
  setMeta([...meta, 
    { metadata:ret, address: contractAddress}]);
 
}

const getStatus = async (contractAddress) => {
  const ret = await readContract({
  address: contractAddress,
  abi: abi_ticket,
  functionName:  'eventStatus',
});
setStatus([...status, 
  {st:ret, address: contractAddress}]);

}





const value = { create, lastevents,getMeta, getStatus, meta, status};

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};


export const useContractContext = () => useContext(ContractContext);