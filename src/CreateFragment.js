import React, { useState } from 'react';
import { createFragment } from './api';

export default function CreateFragment({ onCreated }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('text/plain');
    const [status, setStatus] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const validateContent = (content, type) => {
        if (type === 'application/json') {
            try {
                JSON.parse(content);
                return true;
            } catch (e) {
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Creating...');

        // For image types, validate that a file is selected
        if (type.startsWith('image/')) {
            if (!imageFile) {
                setStatus('Error: Please select an image file');
                return;
            }
            try {
                const fragment = await createFragment(imageFile, type);
                setStatus('Created with ID: ' + fragment.id);
                setImageFile(null);
                setText('');
                onCreated();
            } catch (err) {
                console.error(err);
                setStatus('Error creating fragment');
            }
            return;
        }

        if (!validateContent(text, type)) {
            setStatus('Error: Invalid content format');
            return;
        }

        try {
            const fragment = await createFragment(text, type);
            setStatus('Created with ID: ' + fragment.id);
            setText('');
            onCreated();
        } catch (err) {
            console.error(err);
            setStatus('Error creating fragment');
        }
    };

    return (
        <div>
            <h2>Create Fragment</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Content Type:
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ marginLeft: '10px', marginBottom: '10px' }}
                        >
                            <optgroup label="Text">
                                <option value="text/plain">Plain Text</option>
                                <option value="text/markdown">Markdown</option>
                                <option value="application/json">JSON</option>
                            </optgroup>
                            <optgroup label="Images">
                                <option value="image/png">PNG</option>
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/webp">WebP</option>
                                <option value="image/gif">GIF</option>
                            </optgroup>
                        </select>
                    </label>
                </div>

                {type.startsWith('image/') ? (
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            style={{ marginBottom: '10px' }}
                        />
                        {imageFile && <p>Selected: {imageFile.name}</p>}
                    </div>
                ) : (
                    <textarea
                        rows={4}
                        cols={50}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={type === 'application/json' ?
                            'Enter valid JSON' :
                            type === 'text/markdown' ?
                                'Enter Markdown text' :
                                'Enter plain text'}
                    />
                )}
                <br />
                <button type="submit">Create</button>
            </form>
            <p>{status}</p>
            {type === 'text/markdown' && (
                <div>
                    <h4>Markdown Tips:</h4>
                    <ul>
                        <li># Header 1</li>
                        <li>## Header 2</li>
                        <li>**bold text**</li>
                        <li>*italic text*</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
