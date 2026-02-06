let actualInvoice={
  "client": {
    "id": 1,
    "name": "Yahoo Finance",
    "type1": "Client",
    "address": "California",
    "email": "yahoo@outlook.com",
    "mobile": "7845945950"
  },
  "company": {
    "id": 2,
    "name": "Reed Ireland",
    "type1": "Company",
    "address": "Dublin",
    "email": "reedIreland@gmail.com",
    "mobile": "7845945951",
    "project": {
      "id": 1,
      "rate_amount": 1000,
      "currency": "USD",
      "rate_mode": "Monthly"
    }
  },
  "template_id": 1,
  "invoice_date": "03, Feb 2026",
  "due_date": "05, Mar 2026",
  "invoice_items": [
    [
      {
        "id": 6,
        "name": "Dinesh",
        "type1": "Consultant",
        "address": "Madurai, Tamil Nadu",
        "email": "dinesh@gmail.com",
        "mobile": "7845945955",
        "project": {
          "id": 5,
          "rate_amount": 30000,
          "currency": "INR",
          "rate_mode": "Daily"
        }
      },
      {
        "id": 5,
        "name": "Sivarama Tech",
        "type1": "Vendor",
        "address": "Chennai, Tamil Nadu",
        "email": "sivarama@gmail.com",
        "mobile": "7845945954",
        "project": {
          "id": 4,
          "rate_amount": 30000,
          "currency": "INR",
          "rate_mode": "Daily"
        }
      },
      {
        "id": 4,
        "name": "Sreerama Tech",
        "type1": "Vendor",
        "address": "Bangalore, Karnataka",
        "email": "sreerama@gmail.com",
        "mobile": "7845945953",
        "project": {
          "id": 3,
          "rate_amount": 30000,
          "currency": "INR",
          "rate_mode": "Daily"
        }
      },
      {
        "id": 2,
        "name": "Reed Ireland",
        "type1": "Company",
        "address": "Dublin",
        "email": "reedIreland@gmail.com",
        "mobile": "7845945951",
        "project": {
          "id": 1,
          "rate_amount": 1000,
          "currency": "USD",
          "rate_mode": "Monthly"
        }
      },
      {
        "id": 1,
        "name": "Yahoo Finance",
        "type1": "Client",
        "address": "California",
        "email": "yahoo@outlook.com",
        "mobile": "7845945950"
      }
    ],
    [
      {
        "id": 7,
        "name": "Palanisamy",
        "type1": "Consultant",
        "address": "Salem, Tamil Nadu",
        "email": "palanisamy@gmail.com",
        "mobile": "7845945956",
        "project": {
          "id": 6,
          "rate_amount": 20000,
          "currency": "INR",
          "rate_mode": "Monthly"
        }
      },
      {
        "id": 4,
        "name": "Sreerama Tech",
        "type1": "Vendor",
        "address": "Bangalore, Karnataka",
        "email": "sreerama@gmail.com",
        "mobile": "7845945953",
        "project": {
          "id": 3,
          "rate_amount": 30000,
          "currency": "INR",
          "rate_mode": "Daily"
        }
      },
      {
        "id": 2,
        "name": "Reed Ireland",
        "type1": "Company",
        "address": "Dublin",
        "email": "reedIreland@gmail.com",
        "mobile": "7845945951",
        "project": {
          "id": 1,
          "rate_amount": 1000,
          "currency": "USD",
          "rate_mode": "Monthly"
        }
      },
      {
        "id": 1,
        "name": "Yahoo Finance",
        "type1": "Client",
        "address": "California",
        "email": "yahoo@outlook.com",
        "mobile": "7845945950"
      }
    ],
    [
      {
        "id": 8,
        "name": "Macron",
        "type1": "Consultant",
        "address": "Paris",
        "email": "macron@gmail.com",
        "mobile": "7845945957",
        "project": {
          "id": 7,
          "rate_amount": 20000,
          "currency": "INR",
          "rate_mode": "Monthly"
        }
      },
      {
        "id": 3,
        "name": "Reed France",
        "type1": "Company",
        "address": "Paris",
        "email": "reedFrance@gmail.com",
        "mobile": "7845945952",
        "project": {
          "id": 2,
          "rate_amount": 1000,
          "currency": "USD",
          "rate_mode": "Monthly"
        }
      },
      {
        "id": 1,
        "name": "Yahoo Finance",
        "type1": "Client",
        "address": "California",
        "email": "yahoo@outlook.com",
        "mobile": "7845945950"
      }
    ]
  ],
  "bank_id": null
}


function getInvoiceData(actualInvoice){
let invoiceItems=[];
actualInvoice.invoice_items.map((itemgroup)=>{
    let item={
        id: itemgroup[0].id,
        name: `${itemgroup[0].name} , ${itemgroup[0].address}`,
        duration: 0,
        ratemode:itemgroup[0].project ? itemgroup[0].project.rate_mode : "",
        rateamount: itemgroup[0].project ? itemgroup[0].project.rate_amount : 0,
        currency: itemgroup[0].project ? itemgroup[0].project.currency : "",
        total: 0,
        description: "",
      };
    
  invoiceItems.push(item);
})
return {
    invoiceId: `INV-${actualInvoice.template_id}`,
    from: actualInvoice.client,
    to: actualInvoice.company,
    invoicedate: actualInvoice.invoice_date,
    duedate: actualInvoice.due_date,
    invoiceitems: invoiceItems,
    subtotal: 100000,
    tax: 10000,
    total: 110000,
    notice:
      "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  }
}




let invoice=getInvoiceData(actualInvoice);

  console.log(invoice);


