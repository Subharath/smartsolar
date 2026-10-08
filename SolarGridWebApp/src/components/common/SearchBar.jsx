import { SearchIcon } from './Icons';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <SearchIcon className="w-4 h-4" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-leaf/40 focus:border-leaf"
      />
    </div>
  );
}

export default SearchBar;
