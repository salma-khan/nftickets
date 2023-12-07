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




const create = async(eventName, date, categories ) => {
      const { request } = await prepareWriteContract({
            address: factory_address,
            abi: abi,
            functionName: "create",
            args: [eventName, eventName, BigInt(date), categories],
        });
        const { hash } = await writeContract(request)
}


const value = { create, lastevents};

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};


export const useContractContext = () => useContext(ContractContext);