import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Container, Typography, Modal, Box, Paper, Button } from '@mui/material';
import EventForm from './EventForm';
import EventNotification from './EventNotification';

const CalendarComponent = () => {
    const { authTokens } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [notificationEvent, setNotificationEvent] = useState(null);
    const notificationTimersRef = useRef([]);
    const [debugInfo, setDebugInfo] = useState('');

    const addDebugInfo = (info) => {
        setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
        console.log(info);
    };

    const clearNotificationTimers = useCallback(() => {
        notificationTimersRef.current.forEach(timer => clearTimeout(timer));
        notificationTimersRef.current = [];
        addDebugInfo('Cleared notification timers');
    }, []);
    
   
    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/events/`, {
                headers: {
                    Authorization: `Bearer ${authTokens.access_token}`,
                },
            });
            const formattedEvents = response.data.events.map((event) => ({
                id: event.id,
                title: event.title,
                start: new Date(event.datetime),
                description: event.description,
                reminder: event.reminder
            }));
            setEvents(formattedEvents);
            addDebugInfo(`Fetched ${formattedEvents.length} events`);
            addDebugInfo(`Events with reminders: ${formattedEvents.filter(e => e.reminder).length}`);
        } catch (err) {
            console.error('Error fetching events:', err);
            addDebugInfo(`Error fetching events: ${err.message}`);
        }
    };

    const checkUpcomingEvents = useCallback(() => {
        clearNotificationTimers();
        const now = new Date();
        addDebugInfo(`Checking upcoming events at: ${now.toLocaleString()}`);
        
        events.forEach(event => {
            if (event.reminder === true) {  // Explicitly check for true
                const eventTime = new Date(event.start);
                const timeDiff = eventTime.getTime() - now.getTime();
                addDebugInfo(`Event with reminder: ${event.title}, Time: ${eventTime.toLocaleString()}, Time Difference: ${timeDiff}ms`);
                
                if (timeDiff >= 0 && timeDiff <= 300000) { // 5 minutes
                    addDebugInfo(`Setting notification for event: ${event.title}`);
                    const timer = setTimeout(() => {
                        addDebugInfo(`Showing notification for event: ${event.title}`);
                        setNotificationEvent(event);
                        setTimeout(() => {
                            addDebugInfo(`Clearing notification for event: ${event.title}`);
                            setNotificationEvent(null);
                        }, 10000);
                    }, timeDiff);
                    notificationTimersRef.current.push(timer);
                }
            } else {
                addDebugInfo(`Skipping event without reminder: ${event.title}`);
            }
        });
    }, [events]);

    useEffect(() => {
        fetchEvents();
        const intervalId = setInterval(fetchEvents, 60000); 
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        checkUpcomingEvents();
        const intervalId = setInterval(checkUpcomingEvents, 5000);
        return () => {
            clearInterval(intervalId);
            clearNotificationTimers();
        };
    }, [checkUpcomingEvents]);

    useEffect(() => {
        addDebugInfo(`Notification event changed: ${notificationEvent ? notificationEvent.title : 'null'}`);
    }, [notificationEvent]);

    const handleDateClick = (arg) => {
        setSelectedEvent({ start: arg.date, reminder: true });
        setOpen(true);
    };

    const handleEventClick = (arg) => {
        setSelectedEvent({
            id: arg.event.id,
            title: arg.event.title,
            start: arg.event.start,
            description: arg.event.extendedProps.description || '',
            reminder: arg.event.extendedProps.reminder
        });
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedEvent(null);
        setOpen(false);
    };

    const handleSave = async (eventData) => {
        try {
            const utcDate = new Date(Date.UTC(
                eventData.start.getFullYear(),
                eventData.start.getMonth(),
                eventData.start.getDate(),
                eventData.start.getHours(),
                eventData.start.getMinutes(),
                eventData.start.getSeconds()
            ));

            const savedData = {
                ...eventData,
                datetime: utcDate.toISOString(),
                reminder: eventData.reminder === true, 
            };

            addDebugInfo(`Saving event: ${JSON.stringify(savedData)}`);

            if (eventData.id) {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/events/${eventData.id}`, savedData, {
                    headers: {
                        Authorization: `Bearer ${authTokens.access_token}`,
                    },
                });
                addDebugInfo(`Updated event: ${eventData.id}`);
            } else {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/events/`, savedData, {
                    headers: {
                        Authorization: `Bearer ${authTokens.access_token}`,
                    },
                });
                addDebugInfo(`Created new event: ${response.data.id}`);
            }
            fetchEvents();
            handleClose();
        } catch (err) {
            console.error('Error saving event:', err);
            addDebugInfo(`Error saving event: ${err.message}`);
        }
    };

    const handleDelete = async (eventId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${authTokens.access_token}`,
                },
            });
            fetchEvents();
            handleClose();
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(/\s/g, '').toLowerCase();
    };

    const renderEventContent = (eventInfo) => {
        const startTime = formatTime(eventInfo.event.start);
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 0.5,
                bgcolor: eventInfo.event.extendedProps.reminder ? 'primary.main' : 'grey.500',
                color: 'white',
                borderRadius: 1,
                fontSize: '0.8rem',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {startTime}
                </Typography>
                <Typography variant="body2" sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {eventInfo.event.title}
                </Typography>
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {notificationEvent && (
                <EventNotification eventTitle={notificationEvent.title} />
            )}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    Your Calendar
                </Typography>
                <Box sx={{ height: 'calc(100vh - 200px)', mb: 3 }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        height="100%"
                        aspectRatio={1.75}
                        dayMaxEvents={3}
                        eventDisplay="block"
                        slotLabelFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short',
                            hour12: true
                        }}
                    />
                </Box>
            </Paper>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="event-form-modal"
                aria-describedby="modal-to-create-or-edit-events"
            >
                <Box sx={modalStyle}>
                    <EventForm
                        event={selectedEvent}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onClose={handleClose}
                    />
                </Box>
            </Modal>
        </Container>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto',
};

export default CalendarComponent;