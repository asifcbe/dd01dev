import React from 'react';
import { IconButton, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function ExpenseRows({
  additionalExpenses,
  idx,
  isEditing,
  handleExpenseChange,
  handleRemoveExpense,
  handleAddExpense
}) {
  if (!isEditing) return null;

  return (
    <>
      {additionalExpenses[idx].map((expense, eIdx) => (
        <tr
          key={`exp-idx-${eIdx}`}
          className="expense-row"
          style={{ background: "#fff", position: "relative", transition: "background 0.3s" }}
        >
          <td style={{ minWidth: 210 }}>
            <textarea
              rows={2}
              style={{
                width: "100%",
                borderRadius: "5px",
                border: "1px solid #cdd0d6",
                padding: "6px",
                fontSize: "15px",
                background: "#f8fafc",
                resize: "none"
              }}
              placeholder="Enter item name/description"
              value={expense.label || ""}
              onChange={e =>
                handleExpenseChange(idx, eIdx, "label", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="number"
              min={1}
              style={{ width: "40px", border: "none", background: "transparent", textAlign: "center" }}
              value={expense.quantity || 1}
              onChange={e =>
                handleExpenseChange(idx, eIdx, "quantity", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="number"
              min={0}
              step="0.01"
              style={{ width: "55px", border: "none", background: "transparent", textAlign: "center" }}
              value={expense.amount || 0}
              onChange={e =>
                handleExpenseChange(idx, eIdx, "amount", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="number"
              min={0}
              step="0.01"
              style={{ width: "40px", border: "none", background: "transparent", textAlign: "center" }}
              value={expense.gst || 0}
              onChange={e =>
                handleExpenseChange(idx, eIdx, "gst", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="number"
              min={0}
              step="0.01"
              style={{ width: "40px", border: "none", background: "transparent", textAlign: "center" }}
              value={expense.discount || 0}
              onChange={e =>
                handleExpenseChange(idx, eIdx, "discount", e.target.value)
              }
            />
          </td>
          <td>
            {(
              (parseFloat(expense.amount) || 0) *
              (parseFloat(expense.quantity) || 1)
            ).toFixed(2)}
          </td>
          <td style={{ position: "relative", minWidth: 38 }}>
            <Box
              className="row-action-icon"
              sx={{
                opacity: 0,
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "opacity 0.2s"
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemoveExpense(idx, eIdx)}
                aria-label="remove"
              >
                <RemoveIcon fontSize="small" sx={{ color: "#ea336a" }} />
              </IconButton>
              {eIdx === additionalExpenses[idx].length - 1 && (
                <IconButton
                  size="small"
                  onClick={() => handleAddExpense(idx)}
                  aria-label="add"
                  sx={{ ml: 1 }}
                >
                  <AddIcon fontSize="small" sx={{ color: "#388e3c" }} />
                </IconButton>
              )}
            </Box>
          </td>
        </tr>
      ))}
    </>
  );
}

export default ExpenseRows;

// Add this CSS (global stylesheet or styled-components) for hover effect:
/*
.expense-row:hover .row-action-icon {
  opacity: 1 !important;
}
.row-action-icon {
  opacity: 0;
  pointer-events: auto;
}
*/
