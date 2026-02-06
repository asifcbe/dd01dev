import { useState, useEffect, useCallback } from "react";
import { handleApiError } from "./utils";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Fade,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import LoadMask from "./LoadMask";

export const COUNTRIES = [
  { name: 'United States', code: 'US', phoneCode: '+1', shortCode: 'USA' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44' ,shortCode: 'UK'},
  { name: 'India', code: 'India', phoneCode: '+91',shortCode: 'India' },
  { name: 'Germany', code: 'DE', phoneCode: '+49',shortCode: 'Germany' },
  { name: 'France', code: 'FR', phoneCode: '+33', shortCode: 'France' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', shortCode: 'Japan' },
  { name: 'Canada', code: 'CA', phoneCode: '+1',shortCode: 'Canada' },
  { name: 'Australia', code: 'AU', phoneCode: '+61' ,shortCode: 'Australia'},
  {name:'China', code:'CN', phoneCode:'+86', shortCode:'China'},
];

export default function ParticipantManager({
  title,
  icon,
  apiType,
  apiDetailType,
  apiDetailTypeSingle,
  fields,
  displayFields,
  subheaderField,
  initialForm,
  type2,
  type3 = "NotApplicable",
}) {
  const Icon = icon;
  const [items, setItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newItem, setNewItem] = useState(initialForm);
  const [editItem, setEditItem] = useState(initialForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [addFields, setAddFields] = useState(fields);
  const [editFields, setEditFields] = useState(fields);
  
  // Separate state for phone number input (10 digits only)
  const [newItemPhoneNumber, setNewItemPhoneNumber] = useState("");
  const [editItemPhoneNumber, setEditItemPhoneNumber] = useState("");
  const [newItemCountryCode, setNewItemCountryCode] = useState("");
  const [editItemCountryCode, setEditItemCountryCode] = useState("");
  
  const filteredItems = items.filter(item =>
    fields.some(field => item[field.name]?.toLowerCase().includes(search.toLowerCase()))
  );

  const fetchItems = useCallback(() => {
    let url = "";
    
    if(true){
      url=`/api/${apiDetailType}`
    }else{
      url=`/api/participants?type1=${apiType}`
    }
    fetch(url, {
      method: "GET",
    })
      .then((res) => handleApiError(res, `Failed to fetch ${title.toLowerCase()}`))
      .then((response) => response.json())
      .then((data) => {
        setItems(data);
        setDataLoaded(true);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error(`Error fetching ${title.toLowerCase()}:`, error);
        setDataLoaded(true);
        setError(error.message);
      });
  }, [apiType, title, apiDetailType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (apiType === "Bank") {
      const updateFields = (item) => {
        return fields.map(field => {
          if (field.name === "bankCode") {
            let label = "Bank Code";
            if (item.region === "India") label = "IFSC Code";
            else if (item.region === "America") label = "Routing Number";
            else if (item.region === "Europe") label = "IBAN";
            return { ...field, label };
          }
          return field;
        });
      };
      setAddFields(updateFields(newItem));
      setEditFields(updateFields(editItem));
    } else {
      setAddFields(fields);
      setEditFields(fields);
    }
  }, [fields, newItem.region, editItem.region, apiType]);

  const handleOpen = () => {
    setOpen(true);
    // Reset phone fields
    setNewItemPhoneNumber("");
    setNewItemCountryCode("");
  };
  
  const handleClose = () => {
    setOpen(false);
    setNewItem(initialForm);
    setNewItemPhoneNumber("");
    setNewItemCountryCode("");
  };

  const handleEditOpen = (idx) => {
    const item = items[idx];
    setEditItem(item);
    // Parse backend phone data for edit form
    setEditItemPhoneNumber(item.mobile || "");
    const country = COUNTRIES.find(c => c.shortCode === item.country);
    setEditItemCountryCode(country?.phoneCode || "");
    setEditOpen(true);
  }; 
  
  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(initialForm);
    setEditItemPhoneNumber("");
    setEditItemCountryCode("");
  }; 
  
  const handleClone = (item) => {
    setNewItem({
      ...initialForm,
      ...item,
      name: `${item.name} (Copy)`,
    });
    setNewItemPhoneNumber(item.mobile || "");
    const country = COUNTRIES.find(c => c.shortCode === item.country);
    setNewItemCountryCode(country?.phoneCode || "");
    setOpen(true);
  };

  const handleChange = (e) => {
    setNewItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  
  const handleEditChange = (e) => {
    setEditItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update phone number states when country changes
  const handleNewCountryChange = (event, newValue) => {
    const newCode = newValue ? newValue.phoneCode : '';
    setNewItemCountryCode(newCode);
    setNewItem({
      ...newItem,
      country: newValue ? newValue.shortCode : ""
    });
  };

  const handleEditCountryChange = (event, newValue) => {
    const newCode = newValue ? newValue.phoneCode : '';
    setEditItemCountryCode(newCode);
    setEditItem({
      ...editItem,
      country: newValue ? newValue.shortCode : ""
    });
  };

  // Helper to get 10-digit phone number for backend
  const getPhoneNumberForBackend = (phoneNumber) => {
    return phoneNumber.replace(/\D/g, '').slice(0, 10);
  };

  // Helper to format full mobile for display
  const getFullMobileForDisplay = (backendPhoneNumber, countryCode) => {
    if (!backendPhoneNumber) return '';
    return `${countryCode} ${backendPhoneNumber}`;
  };

  const handleAdd = () => {
    const backendPhoneNumber = getPhoneNumberForBackend(newItemPhoneNumber);
    
    if (apiType === "Bank") {
      const newId = Math.max(...items.map(item => item.id), 0) + 1;
      const itemToAdd = {
        ...newItem,
        id: newId,
        mobile: backendPhoneNumber,
        type1: apiType,
        type2: type2 ? type2(newItem) : "NotApplicable",
        type3,
      };
      setItems(prev => [...prev, itemToAdd]);
      handleClose();
      setSuccess("Bank added successfully!");
      return;
    }
    
    const itemToAdd = {
      ...newItem,
      mobile: backendPhoneNumber,
      country: newItem.country || "",
      type1: apiType,
      type2: type2 ? type2(newItem) : "NotApplicable",
      type3,
    };
    
    fetch(`/api/${apiDetailTypeSingle}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemToAdd),
      credentials: "include",
    })
      .then((res) => handleApiError(res, `Failed to add ${title.toLowerCase()}`))
      .then((response) => response.json())
      .then(() => {
        fetchItems(); 
        handleClose();
        setSuccess(`${title.slice(0, -1)} added successfully!`);
      })
      .catch((error) => {
        console.error(`Error adding ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleEdit = () => {
    const backendPhoneNumber = getPhoneNumberForBackend(editItemPhoneNumber);
    
    if (apiType === "Bank") {
      setItems((prev) =>
        prev.map((item) => (item.id === editItem.id ? {
          ...editItem,
          mobile: backendPhoneNumber
        } : item))
      );
      handleEditClose();
      setSuccess("Bank updated successfully!");
      return;
    }
    
    const updatedItem = {
      ...editItem,
      mobile: backendPhoneNumber,
    };
    
    fetch(`/api/participant/${editItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
      credentials: "include",
    })
      .then((res) => handleApiError(res, `Failed to update ${title.toLowerCase()}`))
      .then((response) => response.json())
      .then((updatedItemFromServer) => {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItemFromServer.id ? updatedItemFromServer : item))
        );
        handleEditClose();
        setSuccess(`${title.slice(0, -1)} updated successfully!`);
      })
      .catch((error) => {
        console.error(`Error updating ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleDelete = (idx) => {
    if (apiType === "Bank") {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
      setSuccess("Bank deleted successfully!");
      return;
    }
    const itemToDelete = items[idx];
    fetch(`/api/participant?participant_id=${itemToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => handleApiError(res, `Failed to delete ${title.toLowerCase()}`))
      .then(() => {
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
        setSuccess(`${title.slice(0, -1)} deleted successfully!`);
      })
      .catch((error) => {
        console.error(`Error deleting ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEls((prev) =>
      prev.map((el, i) => (i === idx ? event.currentTarget : el))
    );
  };
  
  const handleMenuClose = (idx) => {
    setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? null : el)));
  };

  const renderField = (field, value, onChange, isEdit = false) => {
    const labelId = `${isEdit ? 'edit' : 'add'}-${field.name}-label`;
    
    if (field.name === 'mobile') {
      const currentCountryCode = isEdit ? editItemCountryCode : newItemCountryCode;
      const currentPhoneNumber = isEdit ? editItemPhoneNumber : newItemPhoneNumber;
      const selectedCountry = COUNTRIES.find(c => c.phoneCode === currentCountryCode) || null;
      
      return (
        <Box key={field.name} sx={{ mt: 2, mb: 1 }}>
          <Autocomplete
            options={COUNTRIES}
            getOptionLabel={(option) => option.name}
            value={selectedCountry}
            onChange={isEdit ? handleEditCountryChange : handleNewCountryChange}
            renderInput={(params) => <TextField {...params} label="Country" margin="normal" fullWidth />}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
            <TextField
              label="Code"
              value={currentCountryCode}
              InputProps={{ readOnly: true }}
              size="small"
              sx={{ width: '80px' }}
            />
            <TextField
              fullWidth
              label={field.label}
              value={currentPhoneNumber}
              onChange={(e) => {
                const phoneNumber = e.target.value.replace(/\D/g, '').slice(0, 10);
                if (isEdit) {
                  setEditItemPhoneNumber(phoneNumber);
                } else {
                  setNewItemPhoneNumber(phoneNumber);
                }
              }}
              inputProps={{ maxLength: 10 }}
            />
          </Box>
        </Box>
      );
    }
    
    if (field.type === 'autocomplete') {
      return (
        <Autocomplete
          key={field.name}
          options={field.options}
          value={value}
          onChange={(event, newValue) => {
            onChange({ target: { name: field.name, value: newValue || "" } });
          }}
          renderInput={(params) => <TextField {...params} label={field.label} margin="normal" fullWidth />}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <FormControl margin="normal" fullWidth key={field.name}>
          <InputLabel id={labelId}>{field.label}</InputLabel>
          <Select
            labelId={labelId}
            name={field.name}
            value={value}
            label={field.label}
            onChange={onChange}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value || option} value={option.value || option}>
                {option.label || option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      return (
        <TextField
          margin="normal"
          fullWidth
          label={field.label}
          name={field.name}
          value={value}
          onChange={onChange}
          key={field.name}
        />
      );
    }
  };

  return (
    !dataLoaded ? (
      <LoadMask text={`Loading ${title}`} />
    ) : (
      <Box>
        {/* Header Bar with Centered Search and Add Button */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4, position: 'relative' }}>
          
          {/* Centered Search Bar */}
          <TextField
             placeholder={`Search ${title}...`}
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
            Add {apiType}
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {filteredItems.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 1 }}>
              <Fade in>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper", // Use theme background
                      ":hover": { 
                          boxShadow: (theme) => theme.shadows[4], 
                          borderColor: "primary.main" 
                      },
                      border: "1px solid",
                      borderColor: "divider", // Use theme border
                      position: "relative",
                      width: '100%', // Flexible width
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            mr: 1,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Icon sx={{ color: 'primary.contrastText' }} />
                        </Avatar>
                      }
                      title={
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "text.primary" }}
                        >
                          {item.name}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                          {subheaderField && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item[subheaderField]}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BadgeIcon sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.7 }} />
                            <Typography sx={{ fontSize: 10, fontWeight: 'medium', color: 'text.secondary', opacity: 0.7 }}>
                              ID: {item.id}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      action={
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, idx)}
                          sx={{ color: "text.secondary" }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                      sx={{
                        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "#f8f9fa", // Slight contrast for header
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        minHeight: 60,
                      }}
                    />
                  
                  <Menu
                    anchorEl={menuAnchorEls[idx]}
                    open={Boolean(menuAnchorEls[idx])}
                    onClose={() => handleMenuClose(idx)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleEditOpen(idx);
                        handleMenuClose(idx);
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClone(filteredItems[idx]);
                        handleMenuClose(idx);
                      }}
                    >
                      <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Clone
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(idx);
                        handleMenuClose(idx);
                      }}
                    >
                      <DeleteIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "#f44336" }}
                      />{" "}
                      Delete
                    </MenuItem>
                  </Menu>
                  
                  <Divider sx={{ mb: 2, mt: 0 }} />
                  <CardContent>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {displayFields.map((df) => {
                        let displayLabel = df.label;
                        let displayValue = item[df.name];
                        
                        // Format mobile for display with country code
                        if (df.name === 'mobile' && item.country) {
                          const country = COUNTRIES.find(c => c.shortCode === item.country);
                          displayValue = getFullMobileForDisplay(item[df.name], country?.phoneCode || '');
                        }
                        
                        if (apiType === "Bank" && df.name === "bankCode") {
                          if (item.region === "India") displayLabel = "IFSC Code";
                          else if (item.region === "America") displayLabel = "Routing Number";
                          else if (item.region === "Europe") displayLabel = "IBAN";
                        }
                        return (
                          <Typography key={df.name} sx={{ fontSize: 15, color: "text.secondary" }}>
                            <b>{displayLabel}:</b> {displayValue}
                          </Typography>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Add Dialog */}
        <Dialog open={open} onClose={() => {}} disableEscapeKeyDown={true}>
          <DialogTitle>Add {apiType}</DialogTitle>
          <DialogContent>
            {addFields.map((field) => renderField(field, newItem[field.name], handleChange, false))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => {}} disableEscapeKeyDown={true}>
          <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          <DialogContent>
            {editFields.map((field) => renderField(field, editItem[field.name], handleEditChange, true))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEdit} variant="contained">
              Save
            </Button>
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
    )
  );
}
