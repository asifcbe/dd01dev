import {
  Engineering as ConsultantsIcon
} from "@mui/icons-material";
import ParticipantManager from "./ParticipantManager";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
  {name:"expense_limit", label:"Expense Limit", type:"number"},
  { name: "type", label: "Type", type: "select", options: ["PartTime", "FullTime"] }
];

const displayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  {name:"expense_limit", label:"Expense Limit"}
];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  expense_limit: 0,
  type: "PartTime",
};

export default function Consultants() {
  return (
    <ParticipantManager
      title="Consultants"
      icon={ConsultantsIcon}
      apiType="Consultant"
      apiDetailType="consultants"
      apiDetailTypeSingle="consultant"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
      type2={()=>'Individual'}
    />  
  );
}
