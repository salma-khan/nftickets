
import Link from "next/link";

export default function Home() {
  return (
    
    <div className="flex p-20 flex-col">
      <div className="h-1/2 p-10 mt-20"> 
      <Link href="/Sellers" >
            <span className="text-3xl uppercase text-yellow-500 hover:text-white">Espace Vendeur</span>
        </Link>
      </div>
    <div className="h-1/2 p-10 mt-10">
        <Link href="/Sellers/createEvent/Event" >
            <span className="text-3xl uppercase text-yellow-500 hover:text-white">Espace Acheteur</span>
        </Link>
        </div>    
    </div>
  )
}
