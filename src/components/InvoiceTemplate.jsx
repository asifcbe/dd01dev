import React, { useState, useRef, useEffect } from "react";
import { getInvoiceData } from "./utils";
import {
  Typography,
  TextField,
  IconButton,
  Collapse,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Backdrop,
  useTheme,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from '@mui/icons-material/Cancel';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// --- PDF Generation Imports ---
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Constants & Config ---
const COLOR_THEMES = [
  {
    name: "Professional Blue",
    accent: "#2563eb",
    header: "#1e293b",
    bg: "#f8fafc",
    notice: "#dbeafe",
    secondary: "#64748b",
  },
  {
    name: "Elegant Purple",
    accent: "#7c3aed",
    header: "#1e1b4b",
    bg: "#faf5ff",
    notice: "#ede9fe",
    secondary: "#7c3aed",
  },
  {
    name: "Modern Green",
    accent: "#059669",
    header: "#064e3b",
    bg: "#f0fdf4",
    notice: "#d1fae5",
    secondary: "#10b981",
  },
  {
    name: "Warm Orange",
    accent: "#ea580c",
    header: "#9a3412",
    bg: "#fff7ed",
    notice: "#fed7aa",
    secondary: "#f97316",
  },
];

const ITEM_GRID_TEMPLATE =
  "48px 8px minmax(200px, 2.4fr) 8px 1.2fr 1fr 1.1fr 0.9fr 1.2fr 56px";

function formatDateToISO(dateStr) {
  if (!dateStr) return "";
  const [day, monthStr, year] = dateStr.replace(/,/g, "").split(" ");
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  return `${year}-${months[monthStr]}-${day.padStart(2, "0")}`;
}

function formatISOToDisplay(dateISO) {
  if (!dateISO) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month, day] = dateISO.split("-");
  return `${parseInt(day, 10)}, ${months[parseInt(month, 10) - 1]} ${year}`;
}

// --- Sub-components ---
const GridCell = ({ align = "left", children, sx = {} }) => (
  <Box sx={{ textAlign: align, px: 1.5, fontSize: "13px", ...sx }}>
    {children}
  </Box>
);

const NumberInput = ({
  value,
  onChange,
  placeholder,
  align = "center",
  sx,
  ...props
}) => (
  <TextField
    type="number"
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputProps={{ style: { textAlign: align } }}
    sx={{
      ...sx,
      ".MuiInputBase-root": { fontSize: 13, height: 32, minHeight: 32, pr: 0 },
      "& input": { pr: 1.5, pl: "5px" },
      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        { "-webkit-appearance": "none", margin: 0 },
      "& input::placeholder": { color: "text.primary", opacity: 0.6 },
      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.12)",
        borderWidth: "1px",
      },
    }}
    {...props}
  />
);

const CenterInput = ({ value, onChange, placeholder, sx, ...props }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputProps={{ style: { textAlign: "center" } }}
    sx={{
      ...sx,
      ".MuiInputBase-root": { fontSize: 13, height: 32, minHeight: 32 },
      "& input": { pl: "5px" },
      "& input::placeholder": { color: "text.primary", opacity: 0.6 },
      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.12)",
        borderWidth: "1px",
      },
    }}
    {...props}
  />
);

const SelectInput = ({ value, onChange, options, sx }) => (
  <Select
    size="small"
    value={value}
    onChange={onChange}
    sx={{
      ...sx,
      minWidth: 80,
      width: "100%",
      ".MuiSelect-select": {
        textAlign: "left",
        pl: "5px",
        pr: 3,
        fontSize: 13,
      },
      ".MuiInputBase-root": { height: 32, minHeight: 32 },
      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.12)",
        borderWidth: "1px",
      },
    }}
  >
    {options.map((opt) => (
      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
        {opt}
      </MenuItem>
    ))}
  </Select>
);

export default function InvoiceTemplate({
  invoiceData,
  template = { name: "Invoice" },
}) {
  let invoice=getInvoiceData(invoiceData);
  const componentRef = useRef(null);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  const [themeIdx, setThemeIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Create mode-aware instance of the current theme
  const selectedBaseTheme = COLOR_THEMES[themeIdx];
  const theme = {
    ...selectedBaseTheme,
    bg: isDark ? (selectedBaseTheme.bg === "#ffffff" || selectedBaseTheme.bg.startsWith("#f") ? "#1e1e1e" : selectedBaseTheme.bg) : selectedBaseTheme.bg,
    notice: isDark ? "#1e3a8a33" : selectedBaseTheme.notice,
    header: isDark ? "#ffffff" : selectedBaseTheme.header,
    secondary: isDark ? "#94a3b8" : selectedBaseTheme.secondary,
  };

  const [bank, setBank] = useState(null);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(invoice.bank_id ? String(invoice.bank_id) : "");
  const [bankLoading, setBankLoading] = useState(false);

  const [viewMode, setViewMode] = useState("full");
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editInvoiceDate, setEditInvoiceDate] = useState(
    formatDateToISO(invoice.invoicedate)
  );
  const [editDueDate, setEditDueDate] = useState(
    formatDateToISO(invoice.duedate)
  );

  const [localInvoiceDate, setLocalInvoiceDate] = useState(invoice.invoicedate);
  const [localDueDate, setLocalDueDate] = useState(invoice.duedate);
  const [localInvoiceItems, setLocalInvoiceItems] = useState(
    invoice.invoiceitems
  );

  const [savedExpenses, setSavedExpenses] = useState(
    invoice.invoiceitems.map(() => [])
  );
  const [additionalExpenses, setAdditionalExpenses] = useState(
    invoice.invoiceitems.map((item) => [
      {
        label: "",
        amount: "",
        duration: 0,
        currency: item.currency || "INR",
        description: "",
        ratemode: item.ratemode || "Flat",
      },
    ])
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [taxPercent, setTaxPercent] = useState(
    (invoice.tax / invoice.subtotal) * 100 || 10
  );
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Fetch bank details if bank_id exists
  useEffect(() => {
    if (selectedBankId && selectedBankId !== "") {
      setBankLoading(true);
      fetch(`/api/bank?bank_id=${selectedBankId}`, { method: "GET" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch bank");
          return res.json();
        })
        .then((data) => {
          console.log("Bank details fetched:", data);
          setBank(data);
          setBankLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching bank:", error);
          setBank(null);
          setBankLoading(false);
        });
    } else {
      setBank(null);
      setBankLoading(false);
    }
  }, [selectedBankId]);

  // Fetch available banks when in edit mode
  useEffect(() => {
    if (isEditing) {
      fetch('/api/banks', { method: 'GET' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch banks');
          return res.json();
        })
        .then((data) => {
          console.log("Available banks fetched:", data);
          setAvailableBanks(data);
        })
        .catch((error) => {
          console.error('Error fetching banks:', error);
          setAvailableBanks([]);
        });
    }
  }, [isEditing]);

  // --- HTML2CANVAS EXPORT LOGIC ---
  const handleExport = async (mode = "print") => {
    if (!componentRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      if (mode === "download") {
        pdf.save(`Invoice_${invoice.invoiceId}.pdf`);
      } else {
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => {
            URL.revokeObjectURL(url);
          };
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let subtotalCalc = 0;
    const itemsToSum =
      viewMode === "full"
        ? localInvoiceItems.map((_, i) => i)
        : [selectedItemIdx];

    itemsToSum.forEach((i) => {
      const item = localInvoiceItems[i];
      if (!item) return;

      const expenseTotal = savedExpenses[i].reduce((sum, exp) => {
        const amt = Number(exp.amount) || 0;
        return (
          sum + (exp.duration && exp.duration > 0 ? amt * exp.duration : amt)
        );
      }, 0);

      const lastExpense =
        additionalExpenses[i][additionalExpenses[i].length - 1];
      let lastExpenseAmt = 0;
      if (
        lastExpense &&
        (lastExpense.label.trim() !== "" || lastExpense.amount !== "")
      ) {
        lastExpenseAmt = Number(lastExpense.amount) || 0;
      }

      const baseTotal =
        item.duration && item.duration > 0
          ? item.rateamount * item.duration
          : item.rateamount;
      subtotalCalc += baseTotal + expenseTotal + lastExpenseAmt;
    });

    const tax = (subtotalCalc * taxPercent) / 100;
    setTaxAmount(tax);
    setGrandTotal(subtotalCalc + tax);
  }, [
    taxPercent,
    localInvoiceItems,
    savedExpenses,
    additionalExpenses,
    viewMode,
    selectedItemIdx,
  ]);

  const handleSaveChanges = () => {
    // Empty function for now - backend calls will be added later
    const changes = {
      invoiceDate: localInvoiceDate,
      dueDate: localDueDate,
      invoiceItems: localInvoiceItems,
      savedExpenses: savedExpenses,
      taxPercent: taxPercent,
      bank_id: selectedBankId || null,
      bank: bank,
    };
    console.log("Saving changes:", changes);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditInvoiceDate(formatDateToISO(localInvoiceDate));
      setEditDueDate(formatDateToISO(localDueDate));
    } else {
      setLocalInvoiceDate(formatISOToDisplay(editInvoiceDate));
      setLocalDueDate(formatISOToDisplay(editDueDate));
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };

  const handleReset = () => {
    setLocalInvoiceDate(invoice.invoicedate);
    setLocalDueDate(invoice.duedate);
    setLocalInvoiceItems(invoice.invoiceitems);
    setSavedExpenses(invoice.invoiceitems.map(() => []));
    setAdditionalExpenses(invoice.invoiceitems.map((item) => [
      {
        label: "",
        amount: "",
        duration: 0,
        currency: item.currency || "INR",
        description: "",
        ratemode: item.ratemode || "Flat",
      },
    ]));
    setTaxPercent((invoice.tax / invoice.subtotal) * 100 || 10);
    setExpandedItems({});
  };

  const toggleExpand = (idx) =>
    setExpandedItems((p) => ({ ...p, [idx]: !p[idx] }));

  const getExpensesTotal = (idx) => {
    const savedSum = savedExpenses[idx].reduce(
      (sum, e) => sum + ((e.duration ? e.amount * e.duration : e.amount) || 0),
      0
    );
    const draft = additionalExpenses[idx][additionalExpenses[idx].length - 1];
    const draftSum =
      draft.label || draft.amount ? Number(draft.amount || 0) : 0;
    return savedSum + draftSum;
  };

  const handleSavedExpenseChange = (rIdx, eIdx, key, val) => {
    const next = [...savedExpenses];
    next[rIdx][eIdx] = { ...next[rIdx][eIdx], [key]: val };
    setSavedExpenses(next);
  };

  const handleRemoveExpense = (rIdx, eIdx) => {
    const next = [...savedExpenses];
    next[rIdx] = next[rIdx].filter((_, i) => i !== eIdx);
    setSavedExpenses(next);
  };

  const handleAddExpChange = (rIdx, key, val) => {
    const next = [...additionalExpenses];
    const last = next[rIdx].length - 1;
    next[rIdx][last] = { ...next[rIdx][last], [key]: val };
    setAdditionalExpenses(next);
  };

  const handleConfirmAddExpense = (rIdx) => {
    const nextDrafts = [...additionalExpenses];
    const lastDraft = nextDrafts[rIdx][nextDrafts[rIdx].length - 1];
    if (!lastDraft.label && !lastDraft.amount) return;
    const nextSaved = [...savedExpenses];
    nextSaved[rIdx].push({ ...lastDraft });
    setSavedExpenses(nextSaved);
    nextDrafts[rIdx] = [
      {
        label: "",
        amount: "",
        duration: 0,
        currency: localInvoiceItems[rIdx].currency || "INR",
        description: "",
        ratemode: "Flat",
      },
    ];
    setAdditionalExpenses(nextDrafts);
  };

  const renderInvoiceItem = (item, idx) => {
    const baseTotal =
      item.duration && item.duration > 0
        ? item.rateamount * item.duration
        : item.rateamount;
    const rowTotal = baseTotal + getExpensesTotal(idx);

    return (
      <Box
        key={item.id}
        sx={{
          display: "grid",
          gridTemplateColumns: ITEM_GRID_TEMPLATE,
          alignItems: "center",
          px: 5,
          py: 2,
          borderBottom:
            !expandedItems[idx] && idx < localInvoiceItems.length - 1
              ? "1px solid"
              : "none",
          borderColor: "divider",
          backgroundColor: idx % 2 === 0 ? "transparent" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.6)"),
          transition: "background-color 0.2s",
        }}
      >
        <GridCell
          align="center"
          sx={{ color: theme.secondary, fontWeight: 600 }}
        >
          {String(idx + 1).padStart(2, "0")}
        </GridCell>
        <GridCell />
        <GridCell sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <TextField
              multiline
              rows={1}
              value={item.name}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].name = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                width: "100%",
                ".MuiInputBase-root": {
                  fontSize: 13,
                  p: "10px",
                  pl: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                },
                "& fieldset": { border: "none" },
                "& textarea": { pl: "5px", lineHeight: 1.5 },
              }}
            />
          ) : (
            <Typography fontWeight={500} fontSize={13}>
              {item.name}
            </Typography>
          )}
          {!expandedItems[idx] && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {item.description}
            </Typography>
          )}
        </GridCell>
        <GridCell />
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <SelectInput
              value={item.ratemode}
              options={["Flat", "Daily", "Monthly", "Hourly"]}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].ratemode = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                ".MuiOutlinedInput-notchedOutline": {
                  border: "none",
                  pl: "5px",
                },
              }}
            />
          ) : (
            item.ratemode
          )}
        </GridCell>
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <NumberInput
              value={item.duration}
              align="center"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                const newItems = [...localInvoiceItems];
                newItems[idx].duration = val;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                width: 60,
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          ) : (
            item.duration || "-"
          )}
        </GridCell>
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <NumberInput
              value={item.rateamount}
              align="center"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                const newItems = [...localInvoiceItems];
                newItems[idx].rateamount = val;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                width: 80,
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          ) : (
            item.rateamount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          )}
        </GridCell>
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <CenterInput
              value={item.currency}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].currency = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                width: 50,
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          ) : (
            item.currency
          )}
        </GridCell>
        <GridCell
          align="right"
          sx={{ fontWeight: 700, color: theme.accent, fontSize: 14 }}
        >
          {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </GridCell>
        <GridCell align="right">
          <IconButton
            data-html2canvas-ignore="true"
            size="small"
            onClick={() => toggleExpand(idx)}
            sx={{ color: theme.secondary }}
          >
            {expandedItems[idx] ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        </GridCell>
      </Box>
    );
  };

const renderExpenseRows = (mainIdx) => {
    if (!expandedItems[mainIdx]) return null;
    const labelOptions = ["Food", "Travel", "Lodging"];
    const rateOptions = ["Flat", "Daily", "Monthly", "Hourly"];

    return (
      <Collapse in={expandedItems[mainIdx]} timeout="auto" unmountOnExit>
        <Box
          sx={{
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.4)",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          {/* Section Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: ITEM_GRID_TEMPLATE,
              alignItems: "center",
              px: 5,
              py: 0.3,
              opacity: 0.7,
            }}
          >
            <GridCell align="center"></GridCell>
            <GridCell />
            <GridCell>
              <Typography
                variant="overline"
                sx={{
                  color: theme.secondary,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                ADDITIONAL EXPENSES
              </Typography>
            </GridCell>
            <GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell />
          </Box>

          {/* 1. Saved Expenses List */}
          {savedExpenses[mainIdx].map((exp, eIdx) => {
            const rowBgColor =
              mainIdx % 2 === 0
                ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.3)")
                : (isDark ? "rgba(255,255,255,0.04)" : "rgba(236,246,255,0.3)");
            return (
              <React.Fragment key={`${mainIdx}-${eIdx}`}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: ITEM_GRID_TEMPLATE,
                    alignItems: "center",
                    px: 5,
                    pt: 1.5,
                    pb: isEditing ? 1 : 0.5,
                    backgroundColor: rowBgColor,
                  }}
                >
                  <GridCell align="center" />
                  <GridCell />
                  <GridCell sx={isEditing ? { px: 0 } : {}}>
                    {isEditing ? (
                      <SelectInput
                        value={exp.label || ""}
                        options={labelOptions}
                        onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "label", e.target.value)}
                        sx={{
                          ".MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 1 },
                          ".MuiSelect-select": { fontSize: 13, p: "8px", pl: "5px" },
                        }}
                      />
                    ) : (
                      <Typography fontWeight={500} fontSize={13} sx={{ color: "text.primary" }}>
                        {exp.label || "Expense"}
                      </Typography>
                    )}
                  </GridCell>
                  <GridCell />
                  <GridCell align="center">{isEditing ? <SelectInput value={exp.ratemode || "Flat"} options={rateOptions} onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "ratemode", e.target.value)} sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /> : exp.ratemode}</GridCell>
                  <GridCell align="center">{isEditing ? <NumberInput value={exp.duration} onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "duration", Number(e.target.value))} sx={{ width: 60, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /> : exp.duration}</GridCell>
                  <GridCell align="center">{isEditing ? <NumberInput value={exp.amount} onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "amount", Number(e.target.value))} sx={{ width: 80, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /> : exp.amount}</GridCell>
                  <GridCell align="center">{isEditing ? <CenterInput value={exp.currency} onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "currency", e.target.value)} sx={{ width: 50, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /> : exp.currency}</GridCell>
                  <GridCell align="right" sx={{ fontWeight: 700, color: theme.accent }}>{((exp.duration ? exp.amount * exp.duration : exp.amount) || 0).toLocaleString()}</GridCell>
                  <GridCell align="right">{isEditing && <IconButton onClick={() => handleRemoveExpense(mainIdx, eIdx)} sx={{ color: "#ef4444" }}><DeleteIcon /></IconButton>}</GridCell>
                </Box>

                {/* Saved Expense Description Row */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: ITEM_GRID_TEMPLATE,
                    alignItems: "flex-start",
                    px: 5,
                    pb: 1.5,
                    mt: -0.5,
                    backgroundColor: rowBgColor,
                  }}
                >
                  <GridCell /><GridCell />
                  <GridCell sx={isEditing ? { px: 0 } : {}}>
                    {isEditing ? (
                      <TextField
                        multiline
                        rows={1}
                        value={exp.description || ""}
                        onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "description", e.target.value)}
                        sx={{
                          width: "100%",
                          ".MuiInputBase-root": {
                            fontSize: 13,
                            p: "10px",    // Height same as parent
                            pl: "5px",    // Left padding set to 5px
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.5)",
                          },
                          "& fieldset": { border: "none" },
                          "& textarea": { lineHeight: 1.5 },
                        }}
                      />
                    ) : (
                      exp.description && <Typography fontSize={13} color="text.secondary">{exp.description}</Typography>
                    )}
                  </GridCell>
                  <GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell />
                </Box>
              </React.Fragment>
            );
          })}

          {/* 2. New Expense Draft Entry Row */}
          {isEditing && (
            <Box data-html2canvas-ignore="true" sx={{ mt: 1, borderTop: "1px dashed rgba(148,163,184,0.3)", pt: 1 }}>
              {/* Draft Main Inputs */}
              <Box sx={{ display: "grid", gridTemplateColumns: ITEM_GRID_TEMPLATE, alignItems: "center", px: 5, pb: 0.5 }}>
                <GridCell /><GridCell />
                <GridCell sx={{ px: 0 }}>
                  <SelectInput
                    value={additionalExpenses[mainIdx][0].label}
                    options={labelOptions}
                    onChange={(e) => handleAddExpChange(mainIdx, "label", e.target.value)}
                    sx={{ width: "100%", ".MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 1 }, ".MuiSelect-select": { fontSize: 13, p: "8px", pl: "5px" } }}
                  />
                </GridCell>
                <GridCell />
                <GridCell align="center"><SelectInput value={additionalExpenses[mainIdx][0].ratemode} options={rateOptions} onChange={(e) => handleAddExpChange(mainIdx, "ratemode", e.target.value)} sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /></GridCell>
                <GridCell align="center"><NumberInput value={additionalExpenses[mainIdx][0].duration} onChange={(e) => handleAddExpChange(mainIdx, "duration", Number(e.target.value))} sx={{ width: 60, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /></GridCell>
                <GridCell align="center"><NumberInput value={additionalExpenses[mainIdx][0].amount} onChange={(e) => handleAddExpChange(mainIdx, "amount", Number(e.target.value))} sx={{ width: 80, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /></GridCell>
                <GridCell align="center"><CenterInput value={additionalExpenses[mainIdx][0].currency} onChange={(e) => handleAddExpChange(mainIdx, "currency", e.target.value)} sx={{ width: 50, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} /></GridCell>
                <GridCell />
                <GridCell align="right"><IconButton onClick={() => handleConfirmAddExpense(mainIdx)} color="primary"><AddBoxIcon /></IconButton></GridCell>
              </Box>

              {/* Draft Description Input */}
              <Box sx={{ display: "grid", gridTemplateColumns: ITEM_GRID_TEMPLATE, alignItems: "flex-start", px: 5, pb: 1.5, mt: -0.5 }}>
                <GridCell /><GridCell />
                <GridCell sx={{ px: 0 }}>
                  <TextField
                    multiline
                    rows={1}
                    placeholder="Expense Description"
                    value={additionalExpenses[mainIdx][0].description || ""}
                    onChange={(e) => handleAddExpChange(mainIdx, "description", e.target.value)}
                    sx={{
                      width: "100%",
                      ".MuiInputBase-root": {
                        fontSize: 13,
                        p: "10px",    // Height same as parent
                        pl: "5px",    // Left padding set to 5px
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: 1,
                        mt: 0.5,
                        backgroundColor: "rgba(255,255,255,0.5)",
                      },
                      "& fieldset": { border: "none" },
                      "& textarea": { lineHeight: 1.5 },
                    }}
                  />
                </GridCell>
                <GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell /><GridCell />
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #e5edff 0%, #f8fafc 40%, #f4f4f5 100%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 5,
        px: 2,
      }}
    >
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          gap: 2,
        }}
        open={isGenerating}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">Generating Print-Ready Document...</Typography>
      </Backdrop>

      {/* --- TOP CONTROLS --- */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1160,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: isDark ? "background.paper" : "white",
          p: 1.5,
          borderRadius: 2,
          boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
          border: isDark ? "1px solid" : "none",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            VIEW MODE:
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
            sx={{ height: 32 }}
          >
            <ToggleButton
              value="full"
              sx={{ px: 2, fontSize: 12, fontWeight: 600 }}
            >
              Full Invoice
            </ToggleButton>
            <ToggleButton
              value="individual"
              sx={{ px: 2, fontSize: 12, fontWeight: 600 }}
            >
              Individual
            </ToggleButton>
          </ToggleButtonGroup>

          {viewMode === "individual" && (
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel sx={{ fontSize: 13 }}>Select Row</InputLabel>
              <Select
                label="Select Row"
                value={selectedItemIdx}
                onChange={(e) => setSelectedItemIdx(e.target.value)}
                sx={{
                  height: 32,
                  fontSize: 13,
                  ".MuiSelect-select": { pl: "5px" },
                }}
              >
                {localInvoiceItems.map((item, idx) => (
                  <MenuItem key={item.id} value={idx} sx={{ fontSize: 13 }}>
                    {item.name || `Row ${idx + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Select
            size="small"
            value={themeIdx}
            onChange={(e) => setThemeIdx(e.target.value)}
            sx={{
              height: 32,
              fontSize: 13,
              ".MuiSelect-select": { pl: "5px" },
            }}
          >
            {COLOR_THEMES.map((t, i) => (
              <MenuItem key={i} value={i}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            size="small"
            onClick={handleEditToggle}
            sx={{
              bgcolor: isEditing ? theme.accent : "transparent",
              color: isEditing ? "white" : "inherit",
              "&:hover": {
                bgcolor: isEditing ? theme.accent + "E6" : (isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"),
              },
            }}
          >
            {isEditing ? (
              <SaveIcon fontSize="small" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleReset}
            title="Reset to Initial"
          >
            <CancelIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleExport("download")}
            title="Download PDF"
          >
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleExport("print")}
            title="Print"
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* --- INVOICE CARD --- */}
      <Card
        ref={componentRef}
        sx={{
          width: "100%",
          maxWidth: 1160,
          borderRadius: 3,
          boxShadow: isDark ? "none" : "0 22px 60px rgba(15,23,42,0.16)",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          backgroundColor: isDark ? "background.paper" : "white",
          color: isDark ? "text.primary" : "#1e293b",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 5,
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: isDark 
              ? `linear-gradient(90deg, ${theme.accent}22, ${muiTheme.palette.background.paper})` 
              : `linear-gradient(90deg, ${theme.accent}12, white)`,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: theme.header }}
          >
            {template?.name || "Invoice"}
          </Typography>
        </Box>

        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1.1fr" },
            gap: 3,
            px: 5,
            py: 3,
            backgroundColor: theme.bg,
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              FROM
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={theme.header}
            >
              {invoice.from.name}
            </Typography>
            <Box
              sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.from.address}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.from.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.from.mobile}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">
              BILLED TO
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={theme.header}
            >
              {invoice.to.name}
            </Typography>
            <Box
              sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.address}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.mobile}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                >
                  INVOICE DATE
                </Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="datePickr" data-html2canvas-ignore="true">
                      <DatePicker
                        value={
                          editInvoiceDate ? new Date(editInvoiceDate) : null
                        }
                        onChange={(v) =>
                          setEditInvoiceDate(
                            v ? v.toISOString().slice(0, 10) : null
                          )
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: {
                              width: 150,
                              "& .MuiInputBase-input": { pl: "5px" }, // Targets the inner text padding
                            },
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                ) : (
                  <Typography variant="body2" fontSize={13} fontWeight={500}>
                    {localInvoiceDate}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                >
                  DUE DATE
                </Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="datePickr" data-html2canvas-ignore="true">
                      <DatePicker
                        value={editDueDate ? new Date(editDueDate) : null}
                        onChange={(v) =>
                          setEditDueDate(
                            v ? v.toISOString().slice(0, 10) : null
                          )
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: {
                              width: 150,
                              "& .MuiInputBase-input": { pl: "5px" }, // Targets the inner text padding
                            },
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                ) : (
                  <Typography variant="body2" fontSize={13} fontWeight={500}>
                    {localDueDate}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>

        {/* Bank Details Section */}
        <Box
          sx={{
            px: 5,
            py: 2,
            backgroundColor: (theme.bg === 'white' || theme.bg === '#ffffff') ? 'transparent' : theme.bg,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AccountBalanceIcon fontSize="small" sx={{ color: theme.accent }} />
          {isEditing ? (
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel sx={{ fontSize: 13 }} id="bank-select-label">Select Bank</InputLabel>
              <Select
                labelId="bank-select-label"
                id="bank-select"
                label="Select Bank"
                value={selectedBankId || ""}
                onChange={(e) => {
                  const value = String(e.target.value);
                  console.log("Bank selected:", value);
                  setSelectedBankId(value);
                }}
                sx={{
                  height: 32,
                  fontSize: 13,
                  ".MuiSelect-select": { pl: "5px" },
                }}
              >
                <MenuItem value="" sx={{ fontSize: 13 }}>
                  <em>None</em>
                </MenuItem>
                {availableBanks && availableBanks.length > 0 ? (
                  availableBanks.map((b) => {
                    const bankId = String(b.id || b.bank_id || b._id);
                    return (
                      <MenuItem key={bankId} value={bankId} sx={{ fontSize: 13 }}>
                        {b.name} - {b.country}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled sx={{ fontSize: 13 }}>
                    No banks available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          ) : bank ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
               {bank.name} ,{bank.country}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No Bank Selected</Typography>
          )}
          </Box>
        </Box>

        <Box
          sx={{
            px: 5,
            py: 1.5,
            borderBottom: "2px solid",
            borderColor: "divider",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(243,244,246,0.8)",
            display: "grid",
            gridTemplateColumns: ITEM_GRID_TEMPLATE,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            color: theme.header,
          }}
        >
          <GridCell />
          <GridCell />
          <GridCell>Description</GridCell>
          <GridCell />
          <GridCell align="center">Rate Mode</GridCell>
          <GridCell align="center">Duration</GridCell>
          <GridCell align="center">Rate</GridCell>
          <GridCell align="center">Currency</GridCell>
          <GridCell align="right">Total</GridCell>
          <GridCell />
        </Box>

        <Box>
          {localInvoiceItems.map((item, idx) => {
            if (viewMode === "individual" && idx !== selectedItemIdx)
              return null;
            return (
              <React.Fragment key={item.id}>
                {renderInvoiceItem(item, idx)}
                {renderExpenseRows(idx)}
              </React.Fragment>
            );
          })}
        </Box>

        <Box
          sx={{
            px: 5,
            py: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              maxWidth: 400,
              p: 2,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "primary.main",
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 163, 255, 0.1)' : "#eff6ff",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Notice
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {invoice.notice}
            </Typography>
          </Box>

          <Box sx={{ width: 300 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={600}>
                {(grandTotal - taxAmount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                alignItems: "center",
              }}
            >
              <Typography color="text.secondary">Tax %</Typography>
              {isEditing ? (
                <NumberInput
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  sx={{ width: 60 }}
                />
              ) : (
                <Typography>{taxPercent}</Typography>
              )}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography color="text.secondary">Tax Amount</Typography>
              <Typography>
                {taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: isDark ? `${theme.accent}33` : `${theme.accent}15`,
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color={theme.header}
              >
                Grand Total
              </Typography>
              <Typography variant="h6" fontWeight={700} color={theme.accent}>
                {grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
