import React, { useState } from 'react';

export default function SearchBar({ value='', onSearch }) {
  const [q, setQ] = useState(value);
  const doSearch = () => onSearch(q);
  return (
    <div className="input-group">
      <input className="form-control" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
      <button className="btn btn-secondary" onClick={doSearch}>Search</button>
    </div>
  );
}
