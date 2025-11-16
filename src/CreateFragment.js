import React, { useState } from 'react';
import { createFragment } from './api';

export default function CreateFragment({ onCreated }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('text/plain');
    const [status, setStatus] = useState('');

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
                            <option value="text/plain">Plain Text</option>
                            <option value="text/markdown">Markdown</option>
                            <option value="application/json">JSON</option>
                        </select>
                    </label>
                </div>
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
