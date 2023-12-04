import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header = () => {
    return (
        <div className="flex justify-between">
        <header className="bg-black p-10 mx-4 space-y-2">
            <h1 className="text-pink-700 text-5xl font-bold">
        NFTickets
    </h1> 
    <b>Feel the Beat Live</b>
     </header>
     <div className="p-10"> <ConnectButton/></div>

     </div>
    )

}

export default Header;