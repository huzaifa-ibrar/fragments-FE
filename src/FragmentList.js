import React, { useState, useEffect, useCallback } from 'react';
import { listFragments, getFragmentData, getFragmentInfo } from './api';

export default function FragmentList() {
    const [fragments, setFragments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [content, setContent] = useState('');
    const [viewFormat, setViewFormat] = useState('');
    const [expanded, setExpanded] = useState(false);

    // ✅ useCallback ensures fetchFragments reference is stable
    const fetchFragments = useCallback(async () => {
        try {
            const frags = await listFragments(expanded);

            // ✅ Filter out null or empty items
            const cleanFragments = Array.isArray(frags)
                ? frags.filter(f => f && (typeof f === 'string' || Object.keys(f).length > 0))
                : [];

            console.log('✅ Clean fragments:', cleanFragments);
            setFragments(cleanFragments);
        } catch (err) {
            console.error('Error fetching fragments:', err);
            setFragments([]);
        }
    }, [expanded]);

    const viewFragment = async (id, format = '') => {
        try {
            const info = await getFragmentInfo(id);
            setSelectedInfo(info);

            const { data } = await getFragmentData(id, format);
            setSelected(id);
            setContent(data);
            setViewFormat(format);
        } catch (err) {
            console.error('Error loading fragment:', err);
            setContent('Error loading fragment');
        }
    };

    useEffect(() => {
        fetchFragments();
    }, [fetchFragments]);

    const getAvailableFormats = (type) => {
        const formats = [];
        if (type === 'text/markdown') formats.push('html');
        if (type === 'application/json') formats.push('txt');
        return formats;
    };

    return (
        <div>
            <h2>Fragments</h2>

            {/* Expand toggle */}
            <label>
                <input
                    type="checkbox"
                    checked={expanded}
                    onChange={(e) => setExpanded(e.target.checked)}
                />{' '}
                Show Fragment Details
            </label>

            {/* Fragment list */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {Array.isArray(fragments) && fragments.length > 0 ? (
                    fragments.map((fragment, index) => {
                        const fragmentId = expanded ? fragment?.id : fragment;

                        // ✅ Skip invalid entries
                        if (!fragmentId || fragmentId === 'null') return null;

                        return (
                            <li key={fragmentId || index} style={{ marginBottom: '10px' }}>
                                {expanded && fragment ? (
                                    <div>
                                        <strong>ID:</strong> {fragment.id}
                                        <br />
                                        <strong>Type:</strong> {fragment.type}
                                        <br />
                                        <strong>Size:</strong> {fragment.size} bytes
                                        <br />
                                        <strong>Created:</strong>{' '}
                                        {new Date(fragment.created).toLocaleString()}
                                        <br />
                                        <button onClick={() => viewFragment(fragment.id)}>View</button>
                                    </div>
                                ) : (
                                    <div>
                                        {String(fragmentId)}{' '}
                                        <button onClick={() => viewFragment(fragmentId)}>View</button>
                                    </div>
                                )}
                            </li>
                        );
                    })
                ) : (
                    <p>No fragments found.</p>
                )}
            </ul>

            {/* Selected fragment display */}
            {selected && selectedInfo && (
                <div>
                    <h3>Fragment {selected}</h3>

                    {/* Conversion dropdown */}
                    <div style={{ marginBottom: '10px' }}>
                        <select
                            value={viewFormat}
                            onChange={(e) => viewFragment(selected, e.target.value)}
                            style={{ marginRight: '10px' }}
                        >
                            <option value="">
                                Original Format ({selectedInfo.type})
                            </option>
                            {getAvailableFormats(selectedInfo.type).map((format) => (
                                <option key={format} value={format}>
                                    Convert to {format.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fragment content */}
                    <div
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        {viewFormat === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            <pre
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                }}
                            >
                                {typeof content === 'string'
                                    ? content
                                    : JSON.stringify(content, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
