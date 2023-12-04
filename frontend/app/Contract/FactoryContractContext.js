'use client'
import { useContext, createContext, useEffect, useReducer, useState } from 'react';
import { abi, factory_address } from './constant';
import {

  prepareWriteContract,
  writeContract,
 
} from "@wagmi/core";

import { useContractEvent, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem'



const ContractContext = createContext();

export const ContractContextProvider = ({ children }) => {
  const publicClient = usePublicClient();
  

  const blockNumber =async()=>{
   return  publicClient.getBlockNumber()};

  const lastevents = async() =>{ 
    const events = await publicClient.getLogs({
    address: factory_address,
   event: parseAbiItem('event EventCreated(address)'),
    fromBlock: 1n,
    toBlock: 20n,
  })
  console.log(events);

}

  const contractEvent = publicClient.watchContractEvent({
    address: factory_address,
    abi: abi,
    eventName: 'EventCreated',
    onLogs: logs => console.log(logs)
   
  })



const create = async(eventName, eventDate) => {
      const { request } = await prepareWriteContract({
            address: factory_address,
            abi: abi,
            functionName: "create",
            args: [eventName, eventName, BigInt(eventDate)],
        });
        const { hash } = await writeContract(request)
}

useEffect(()=>{
   lastevents();
},[])

const value = { create};

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};


export const useContractContext = () => useContext(ContractContext);