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

    <div className="drawer z-50">
  <input id="my-drawer" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Page content here */}
    <label htmlFor="my-drawer" className="btn  drawer-button">item filter</label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      {/* Sidebar content here */}
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

    </ul>
  </div>
</div>
  );
};

export default MimeTypeFilter;
