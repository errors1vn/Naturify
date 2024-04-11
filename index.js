const express = require("express");
const axios = require("axios");
const port = 3002;
const app = express();
const uniqid = require("uniqid");
const sha256 = require("sha256");

// UAT TESTING  User Acceptance Testing
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
app.get("/", (req, res) => {
  res.send("phone pe is working");
});

app.get("/pay", (req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const userId = 123;

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: 83000, //in paise
    redirectUrl: `http://localhost:3000/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    mobileNumber: "334264747",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  const base63EncodedPayload = bufferObj.toString("base64");
  const xVerify =
    sha256(base63EncodedPayload + payEndpoint + SALT_KEY) + "###" + SALT_INDEX;
  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${payEndpoint}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base63EncodedPayload,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
     // res.redirect(url); //this direct go to payment page
      res.send((url)) //-> this only generate the link
    })
    .catch(function (error) {
      console.error(error);
    });
});


app.listen(port, () => {
  console.log(`App started listening on port ${port}`);
});




// Axios is a popular JavaScript library that is used to make HTTP requests from web browsers and Node.js applications. 
// It simplifies the process of sending asynchronous HTTP requests to REST endpoints and handling responses.
//  Axios is designed to work both in the browser and in Node.js environments.

// uniqid is a Node.js module used to generate unique identifiers (IDs).
//  These IDs are typically used for various purposes such as creating unique keys, identifiers for database records, temporary file names, etc.

// SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function that generates a fixed-size (256-bit or 64-character hexadecimal) output hash value from an input data of any size. 
// It is part of the SHA-2 (Secure Hash Algorithm 2) family, which also includes SHA-224, SHA-384, SHA-512, and others.
//  SHA-256 is widely used in various cryptographic applications, including digital signatures, message authentication codes (MACs), and password hashing.


// A buffer in Node.js is a temporary storage area in memory that holds raw binary data.
//  It is a special type of object that is used to represent fixed-size chunks of memory.
//   Buffers are useful for working with binary data, such as reading from or writing to files, network communication, cryptography, and other scenarios where handling raw binary data is necessary.

// In the provided code snippet, the payload is converted to JSON format because many APIs expect data to be transmitted in JSON format when making HTTP requests. 
// Here's why we convert the payload to JSON: