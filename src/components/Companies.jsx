import React, { useState } from "react";
import {
  Business as CompaniesIcon,
  AccountBalance as BanksIcon
} from "@mui/icons-material";
import { Tabs, Tab, Box } from "@mui/material";
import ParticipantManager from "./ParticipantManager";


const companyFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" }];

const companyDisplayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  { name: "country", label: "Country" },
];

const companyInitialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  country: "",
};

const bankFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "code", label: "Code", type: "text" },
  { name: "swift_code", label: "Swift Code", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "branch", label: "Branch", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "account_number", label: "Account Number", type: "text" },
  { name: "account_holder_name", label: "Account Holder Name", type: "text" },
];

const bankDisplayFields = [
  { name: "name", label: "Name" },
  { name: "code", label: "Code" },
  { name: "swift_code", label: "Swift Code" },
  { name: "country", label: "Country" },
  { name: "branch", label: "Branch" },
  { name: "city", label: "City" },
  { name: "account_number", label: "Account Number" },
  { name: "account_holder_name", label: "Account Holder Name" },
];

const bankInitialForm = {
  name: "",
  code: "",
  swift_code: "",
  country: "",
  branch: "",
  city: "",
  account_number: "",
  account_holder_name: "",
};

export default function Companies() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="companies and banks tabs">
        <Tab label="Companies" />
        <Tab label="Banks" />
      </Tabs>
      {tabValue === 0 && (
        <ParticipantManager
          title="Companies"
          icon={CompaniesIcon}
          apiType="Company"
          apiDetailType="companies"
          apiDetailTypeSingle="company"
          fields={companyFields}
          displayFields={companyDisplayFields}
          initialForm={companyInitialForm}
          type2={() => 'Company'}
        />
      )}
      {tabValue === 1 && (
        <ParticipantManager
          title="Banks"
          icon={BanksIcon}
          apiType="Bank"
          apiDetailType="banks"
          apiDetailTypeSingle="bank"
          fields={bankFields}
          displayFields={bankDisplayFields}
          initialForm={bankInitialForm}
          type2={() => 'Bank'}
        />
      )}
    </Box>
  );
}
