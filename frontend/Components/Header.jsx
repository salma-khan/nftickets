import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header = () => {
    return (
        <header className="bg-black p-3">
            <div className="flex justify-between items-start">
                <div><p><img className=" max-w-xs" src="NFtickets.png" alt="image description"></img></p>
                </div>
                
                <div className="flex  items-center">
                    <div >
                    <Link className="text-base text-gray-900 dark:text-white p-5" href="/Events">
                    Events
                    </Link>
                    <Link  className="text-base text-gray-900 dark:text-white p-10 "  href="/Sellers/createEvent/Event">
                      Sell
                    </Link></div>
                    <ConnectButton />
                </div>
            </div>
        </header>
    )

}

export default Header;