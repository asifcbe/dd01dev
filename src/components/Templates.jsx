import React, { useState, useEffect } from "react";
import { handleApiError } from "./utils";
import {
  DesignServices as TemplatesIcon,
  AccountBalance as AccountBalanceIcon
} from "@mui/icons-material";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Snackbar,
  Alert,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

// Converter: Mermaid-style script to ReactFlow nodes/edges for neat tree
function mermaidToReactFlow(scriptArr) {
  const edgeRegex =
    /(\d+)\((\d+):([^)]+)\)\s*--\s*ProjectId:(\d+)\s*-->\s*(\d+)\((\d+):([^)]+)\)/;
  const nodeMap = {};
  const edgeArr = [];
  scriptArr.forEach((line) => {
    if (line.startsWith("graph")) return;
    const match = edgeRegex.exec(line);
    if (match) {
      const leftId = match[1];
      const leftLabel = match[3];
      nodeMap[leftId] = leftLabel;
      const rightId = match[5];
      const rightLabel = match[7];
      nodeMap[rightId] = rightLabel;
      edgeArr.push({
        id: `e${leftId}-${rightId}`,
        source: leftId,
        target: rightId,
        label: `ProjectId:${match[4]}`,
        type: "smoothstep",
      });
    }
  });

  // Find roots (no incoming edges)
  const roots = Object.keys(nodeMap).filter(
    (id) => !edgeArr.some((edge) => edge.target === id)
  );
  const levels = {};
  const placed = {};
  function traverse(id, level = 0) {
    if (placed[id]) return;
    placed[id] = true;
    levels[level] = levels[level] || [];
    levels[level].push(id);
    edgeArr
      .filter((edge) => edge.source === id)
      .forEach((edge) => traverse(edge.target, level + 1));
  }
  roots.forEach((rootId, i) => traverse(rootId, 0, i));
  const nodeList = [];
  Object.entries(levels).forEach(([lev, ids]) => {
    ids.forEach((id, x) => {
      nodeList.push({
        id: id,
        position: { x: 300 * x + 100, y: 120 * lev + 20 },
        data: { label: `${id}:${nodeMap[id]}` },
        style: { border: "2px solid #b0b6e3", borderRadius: 10 },
      });
    });
  });
  return { nodes: nodeList, edges: edgeArr };
}

export default function Templates() {
  const [tabIdx, setTabIdx] = useState(0);
  const [templateList, setTemplateList] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [menuAnchors, setMenuAnchors] = useState({});
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [banks, setBanks] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    currency: "",
    project_ids: [],
    bank_id: 0
  });
  const [editTemplate, setEditTemplate] = useState({
    id: null,
    name: "",
    description: "",
    currency: "",
    project_ids: [],
    bank_id: 0
  });

  useEffect(() => {
    fetch("api/templates", { method: "GET" })
      .then((res) => handleApiError(res, "Failed to fetch templates"))
      .then((res) => res.json())
      .then((data) => {
        setTemplateList(Object.values(data));
      })
      .catch(console.error);
  }, []);

  // Fetch projects
  useEffect(() => {
    fetch("api/projects", { method: "GET" })
      .then((res) => handleApiError(res, "Failed to fetch projects"))
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : Object.values(data));
      })
      .catch(console.error);
  }, []);

  // Fetch banks
  useEffect(() => {
    fetch("api/banks", { method: "GET" })
      .then((res) => handleApiError(res, "Failed to fetch banks"))
      .then((res) => res.json())
      .then((data) => {
        setBanks(Array.isArray(data) ? data : Object.values(data));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;
    fetch(`api/template/tree-view?template_id=${selectedTemplateId}`)
      .then((res) => handleApiError(res, "Failed to fetch tree data"))
      .then((res) => res.json())
      .then((data) => {
        const { nodes, edges } = mermaidToReactFlow(data.script);
        setNodes(nodes);
        setEdges(edges);
        setTabIdx(1);
      })
      .catch(console.error);
  }, [selectedTemplateId]);

  // Dialog handlers
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      currency: "",
      project_ids: [],
      bank_id: 0
    });
  };

  const handleEditOpen = (template) => {
    setEditTemplate({
      id: template.id,
      name: template.name || "",
      description: template.description || "",
      currency: template.currency || "",
      project_ids: Array.isArray(template.project_ids) ? template.project_ids : [],
      bank_id: template.bank_id || 0
    });
    setEditOpen(true);
    handleMenuClose(template.id);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditTemplate({
      id: null,
      name: "",
      description: "",
      currency: "",
      project_ids: [],
      bank_id: 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectsChange = (event, newValue) => {
    setNewTemplate((prev) => ({
      ...prev,
      project_ids: newValue ? newValue.map(p => p.id) : []
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTemplate((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProjectsChange = (event, newValue) => {
    setEditTemplate((prev) => ({
      ...prev,
      project_ids: newValue ? newValue.map(p => p.id) : []
    }));
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.currency || !newTemplate.bank_id) {
      setError("Please fill in all required fields");
      return;
    }

    fetch("api/template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTemplate),
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to add template"))
      .then((response) => response.json())
      .then(() => {
        // Refresh templates list
        fetch("api/templates", { method: "GET" })
          .then((res) => handleApiError(res, "Failed to fetch templates"))
          .then((res) => res.json())
          .then((data) => {
            setTemplateList(Object.values(data));
          })
          .catch(console.error);
        handleClose();
        setSuccess("Template added successfully!");
      })
      .catch((error) => {
        console.error("Error adding template:", error);
        setError(error.message);
      });
  };

  const handleEditSubmit = () => {
    if (!editTemplate.name || !editTemplate.currency || !editTemplate.bank_id) {
      setError("Please fill in all required fields");
      return;
    }

    fetch(`api/template?template_id=${editTemplate.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: editTemplate.name,
        description: editTemplate.description,
        currency: editTemplate.currency,
        project_ids: editTemplate.project_ids,
        bank_id: editTemplate.bank_id
      }),
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to update template"))
      .then((response) => response.json())
      .then(() => {
        // Refresh templates list
        fetch("api/templates", { method: "GET" })
          .then((res) => handleApiError(res, "Failed to fetch templates"))
          .then((res) => res.json())
          .then((data) => {
            setTemplateList(Object.values(data));
          })
          .catch(console.error);
        handleEditClose();
        setSuccess("Template updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating template:", error);
        setError(error.message);
      });
  };

  const handleDeleteConfirm = (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    fetch(`api/template?template_id=${templateId}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => handleApiError(res, "Failed to delete template"))
      .then((response) => response.json())
      .then(() => {
        // Refresh templates list
        fetch("api/templates", { method: "GET" })
          .then((res) => handleApiError(res, "Failed to fetch templates"))
          .then((res) => res.json())
          .then((data) => {
            setTemplateList(Object.values(data));
          })
          .catch(console.error);
        handleMenuClose(templateId);
        setSuccess("Template deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting template:", error);
        setError(error.message);
      });
  };

  // Menu handlers
  const handleMenuOpen = (event, templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: event.currentTarget }));
  };
  const handleMenuClose = (templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: null }));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4, position: 'relative' }}>
          
          {/* Centered Search Bar */}
          <TextField
             placeholder="Search Templates..."
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
            Add Template
          </Button>
      </Box>
      <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 2 }}>
        <Tab label="List Templates" />
        <Tab label="Tree View" disabled={!selectedTemplateId} />
      </Tabs>
      {tabIdx === 0 && (
        <Grid container spacing={4}>
          {templateList
            .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.description && t.description.toLowerCase().includes(search.toLowerCase())))
            .map((template) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={template.id}
              sx={{ display: "flex", justifyContent: "center", p: 1 }}
            >
              <Card
                elevation={0}
                sx={{
                  width: 370,
                  maxWidth: "100%",
                  minHeight: 320,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "background.paper",
                  ":hover": { 
                      boxShadow: (theme) => theme.shadows[4], 
                      borderColor: "primary.main" 
                  },
                  border: "1px solid",
                  borderColor: "divider",
                  p: 0,
                  mx: "auto",
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 40, height: 40 }}
                    >
                      <TemplatesIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {template.name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                      <BadgeIcon sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.7 }} />
                      <Typography sx={{ fontSize: 10, fontWeight: 'medium', color: 'text.secondary', opacity: 0.7 }}>
                        ID: {template.id}
                      </Typography>
                    </Box>
                  }
                  action={
                    <>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, template.id)}
                        sx={{ color: "#868ca0" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchors[template.id]}
                        open={Boolean(menuAnchors[template.id])}
                        onClose={() => handleMenuClose(template.id)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem
                          onClick={() => handleEditOpen(template)}
                        >
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteConfirm(template.id)}
                        >
                          <DeleteIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "#f44336" }}
                          />{" "}
                          Delete
                        </MenuItem>
                      </Menu>
                    </>
                  }
                  sx={{
                    background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "#f0f2fa",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    minHeight: 60,
                    px: 2,
                  }}
                />
                <Divider sx={{ mb: 0, mt: 0 }} />
                <CardContent sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {template.description || "No description available."}
                  </Typography>
                  <Typography sx={{ mb: 0, fontWeight: "bold" }}>
                    Projects:
                  </Typography>
                  {template.projects && template.projects.length > 0 ? (
                    <List dense disablePadding>
                      {template.projects.map((project) => (
                        <ListItem key={project.id} sx={{ pl: 1 }}>
                          <ListItemText
                            primary={
                              <span>
                                <b>{project.given_by}</b> &rarr;{" "}
                                <b>{project.taken_by}</b>
                              </span>
                            }
                            secondary={
                              <span style={{ fontSize: 11 }}>
                                {project.rate_amount} {project.currency} (
                                {project.rate_mode})
                              </span>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No projects
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <AccountBalanceIcon fontSize="small" sx={{ color: "primary.main" }} />
                    <Typography sx={{ fontWeight: "bold" }}>
                      Bank Details:
                    </Typography>
                  </Box>
                  {template.bank_id ? (
                    <>
                      {(() => {
                        const bank = banks.find(b => b.id === template.bank_id);
                        return bank ? (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              <b>Name:</b> {bank.name}
                            </Typography>
                            {bank.bankCode && (
                              <Typography variant="body2" color="text.secondary">
                                <b>Code:</b> {bank.bankCode}
                              </Typography>
                            )}
                            {bank.region && (
                              <Typography variant="body2" color="text.secondary">
                                <b>Region:</b> {bank.region}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unknown Bank
                          </Typography>
                        );
                      })()}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No bank assigned
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <b>Currency:</b> {template.currency || "N/A"}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 1, pt: 0, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedTemplateId(template.id)}
                    sx={{ minWidth: 120 }}
                  >
                    View Tree
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {tabIdx === 1 && (
        <Box sx={{ height: 600, bgcolor: "action.hover", borderRadius: 2 }}>
          {nodes.length > 0 ? (
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background color="#aaa" />
              <Controls showInteractive={false} showZoom={true} />
            </ReactFlow>
          ) : (
            <Typography sx={{ p: 2 }}>Loading tree view...</Typography>
          )}
        </Box>
      )}

      {/* Add Template Dialog */}
      <Dialog open={open} onClose={() => {}} disableEscapeKeyDown={true}>
        <DialogTitle>Add Template</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={newTemplate.name}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={newTemplate.description}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <Autocomplete
            options={CURRENCIES}
            value={newTemplate.currency || null}
            onChange={(event, newValue) => {
              setNewTemplate((prev) => ({ ...prev, currency: newValue || "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Currency"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
            fullWidth
          />
          <Autocomplete
            multiple
            options={projects}
            getOptionLabel={(option) => option.name}
            value={projects.filter(p => newTemplate.project_ids.includes(p.id))}
            onChange={handleProjectsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projects"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
            fullWidth
          />
          <FormControl margin="normal" fullWidth>
            <InputLabel shrink>Bank</InputLabel>
            <Select
              name="bank_id"
              value={newTemplate.bank_id}
              label="Bank"
              onChange={handleChange}
            >
              <MenuItem value={0}>Select a Bank</MenuItem>
              {banks.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddTemplate} variant="contained">
            Add Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editOpen} onClose={() => {}} disableEscapeKeyDown={true}>
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={editTemplate.name}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={editTemplate.description}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
          <Autocomplete
            options={CURRENCIES}
            value={editTemplate.currency || null}
            onChange={(event, newValue) => {
              setEditTemplate((prev) => ({ ...prev, currency: newValue || "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Currency"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
            fullWidth
          />
          <Autocomplete
            multiple
            options={projects}
            getOptionLabel={(option) => option.name}
            value={projects.filter(p => editTemplate.project_ids.includes(p.id))}
            onChange={handleEditProjectsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projects"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
            fullWidth
          />
          <FormControl margin="normal" fullWidth>
            <InputLabel shrink>Bank</InputLabel>
            <Select
              name="bank_id"
              value={editTemplate.bank_id || 0}
              label="Bank"
              onChange={(e) => {
                setEditTemplate((prev) => ({
                  ...prev,
                  bank_id: e.target.value
                }));
              }}
            >
              <MenuItem value={0}>Select a Bank</MenuItem>
              {banks.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
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
