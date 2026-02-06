import React, { useState, useEffect } from "react";
import { handleApiError } from "./utils";
import {
  Box, Button, Card, CardContent, CardHeader, IconButton, Typography, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem,
  Fade, Avatar, Divider, FormControl, InputLabel, Select, Snackbar, Alert, Autocomplete,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  Assignment as ProjectsIcon
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import LoadMask from "./LoadMask";

const COUNTRIES = [
  { name: 'United States', code: 'US', phoneCode: '+1' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44' },
  { name: 'India', code: 'IN', phoneCode: '+91' },
  { name: 'Germany', code: 'DE', phoneCode: '+49' },
  { name: 'France', code: 'FR', phoneCode: '+33' },
  { name: 'Japan', code: 'JP', phoneCode: '+81' },
  { name: 'Canada', code: 'CA', phoneCode: '+1' },
  { name: 'Australia', code: 'AU', phoneCode: '+61' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase()) ||
    project.given_by?.toLowerCase().includes(search.toLowerCase()) ||
    project.taken_by?.toLowerCase().includes(search.toLowerCase())
  );
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    given_by: "",
    taken_by: "",
    start_date: "",
    end_date: "",
    rate_mode: "",
    rate_amount: "",
    currency: ""
  });
  const [editProject, setEditProject] = useState({
    name: "",
    description: "",
    given_by: "",
    taken_by: "",
    start_date: "",
    end_date: "",
    rate_mode: "",
    rate_amount: "",
    currency: ""
  });
  const [menuAnchorEls, setMenuAnchorEls] = useState({});

  useEffect(() => {
    fetch("api/projects", { method: "GET" })
      .then((res) => handleApiError(res, "Failed to fetch projects"))
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setDataLoaded(true);
        setMenuAnchorEls({});
      })
      .catch((error) => {
        setDataLoaded(true);
        console.error("Error fetching projects:", error);
      });

    fetch("api/participants", { method: "GET" })
      .then((res) => handleApiError(res, "Failed to fetch participants"))
      .then((response) => response.json())
      .then((data) => {
        setParticipants(data);
      })
      .catch((error) => {
        console.error("Error fetching participants:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProject({
      name: "",
      description: "",
      given_by: "",
      taken_by: "",
      start_date: "",
      end_date: "",
      rate_mode: "",
      rate_amount: "",
      currency: ""
    });
  };
  const handleEditOpen = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setEditProject({
      ...project,
      given_by: participants.find(p => p.name === project.given_by)?.id || "",
      taken_by: participants.find(p => p.name === project.taken_by)?.id || "",
    });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };
  const handleChange = (e) => { setNewProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleEditChange = (e) => { setEditProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleAddProject = () => {
    fetch("/api/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to add project"))
      .then((response) => response.json())
      .then(() => {
        // Refetch projects to ensure the list is up to date with names
        fetch("api/projects", { method: "GET" })
          .then((response) => response.json())
          .then((data) => {
            setProjects(data);
            setMenuAnchorEls({});
            handleClose();
          })
          .catch((error) => {
            console.error("Error refetching projects:", error);
            handleClose();
            setSuccess("Project added successfully!");
          });
      })
      .catch((error) => {
        console.error("Error adding project:", error);
        setError(error.message);
      });
  };
  const handleEditProject = () => {
    fetch(`/api/project/${editProject.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editProject),
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to update project"))
      .then((response) => response.json())
      .then((updatedProject) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === editProject.id ? updatedProject : p))
        );
        handleEditClose();
        setSuccess("Project updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating project:", error);
        setError(error.message);
      });
  };
  const handleDeleteProject = (projectId) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    fetch(`/api/project?project_id=${projectToDelete.id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to delete project"))
      .then((response) => {
        setProjects((prev) => prev.filter(p => p.id !== projectId));
        // No need to filter menuAnchorEls since it's by id
        setSuccess("Project deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
        setError(error.message);
      });
  };
  const handleClone = (project) => {
    setNewProject({
      ...project,
      name: `${project.name} (Copy)`,
      given_by: participants.find(p => p.name === project.given_by)?.id || "",
      taken_by: participants.find(p => p.name === project.taken_by)?.id || "",
    });
    setOpen(true);
  };
  const handleMenuOpen = (event, projectId) => { setMenuAnchorEls((prev) => ({ ...prev, [projectId]: event.currentTarget })); };
  const handleMenuClose = (projectId) => { setMenuAnchorEls((prev) => ({ ...prev, [projectId]: null })); };

  return (
    !dataLoaded ? <LoadMask text='Loading Projects' /> : <Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4, position: 'relative' }}>
          
          {/* Centered Search Bar */}
          <TextField
             placeholder="Search Projects..."
             variant="outlined"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             sx={{ 
                width: '100%', 
                maxWidth: 500,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    '& fieldset': { border: '1px solid', borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    pl: 2
                }
             }}
             InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
             }}
          />

          {/* Add Button positioned absolutely to the right */}
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleOpen}
            sx={{ 
                position: { md: 'absolute' }, 
                right: { md: 0 },
                top: { md: '50%' },
                transform: { md: 'translateY(-50%)' },
                borderRadius: '50px',
                px: 3,
                textTransform: 'none',
                ml: { xs: 2, md: 0 }, // Margin for mobile where it might wrap or sit next
                boxShadow: '0 4px 14px rgba(0, 163, 255, 0.3)'
            }}
          >
            Add Project
          </Button>
        </Box>
      <Grid container spacing={3} >
        {filteredProjects.map((project, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 1 }}>
            <Fade in>
              <Card elevation={0} sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                ":hover": { boxShadow: (theme) => theme.shadows[4], borderColor: "primary.main" },
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                transition: 'all 0.2s ease-in-out'
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                      <ProjectsIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      {project.name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                      <BadgeIcon sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.7 }} />
                      <Typography sx={{ fontSize: 10, fontWeight: 'medium', color: 'text.secondary', opacity: 0.7 }}>
                        ID: {project.id}
                      </Typography>
                    </Box>
                  }
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, project.id)} sx={{ color: "#868ca0" }}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{
                    background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "#f0f2fa", 
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    minHeight: 60
                  }}
                />
                <Menu anchorEl={menuAnchorEls[project.id]} open={Boolean(menuAnchorEls[project.id])} onClose={() => handleMenuClose(project.id)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}>
                  <MenuItem onClick={() => { handleEditOpen(project.id); handleMenuClose(project.id); }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => { handleClone(project); handleMenuClose(project.id); }}>
                    <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Clone
                  </MenuItem>
                  <MenuItem onClick={() => { handleDeleteProject(project.id); handleMenuClose(project.id); }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                  </MenuItem>
                </Menu>
                <Divider sx={{ mb: 2, mt: 0 }} />
                <CardContent>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Description:</b> {project.description ?? "None"}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Given By:</b> {project.given_by}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Taken By:</b> {project.taken_by}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Start Date:</b> {project.start_date}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>End Date:</b> {project.end_date}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Rate Mode:</b> {project.rate_mode}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Rate Amount:</b> {project.rate_amount}</Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}><b>Currency:</b> {project.currency}</Typography>
                   </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      {/* <Box sx={{ mt: 5, textAlign: "left" ,p: 1}}>
        <Button variant="contained" size="large" onClick={handleOpen}>Add Project</Button>
      </Box> */}
      <Dialog open={open} onClose={() => {}} disableEscapeKeyDown={true}>
        <DialogTitle>Add Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newProject.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={newProject.description} onChange={handleChange} />
          <Autocomplete
            options={participants}
            getOptionLabel={(option) => option.name}
            value={participants.find(p => p.id === newProject.given_by) || null}
            onChange={(event, newValue) => {
              setNewProject((prev) => ({ ...prev, given_by: newValue ? newValue.id : "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Given By" margin="normal" />}
            fullWidth
          />
          <Autocomplete
            options={participants}
            getOptionLabel={(option) => option.name}
            value={participants.find(p => p.id === newProject.taken_by) || null}
            onChange={(event, newValue) => {
              setNewProject((prev) => ({ ...prev, taken_by: newValue ? newValue.id : "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Taken By" margin="normal" />}
            fullWidth
          />
          <TextField margin="normal" fullWidth label="Start Date" name="start_date" type="date" value={newProject.start_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="normal" fullWidth label="End Date" name="end_date" type="date" value={newProject.end_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Rate Mode</InputLabel>
            <Select
              name="rate_mode"
              value={newProject.rate_mode}
              label="Rate Mode"
              onChange={handleChange}
            >
              <MenuItem value="Hourly">Hourly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Milestone">Milestone</MenuItem>
              <MenuItem value="Fixed">Fixed</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Rate Amount" name="rate_amount" value={newProject.rate_amount} onChange={handleChange} />
          <Autocomplete
            options={CURRENCIES}
            value={newProject.currency}
            onChange={(event, newValue) => {
              setNewProject((prev) => ({ ...prev, currency: newValue || "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Currency" margin="normal" />}
            fullWidth
          />
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddProject} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={() => {}} disableEscapeKeyDown={true}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editProject.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={editProject.description} onChange={handleEditChange} />
          <Autocomplete
            options={participants}
            getOptionLabel={(option) => option.name}
            value={participants.find(p => p.id === editProject.given_by) || null}
            onChange={(event, newValue) => {
              setEditProject((prev) => ({ ...prev, given_by: newValue ? newValue.id : "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Given By" margin="normal" />}
            fullWidth
          />
          <Autocomplete
            options={participants}
            getOptionLabel={(option) => option.name}
            value={participants.find(p => p.id === editProject.taken_by) || null}
            onChange={(event, newValue) => {
              setEditProject((prev) => ({ ...prev, taken_by: newValue ? newValue.id : "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Taken By" margin="normal" />}
            fullWidth
          />
          <TextField margin="normal" fullWidth label="Start Date" name="start_date" type="date" value={editProject.start_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="normal" fullWidth label="End Date" name="end_date" type="date" value={editProject.end_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Rate Mode</InputLabel>
            <Select
              name="rate_mode"
              value={editProject.rate_mode}
              label="Rate Mode"
              onChange={handleEditChange}
            >
              <MenuItem value="Hourly">Hourly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Milestone">Milestone</MenuItem>
              <MenuItem value="Fixed">Fixed</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Rate Amount" name="rate_amount" value={editProject.rate_amount} onChange={handleEditChange} />
          <Autocomplete
            options={CURRENCIES}
            value={editProject.currency}
            onChange={(event, newValue) => {
              setEditProject((prev) => ({ ...prev, currency: newValue || "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Currency" margin="normal" />}
            fullWidth
          />
          <Autocomplete
            options={COUNTRIES}
            getOptionLabel={(option) => option.name}
            value={COUNTRIES.find(c => c.code === editProject.country) || null}
            onChange={(event, newValue) => {
              setEditProject((prev) => ({ ...prev, country: newValue ? newValue.code : "" }));
            }}
            renderInput={(params) => <TextField {...params} label="Country" margin="normal" />}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: 600,
            fontSize: "1rem",
            fontWeight: 500,
            boxShadow: 3,
            borderRadius: 2,
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: 600,
            fontSize: "1rem",
            fontWeight: 500,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}