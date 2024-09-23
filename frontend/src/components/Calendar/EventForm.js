import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';

const EventForm = ({ event, onSave, onDelete, onClose }) => {
    const [formData, setFormData] = useState({
        id: event?.id || null,
        title: event?.title || '',
        start: event?.start || new Date(),
        description: event?.description || '',
        reminder: event?.reminder !== undefined ? event.reminder : true,
    });

    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id || null,
                title: event.title || '',
                start: event.start || new Date(),
                description: event.description || '',
                reminder: event.reminder !== undefined ? event.reminder : true,
            });
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'start') {
            const localDate = new Date(value);
            setFormData({ ...formData, start: localDate });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleDelete = () => {
        if (formData.id) {
            onDelete(formData.id);
        }
    };

    const formatDateTimeLocal = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>
                {formData.id ? 'Edit Event' : 'Create Event'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Title"
                    name="title"
                    fullWidth
                    margin="normal"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Date & Time"
                    name="start"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={formatDateTimeLocal(formData.start)}
                    onChange={handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
                <TextField
                    label="Description"
                    name="description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.reminder}
                            onChange={handleChange}
                            name="reminder"
                            color="primary"
                        />
                    }
                    label="Set Reminder"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Save
                </Button>
            </form>
            {formData.id && (
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            )}
            <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={onClose}>
                Cancel
            </Button>
        </div>
    );
};

export default EventForm;