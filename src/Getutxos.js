import React from "react";
import { TransactionUnspentOutput } from "@emurgo/cardano-serialization-lib-asmjs";
let Buffer = require("buffer/").Buffer;
export default function GetUtxos(props) {
  const getUtxos = async () => {
    const rawutxos = await props.API.getUtxos();
    console.log(rawutxos);
    let utxo = [];
    let inputTxHashes = [];
    for (let i = 0; i < rawutxos.length; i++) {
      let elem = TransactionUnspentOutput.from_bytes(
        Buffer.from(rawutxos[i], "hex")
      );
      utxo.push(elem);
      inputTxHashes.push(
        Buffer.from(elem.input().transaction_id().to_bytes(), "utf8").toString(
          "hex"
        )
      );
    }
    console.log(inputTxHashes);
    console.log(utxo);
  };

  return (
    <div>
      <button onClick={getUtxos}>getUtxos</button>
    </div>
  );
}
