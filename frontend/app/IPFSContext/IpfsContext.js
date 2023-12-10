'use client'
import { createContext, useContext, useState } from "react";

const IPFSContext = createContext();


export const IpfsContextProvider = ({ children }) => {
   const[hashed, setHashes] = useState([]);

const push = (key, value)=>{
 console.log(key, value);
    hashed.push({address:key, hash:value});

}

const getItem=(key)=>{
    console.log(key);
    const item = hashed.find((e)=>e.address==key);
    console.log(item);
    return item.hash;
}
  


  
    return (
      <IPFSContext.Provider value={{push, getItem}}>
        {children}
      </IPFSContext.Provider>
    )
  };
  
  
  export const useIpfContext = () => useContext(IPFSContext);