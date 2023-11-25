import Link from "next/link";


const SideBar = () => {
    return (
        <aside id="default-sidebar" className="fixed top-0 bg-transparent  left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto bg-transparent dark:bg-gray-900">
                <img className=" max-w-xs" src="/NFtickets.png" alt="image description"></img>
         
                <ul className="space-y-2 font-medium">
                    <li>
                        <Link href="/Sellers/createEvent/Event" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" >
                            <span className="ms-3">Create Event</span>
                        </Link>
                    </li>
                </ul>
                <ul className="space-y-2 font-medium">
                    <li>
                        <Link href="/Sellers/MyEvents" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" >
                            <span className="ms-3">My events</span>
                        </Link>
                    </li>
                </ul>
            </div>

        </aside>
        
    )

}

export default  SideBar;