import { useEffect, useState } from 'react';
import IconImage from "../assets/Search.svg";
import { Parent } from './Parent';


export function Template() {

  const [user ,setUser] = useState([])

  const fetchData = async () => {
    const api_data = fetch("http://localhost:9000/api/larch/template/list", {
      method: 'post',
    })
    const response = await api_data;
    const data = await response.json();
    console.log({data})
    const temp = data.result
    console.log("dataaaa",temp)
 

    return setUser(temp);

   
  }

  useEffect(() => {

    fetchData()

  },[])

return (
  
  <div className=' flex-col flex'>
   <div className='p-6 gap-6 flex-col flex' >   
   <div className='h-12 w-[1138px] flex'>
      <div className='w-[350px] h-12 bg-black border-2 border-border rounded flex '>
         <form className="flex w-full justify-between px-4  ">
        <input className="form-control text-white focus:outline-none w-full bg-black me-2 font-rubik text-base "  placeholder="Search..." />
        <img className="w-6 h-6  m-2.5  " src= {IconImage} alt=""/>
          </form>
      </div>
      <div className="h-full flex w-full flex-wrap	content-center  item-center justify-end gap-4">
      <div className='item-center'>
      <div className="bg-create-button gap-2 text-white font-rubik flex flex-row border-2 border-border rounded h-10  items-center">
        <div className='border-r-2 flex flex-row items-start py-1.5 px-4 border-border h-full'>
            <select className='bg-create-button'>
            <option className='text-black bg-white'>Filter By</option>
            <option className='text-black bg-white'>option 2</option>
            <option className='text-black bg-white'>option 3</option>
            <option className='text-black bg-white'> option 4 </option>
            <option className='text-black bg-white'> option 5 </option>
          </select></div> 
      </div>
      </div>
     </div>
     </div>
     <Parent/>
    
   </div>
   </div>


   
);
}
export default Template;