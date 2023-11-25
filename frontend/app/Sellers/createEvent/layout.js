import TabSeller from "@/Components/TabSeller";





export default function EventLayout({ children }) {


        return (
            <div> 
                <TabSeller/>
                <div >
                      {children}
                </div>
            </div>


        )
    }



