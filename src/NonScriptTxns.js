import React from "react";
import {
  Address,
  BigNum,
  TransactionUnspentOutput,
  TransactionWitnessSet,
  Transaction,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  LinearFee,
  TransactionOutput,
  Value,
  TransactionUnspentOutputs,
} from "@emurgo/cardano-serialization-lib-asmjs";
let Buffer = require("buffer/").Buffer;

export let protocolParams = {
  linearFee: {
    minFeeA: "44",
    minFeeB: "155381",
  },
  minUtxo: "34482",
  poolDeposit: "500000000",
  keyDeposit: "2000000",
  maxValSize: 5000,
  maxTxSize: 16384,
  priceMem: 0.0577,
  priceStep: 0.0000721,
  coinsPerUtxoWord: "34482",
};

/**
 * the function below is boiled plate to create a transaction
 * check it out here: https://github.com/dynamicstrategies/cardano-wallet-connector/blob/master/src/App.js
 */
export const initTransactionBuilder = async () => {
  const txBuilder = TransactionBuilder.new(
    TransactionBuilderConfigBuilder.new()
      .fee_algo(
        LinearFee.new(
          BigNum.from_str(protocolParams.linearFee.minFeeA),
          BigNum.from_str(protocolParams.linearFee.minFeeB)
        )
      )
      .pool_deposit(BigNum.from_str(protocolParams.poolDeposit))
      .key_deposit(BigNum.from_str(protocolParams.keyDeposit))
      .coins_per_utxo_word(BigNum.from_str(protocolParams.coinsPerUtxoWord))
      .max_value_size(protocolParams.maxValSize)
      .max_tx_size(protocolParams.maxTxSize)
      .prefer_pure_change(true)
      .build()
  );

  return txBuilder;
};

export default function NonScriptTxns(props) {
  // builds the transaction
  const buildSendADATxn = async () => {
    try {
      // getting the address of the connected wallet
      const raw = await props.API.getChangeAddress();
      props.setchangeAddress(
        Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
      );

      // initializing the transaction builder
      const txBuilder = await initTransactionBuilder();
      const shelleyOutputAddress = Address.from_bech32(
        props.addressBech32SendADA
      );
      const shelleyChangeAddress = Address.from_bech32(props.changeAddress);
      // console.log(addressBech32SendADA)
      // console.log(lovelaceToSend)

      //adding inputs and outputs
      txBuilder.add_output(
        TransactionOutput.new(
          shelleyOutputAddress,
          Value.new(BigNum.from_str(props.lovelaceToSend.toString()))
        )
      );

      // getting the utxos sitting on the connected wallet
      const rawutxos = await props.API.getUtxos();

      let txUnspentOutputs = TransactionUnspentOutputs.new();
      for (let i = 0; i < rawutxos.length; i++) {
        const utxo = TransactionUnspentOutput.from_bytes(
          Buffer.from(rawutxos[i], "hex")
        );
        txUnspentOutputs.add(utxo);
      }
      // console.log(txUnspentOutputs)
      txBuilder.add_inputs_from(txUnspentOutputs, 1);

      // calculating the fee
      txBuilder.add_change_if_needed(shelleyChangeAddress);

      // build the transaction
      const txBody = txBuilder.build();
      // console.log(txBody)

      const transactionWitnessSet = TransactionWitnessSet.new();

      const tx = Transaction.new(
        txBody,
        TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      );

      let txVkeyWitnesses = await props.API.signTx(
        Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
        true
      );
      // console.log(txVkeyWitnesses)

      txVkeyWitnesses = TransactionWitnessSet.from_bytes(
        Buffer.from(txVkeyWitnesses, "hex")
      );

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      // signing the transaction
      const signedTx = Transaction.new(tx.body(), transactionWitnessSet);

      // sending the transaction
      const submittedTxHash = await props.API.submitTx(
        Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
      );
      console.log(submittedTxHash);
    } catch (error) {
      if (error === "invalid length") {
        buildSendADATxn();
      } else {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <label>
        Receiving address
        <input
          type="text"
          onChange={(chng) => {
            props.setaddressBech32SendADA(chng.target.value);
            console.log(chng.target.value);
          }}
        />
      </label>
      <br></br>
      <br></br>
      <label>
        Amount in lovelace
        <input
          type="text"
          onChange={(chng) => {
            props.setlovelaceToSend(Number(chng.target.value));
            console.log(Number(chng.target.value));
          }}
        />
      </label>
      <button onClick={buildSendADATxn}>transact</button>
    </div>
  );
}
