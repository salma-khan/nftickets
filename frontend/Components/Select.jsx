import { useState } from "react";

const DynamicSelect= ({ length, onOptionChange })=>{

    const [selectedOption, setSelectedOption] = useState(1);
    const options = []; // Tableau pour stocker les options

  for (let i = 1; i <= length; i++) {
    options.push(
      <option key={i} value={i}>
        {i}
      </option>
    );
  }

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
   
    onOptionChange(value);
  };

return(<>
 <select data-te-select-init value={selectedOption} onChange={handleSelectChange}>
      {options} {/* Affichage des options dans le select */}
    </select>
</>)
}

export default DynamicSelect;