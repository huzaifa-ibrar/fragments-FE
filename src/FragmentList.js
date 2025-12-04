import React, { useState, useEffect, useCallback } from 'react';
import { listFragments, getFragmentData, getFragmentInfo, deleteFragment, updateFragment } from './api';

export default function FragmentList() {
    const [fragments, setFragments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [content, setContent] = useState('');
    const [viewFormat, setViewFormat] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isImage, setIsImage] = useState(false);
    const [editImageFile, setEditImageFile] = useState(null);

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

            const { data, isImage: imgFlag } = await getFragmentData(id, format);
            setSelected(id);
            setContent(data);
            setEditContent(data);
            setViewFormat(format);
            setIsImage(imgFlag);
            setIsEditing(false);
        } catch (err) {
            console.error('Error loading fragment:', err);
            setContent('Error loading fragment');
            setIsImage(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fragment?')) {
            try {
                await deleteFragment(id);
                setSelected(null);
                setSelectedInfo(null);
                setContent('');
                await fetchFragments();
            } catch (err) {
                console.error('Error deleting fragment:', err);
                alert('Failed to delete fragment');
            }
        }
    };

    const handleEdit = async (id) => {
        try {
            // Always fetch the ORIGINAL data (no format conversion) for editing
            const { data: originalData } = await getFragmentData(id, '');
            setEditContent(originalData);
            setEditImageFile(null);
            setIsEditing(true);
        } catch (err) {
            console.error('Error loading original data for editing:', err);
            alert('Failed to load fragment for editing');
        }
    };

    const handleUpdate = async (id) => {
        try {
            const type = selectedInfo.type;

            // For images, use the new file if selected, otherwise use old data
            let dataToSend = editContent;

            if (type.startsWith('image/')) {
                if (editImageFile) {
                    dataToSend = await editImageFile.arrayBuffer();
                } else {
                    alert('Please select a new image to update');
                    return;
                }
            } else if (type === 'application/json' && typeof editContent === 'string') {
                // Validate JSON before sending
                JSON.parse(editContent);
                dataToSend = editContent;
            }

            await updateFragment(id, dataToSend, type);
            setIsEditing(false);
            setEditImageFile(null);
            await viewFragment(id, viewFormat);
            await fetchFragments();
            alert('Fragment updated successfully');
        } catch (err) {
            console.error('Error updating fragment:', err);
            alert('Failed to update fragment: ' + (err.response?.data?.error || err.message));
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

                    {/* Fragment metadata */}
                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                        <p><strong>Type:</strong> {selectedInfo.type}</p>
                        <p><strong>Size:</strong> {selectedInfo.size} bytes</p>
                        <p><strong>Created:</strong> {new Date(selectedInfo.created).toLocaleString()}</p>
                        <p><strong>Updated:</strong> {new Date(selectedInfo.updated).toLocaleString()}</p>
                    </div>

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

                    {/* Action buttons */}
                    <div style={{ marginBottom: '10px' }}>
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => handleEdit(selected)}
                                    style={{
                                        marginRight: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(selected)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleUpdate(selected)}
                                    style={{
                                        marginRight: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#757575',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>

                    {/* Fragment content */}
                    {isEditing ? (
                        isImage ? (
                            <div>
                                <p><strong>Select a new image to replace:</strong></p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditImageFile(e.target.files[0])}
                                    style={{ marginBottom: '10px', display: 'block' }}
                                />
                                {editImageFile && (
                                    <div>
                                        <p><strong>New image selected:</strong> {editImageFile.name}</p>
                                        <img
                                            src={URL.createObjectURL(editImageFile)}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                marginTop: '10px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                }}
                            />
                        )
                    ) : (
                        <div
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            {isImage ? (
                                <img
                                    src={content}
                                    alt="Fragment"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : viewFormat === 'html' ? (
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
                    )}
                </div>
            )}
        </div>
    );
}
