import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid,
  Button,
  Chip
} from '@mui/material';
import { useThemeContext, themes } from '../context/ThemeContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const themeOptions = [
  { id: 'light', name: 'Clean Light', color: '#ffffff', border: '#e2e8f0' },
  { id: 'dark', name: 'Modern Dark', color: '#1e1e1e', border: '#333' },
  { id: 'navy', name: 'Navy Blue', color: '#001e3c', border: '#0a1929' },
];

export default function Settings() {
  const { currentThemeName, changeTheme } = useThemeContext();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customize the look and feel of your application.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Theme
        </Typography>
        <Grid container spacing={3}>
          {themeOptions.map((option) => (
            <Grid item xs={12} sm={4} key={option.id}>
              <Card 
                variant="outlined"
                sx={{ 
                  borderColor: currentThemeName === option.id ? 'primary.main' : 'divider',
                  borderWidth: currentThemeName === option.id ? 2 : 1,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {currentThemeName === option.id && (
                   <Box 
                     sx={{ 
                       position: 'absolute', 
                       top: -10, 
                       right: -10, 
                       bgcolor: 'background.paper', 
                       borderRadius: '50%' 
                     }}
                   >
                     <CheckCircleIcon color="primary" />
                   </Box>
                )}
                <CardActionArea 
                    onClick={() => changeTheme(option.id)}
                    sx={{ height: '100%', p: 2 }}
                >
                    <Box 
                      sx={{ 
                        height: 100, 
                        bgcolor: option.color, 
                        borderRadius: 2, 
                        border: `1px solid ${option.border}`,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                        <Box sx={{ width: '60%', height: '12px', bgcolor: option.id === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="600" align="center">
                        {option.name}
                    </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Placeholder for future settings */}
      <Box sx={{ opacity: 0.5, pointerEvents: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Regional Settings (Coming Soon)
        </Typography>
        <Grid container spacing={2}>
             <Grid item xs={12}>
                 <Card variant="outlined"><CardContent><Typography>Currency & Date Formats</Typography></CardContent></Card>
             </Grid>
        </Grid>
      </Box>

    </Container>
  );
}
