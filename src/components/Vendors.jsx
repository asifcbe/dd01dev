import React from "react";
import {
  Store as VendorsIcon
} from "@mui/icons-material";
import ParticipantManager from "./ParticipantManager";


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

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" }];

const displayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  { name: "country", label: "Country" },
];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  country: "",
};

export default function Vendors() {
  return (
    <ParticipantManager
      title="Vendors"
      icon={VendorsIcon}
      apiType="Vendor"
      apiDetailType="vendors"
      apiDetailTypeSingle="vendor"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
      type2={()=>'Company'}
    />
  );
}
