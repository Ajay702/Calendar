import React from 'react';
import { Box, Typography } from '@mui/material';

const EventNotification = ({ eventTitle }) => {
  console.log('Rendering EventNotification component');
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        backgroundColor: '#FFFACD',
        padding: 2,
        borderRadius: 2,
        boxShadow: 2,
        zIndex: 9999,
      }}
    >
      <Typography variant="body1" fontWeight="bold">
        Event Starting Now
      </Typography>
      <Typography variant="body2">{eventTitle}</Typography>
    </Box>
  );
};

export default EventNotification;