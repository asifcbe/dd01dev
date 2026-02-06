import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Avatar,
  Tab,
  Tabs,
  Button,
  AppBar,
  Badge,
  Tooltip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Groups as ClientsIcon,
  Code as DeveloperIcon,
  Business as CompaniesIcon,
  Store as VendorsIcon,
  Engineering as ConsultantsIcon,
  Assignment as ProjectsIcon,
  DesignServices as TemplatesIcon,
  ReceiptLong as InvoicesIcon,
} from "@mui/icons-material";
import CustomIcon from "./CustomIcon";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import LoadMask from "./LoadMask";

const Clients = lazy(() => import("./Clients"));
const Developer = lazy(() => import("./Developer"));
const Companies = lazy(() => import("./Companies"));
const Vendors = lazy(() => import("./Vendors"));
const Consultants = lazy(() => import("./Consultants"));
const Projects = lazy(() => import("./Projects"));
const Templates = lazy(() => import("./Templates"));
const Invoices = lazy(() => import("./Invoice"));

const dashboardItems = [
  { key: "clients", label: "Clients", icon: <ClientsIcon />, path: "clients" },
  { key: "companies", label: "Companies", icon: <CompaniesIcon />, path: "companies" },
  { key: "vendors", label: "Vendors", icon: <VendorsIcon />, path: "vendors" },
  { key: "developer", label: "Developers", icon: <DeveloperIcon />, path: "developer" }, 
  { key: "consultants", label: "Consultants", icon: <ConsultantsIcon />, path: "consultants" },
  { key: "projects", label: "Projects", icon: <ProjectsIcon />, path: "projects" },
  { key: "templates", label: "Templates", icon: <TemplatesIcon />, path: "templates" },
  { key: "invoices", label: "Invoices", icon: <InvoicesIcon />, path: "invoices" },
  // Developer item moved to end or hidden if needed, keeping it for now
];

function LinkTab(props) {
  return (
    <Tab
      component={Link}
      sx={{
        minHeight: '48px',
        borderRadius: '24px',
        px: 3,
        mx: 0.5,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: 'text.secondary',
        '&.Mui-selected': {
          color: 'common.white',
          bgcolor: 'primary.main',
        },
        '&:hover': {
           bgcolor: 'action.hover',
           color: 'primary.main',
           '&.Mui-selected': {
             color: 'common.white',
             bgcolor: 'primary.dark',
           }
        }
      }}
      {...props}
    />
  );
}

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentKey = pathParts[0] || "clients"; // Default to clients
  
  const [counts, setCounts] = useState({
    clients: 0,
    companies: 0,
    vendors: 0,
    consultants: 0,
    developer: 0,
    projects: 0,
    templates: 0,
    invoices: 0
  });

  // Find index for Tabs
  const currentTabValue = dashboardItems.findIndex(item => item.key === currentKey);
  const tabValue = currentTabValue !== -1 ? currentTabValue : false;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = [
          { key: 'clients', url: '/api/clients' },
          { key: 'companies', url: '/api/companies' },
          { key: 'banks', url: '/api/banks' },
          { key: 'vendors', url: '/api/vendors' },
          { key: 'consultants', url: '/api/consultants' },
          { key: 'developer', url: '/api/developers' },
          { key: 'projects', url: '/api/projects' },
          { key: 'templates', url: '/api/templates' },
          { key: 'invoices', url: '/api/templates' }
        ];

        const results = await Promise.all(
          endpoints.map(ep => 
            fetch(ep.url, { credentials: "include" })
              .then(res => res.json())
              .then(data => {
                const count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
                return { key: ep.key, count };
              })
              .catch(err => ({ key: ep.key, count: 0 }))
          )
        );

        const newCounts = {};
        results.forEach(r => newCounts[r.key] = r.count);
        
        // Sum Companies and Banks for the 'companies' pill
        newCounts.companies = (newCounts.companies || 0) + (newCounts.banks || 0);
        delete newCounts.banks; // Clean up temporary banks count
        
        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching counts", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* Top Header */}
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0}
        sx={{ 
          bgcolor: "background.paper", 
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: 1200 
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '8px', 
                p: 0.8, 
                display: 'flex', 
                mr: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            >
              <CustomIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                Invoice Generator
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Business Dashboard
                </Typography>
            </Box>
          </Box>

          {/* Right Section: Theme, Notifications, User */}
          <Box display="flex" alignItems="center" gap={2}>
              <Button 
                startIcon={<SettingsIcon />} 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/settings')}
                sx={{ 
                    borderRadius: '20px', 
                    textTransform: 'none', 
                    borderColor: 'divider', 
                    color: 'text.primary' 
                }}
              >
                Theme
              </Button>
              
              <Box sx={{ bgcolor: 'action.hover', borderRadius: '50%', p: 0.5 }}>
                 <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} alt={user.email} /> 
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2, color: 'text.primary' }}>
                   {user.email}
                </Typography>
                <Typography sx={{ fontWeight: 400, fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1 }}>
                   {user.org}
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton onClick={onLogout} color="primary">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
          </Box>
        </Toolbar>

        {/* Navigation Pills */}
        <Box sx={{ px: 2, pb: 2, pt: 1, bgcolor: "background.paper" }}>
             <Tabs 
                value={tabValue} 
                variant="scrollable" 
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ 
                    '& .MuiTabs-indicator': { display: 'none' }, // Hide underline indicator
                    minHeight: '48px'
                }}
             >
                {dashboardItems.map((item) => (
                    <LinkTab 
                        key={item.key} 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.icon}
                                {item.label}
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    bgcolor: tabValue === dashboardItems.indexOf(item) ? 'rgba(255,255,255,0.2)' : 'action.selected',
                                    color: tabValue === dashboardItems.indexOf(item) ? 'inherit' : 'text.secondary',
                                    borderRadius: '12px',
                                    px: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {counts[item.key] || 0}
                                </Typography>
                            </Box>
                        } 
                        to={`/${item.path}`} 
                    />
                ))}
             </Tabs>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ mt: 3, mb: 4, flexGrow: 1 }}>
        <Suspense fallback={<LoadMask text='Loading'/>}>
          <Outlet /> 
          {/* We need to render the routes defined in App.jsx here, but since App.jsx defines them as children of Layout in a sense (or rather Layout renders them via passed props or Outlet), we need to check how App.jsx uses Layout.
             Currently App.jsx uses Layout as a wrapper component: <Layout ... /> inside a Route. But Layout was handling Routes internally. 
             I will adapt this to use Outlet if migrated to nested routes, OR keep the internal Routes if simpler for now. 
             Reviewing App.jsx: it renders <Layout> inside a route. And Layout contained the Routes. 
             So I will keep the internal Routes here for minimal friction.
          */}
             <Box sx={{ minHeight: '60vh' }}>
                <Routes>
                    <Route index element={<Clients />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="developer" element={<Developer />} />
                    <Route path="companies" element={<Companies />} />
                    <Route path="vendors" element={<Vendors />} />
                    <Route path="consultants" element={<Consultants />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="templates" element={<Templates />} />
                    <Route path="invoices" element={<Invoices />} />
                </Routes>
             </Box>
        </Suspense>
      </Container>
    </Box>
  );
}
