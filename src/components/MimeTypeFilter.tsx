import React from 'react';
  
// Define the props type for MimeTypeFilter
interface MimeTypeFilterProps {
  mimeTypes: string[]; // List of available MIME types
  selectedMimeTypes: string[]; // Selected MIME types
  onChange: (selectedMimeTypes: string[]) => void; // Callback to handle selected MIME types
}

const MimeTypeFilter: React.FC<MimeTypeFilterProps> = ({ mimeTypes, selectedMimeTypes, onChange }) => {
  // Handle change in selection
  const handleMimeTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = event.target.selectedOptions;
    const selectedValues = Array.from(options).map((option: HTMLOptionElement) => option.value);
    onChange(selectedValues); // Pass the selected values to the parent
  };

  const resetAll = () => {
    onChange([]);
  };

  return (

    <div className="p-4">
        <div className="navbar bg-base-100">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
         {mimeTypes.map((mime) => (
           <div className="form-control">
           <label className="label cursor-pointer">
             <span className="label-text">{mime}</span>
             <input type="checkbox" defaultChecked className="checkbox " />
           </label>
         </div>

        ))}     
      </ul>
    </div>
    {/* <a className="btn btn-ghost text-xl">daisyUI</a> */}
  </div>
  <div className="navbar-center hidden lg:flex">
  {/* <label htmlFor="mimeFilter" className="block text-lg mb-2">
        Select MIME Types
      </label> */}
        {mimeTypes.map((mime) => (
            <div key={mime + 1} className="flex flex-wrap items-center space-x-2">
                <label htmlFor={mime}>{mime}</label>
                <input
                type="checkbox"
                id={mime}
                value={mime}
                checked={selectedMimeTypes.includes(mime)}
                className="checkbox "
                onChange={(event) => {
                    const isChecked = event.target.checked;
                    if (isChecked) {
                    onChange([...selectedMimeTypes, mime]);
                    } else {
                    onChange(selectedMimeTypes.filter((selectedMime) => selectedMime !== mime));
                    }
                }}
                />
            </div>

        ))} 
            <button id="btn" className="btn" onClick={resetAll}>reset filter</button>
 
  </div>
 
 
</div>

    </div>
  );
};

export default MimeTypeFilter;
