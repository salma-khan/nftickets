'use client'
import SideBar from "@/Components/SideBar";
import Link from "next/link";
import { useAccount } from 'wagmi'




export default function SellerLayout({ children }) {
    const { isConnected } = useAccount();
    if (!isConnected) {
        return (<div className="align-center">Please connect to your wallet</div>)
    } else {

        return (
            <div>
                 <SideBar/>
                <div class="p-4 sm:ml-64">
                      {children}
                </div>
            </div>


        )
    }


}
