import {
  Groups as ClientsIcon
} from "@mui/icons-material";
import ParticipantManager from "./ParticipantManager";

const clientTypes = ["Individual", "Company", "Organization"];

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "type", label: "Type", type: "select", options: clientTypes },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "tax_id", label: "Tax Id", type: "text" }
];

const displayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  { name: "country", label: "Country" },
  { name: "tax_id", label: "Tax Id" }
];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  type: "Individual"
};

export default function Clients() {
  return (
    <ParticipantManager
      title="Clients"
      icon={ClientsIcon}
      apiType="Client"
      apiDetailType="clients"
      apiDetailTypeSingle="client"
      fields={fields}
      displayFields={displayFields}
      subheaderField="type2"
      initialForm={initialForm}
      type2={(item) => item.type}
      type3="NotApplicable"
    />
  );
}
