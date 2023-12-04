'use client'
import Connect from "@/Components/Connect";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function SellerLayout({ children }) {
    const { isConnected} = useAccount();
    return (
        <>
        {!isConnected? <div className=" flex justify-center mt-20"> <Connect/></div> :(
        <div className="flex flex-row p-20">
        <div className="basis-1/4 flex-col p-10">
            <div>
        <Link href="/Sellers/CreateEvent/Event" >
            <span className="text-2xl  text-yellow-500 hover:text-white">Créer un évènement</span>
        </Link>
        </div>
        <div className="mt-10  mr-10">
        <Link href="/Sellers/CreateEvent" >
            <span className="text-2xl   text-yellow-500 hover:text-white">Mes évènements</span>
        </Link>
        </div>

        </div>
        <div className="basis-3/4">
              {children}
        </div>
        </div>)}
    </>
           
    )
  }