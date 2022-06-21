import React, { useState } from "react";
import { Address, Value } from "@emurgo/cardano-serialization-lib-asmjs";
let Buffer = require("buffer/").Buffer;

export default function GetBalance(props) {
  const getBalanceApi = async () => {
    // getChangeAddress function from the walletAPI just returns the wallet address(in hexadecimal) which is connected
    // because any change ada will be sent back to the wallet
    const hexWalletAddr = await props.API.getChangeAddress();
    console.log(hexWalletAddr);

    // since the `hexWalletAddr` is in hex so the below code changes it to a readable string
    const changeAddress = Address.from_bytes(
      Buffer.from(hexWalletAddr, "hex")
    ).to_bech32();

    // this fetch function is connected to my blockfrost api so don't worry about the below code
    const fetching = await fetch(changeAddress);
    const json = await fetching.json();
    console.log(json.address);
    console.log(json.amount[0].quantity, json.amount[0].unit);
    props.setbalance(json.amount[0].quantity);
    props.setshow(true);
    return json;
  };

  ////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////

  // now this is the function where we get the balace sitting on the connected wallet using our function from the walletAPI
  const getBalanceRepo = async () => {
    console.log(props.changeAddress);
    // again hexadecimal to readable stuff
    const balanceCBORHex = await props.API.getBalance();
    const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex"))
      .coin()
      .to_str();

    // just react stuff to show the balance in the wallet on the browser
    props.setbalance(balance);
    props.setshow(true);
    return balance;
  };

  ////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////

  return (
    <div>
      <button onClick={getBalanceRepo}>getbalance</button>
      <br></br>
      <br></br>
      {props.show && <div>{`${props.balance1} lovelaces`}</div>}
    </div>
  );
}
