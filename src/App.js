import React, { useState } from "react";
import {
  Address,
  BigNum,
  TransactionUnspentOutput,
  TransactionWitnessSet,
  Transaction,
  TransactionOutputBuilder,
  Value,
  TransactionUnspentOutputs,
  PlutusData,
  BigInt,
  hash_plutus_data,
} from "@emurgo/cardano-serialization-lib-asmjs";
import ConnectWallet from "./ConnectWallet";
import GetBalance from "./GetBalance";
import NonScriptTxns from "./NonScriptTxns";
import { protocolParams, initTransactionBuilder } from "./NonScriptTxns";
import GetUtxos from "./Getutxos";
let Buffer = require("buffer/").Buffer;

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

export default function App() {
  const [wallets1, setwallets1] = React.useState([]);
  const [whichWalletSelected, setwhichWalletSelected] =
    React.useState(undefined);
  const [walletIsEnabled, setwalletIsEnabled] = React.useState(false);
  const [balance1, setbalance] = React.useState(undefined);
  const [show, setshow] = React.useState(false);
  const [radiostate, setradiostate] = React.useState(undefined);
  const [API, setAPI] = React.useState(undefined);
  const [addressBech32SendADA, setaddressBech32SendADA] = React.useState("");
  const [changeAddress, setchangeAddress] = React.useState("");
  const [lovelaceToSend, setlovelaceToSend] = React.useState(0);
  // this is the always succeed script address
  const [addressScriptBech32, setaddressScriptBech32] = React.useState(
    "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8"
  );
  const [datumStr, setdarumStr] = useState("123");

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  const buildSendAdaToPlutusScript = async () => {
    const raw = await API.getChangeAddress();
    setchangeAddress(Address.from_bytes(Buffer.from(raw, "hex")).to_bech32());

    const txBuilder = await initTransactionBuilder();
    const ScriptAddress = Address.from_bech32(addressScriptBech32);
    const shelleyChangeAddress = Address.from_bech32(changeAddress);

    let txOutputBuilder = TransactionOutputBuilder.new();
    txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
    console.log(txOutputBuilder);
    const dataHash = hash_plutus_data(
      PlutusData.new_integer(BigInt.from_str(datumStr))
    );
    console.log(dataHash);
    txOutputBuilder = txOutputBuilder.with_data_hash(dataHash);
    console.log(txOutputBuilder);

    txOutputBuilder = txOutputBuilder.next();

    txOutputBuilder = txOutputBuilder.with_value(
      Value.new(BigNum.from_str(lovelaceToSend.toString()))
    );
    const txOutput = txOutputBuilder.build();

    txBuilder.add_output(txOutput);

    // Find the available UTXOs in the wallet and
    // us them as Inputs
    const rawutxos = await API.getUtxos();

    let txUnspentOutputs = TransactionUnspentOutputs.new();
    for (let i = 0; i < rawutxos.length; i++) {
      const utxo = TransactionUnspentOutput.from_bytes(
        Buffer.from(rawutxos[i], "hex")
      );
      txUnspentOutputs.add(utxo);
    }

    txBuilder.add_inputs_from(txUnspentOutputs, 2);

    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    // once the transaction is ready, we build it to get the tx body without witnesses
    const txBody = txBuilder.build();

    // Tx witness
    const transactionWitnessSet = TransactionWitnessSet.new();

    const tx = Transaction.new(
      txBody,
      TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
    );

    let txVkeyWitnesses = await API.signTx(
      Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
      true
    );
    txVkeyWitnesses = TransactionWitnessSet.from_bytes(
      Buffer.from(txVkeyWitnesses, "hex")
    );

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = Transaction.new(tx.body(), transactionWitnessSet);

    const submittedTxHash = await API.submitTx(
      Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
    );
    console.log(submittedTxHash);
    // this.setState({
    //   submittedTxHash: submittedTxHash,
    //   transactionIdLocked: submittedTxHash,
    //   lovelaceLocked: this.state.lovelaceToSend,
    // });
  };
  return (
    <div>
      <ConnectWallet
        API={API}
        setAPI={setAPI}
        wallets1={wallets1}
        setwallets1={setwallets1}
        whichWalletSelected={whichWalletSelected}
        setwhichWalletSelected={setwhichWalletSelected}
        walletIsEnabled={walletIsEnabled}
        setwalletIsEnabled={setwalletIsEnabled}
        radiostate={radiostate}
        setradiostate={setradiostate}
        balance1={balance1}
        setbalance={setbalance}
        show={show}
        setshow={setshow}
        addressBech32SendADA={addressBech32SendADA}
        changeAddress={changeAddress}
        setchangeAddress={setchangeAddress}
        lovelaceToSend={lovelaceToSend}
        setlovelaceToSend={setlovelaceToSend}
        addressScriptBech32={addressScriptBech32}
        setaddressScriptBech32={setaddressScriptBech32}
        datumStr={datumStr}
      ></ConnectWallet>
      <GetBalance
        API={API}
        setAPI={setAPI}
        wallets1={wallets1}
        setwallets1={setwallets1}
        whichWalletSelected={whichWalletSelected}
        setwhichWalletSelected={setwhichWalletSelected}
        walletIsEnabled={walletIsEnabled}
        setwalletIsEnabled={setwalletIsEnabled}
        radiostate={radiostate}
        setradiostate={setradiostate}
        balance1={balance1}
        setbalance={setbalance}
        show={show}
        setshow={setshow}
        addressBech32SendADA={addressBech32SendADA}
        changeAddress={changeAddress}
        setchangeAddress={setchangeAddress}
        lovelaceToSend={lovelaceToSend}
        setlovelaceToSend={setlovelaceToSend}
        addressScriptBech32={addressScriptBech32}
        setaddressScriptBech32={setaddressScriptBech32}
        datumStr={datumStr}
      ></GetBalance>
      <br></br>
      <GetUtxos API={API}></GetUtxos>
      <br></br>
      <br></br>
      <NonScriptTxns
        API={API}
        setAPI={setAPI}
        wallets1={wallets1}
        setwallets1={setwallets1}
        whichWalletSelected={whichWalletSelected}
        setwhichWalletSelected={setwhichWalletSelected}
        walletIsEnabled={walletIsEnabled}
        setwalletIsEnabled={setwalletIsEnabled}
        radiostate={radiostate}
        setradiostate={setradiostate}
        balance1={balance1}
        setbalance={setbalance}
        show={show}
        setshow={setshow}
        addressBech32SendADA={addressBech32SendADA}
        setaddressBech32SendADA={setaddressBech32SendADA}
        changeAddress={changeAddress}
        setchangeAddress={setchangeAddress}
        lovelaceToSend={lovelaceToSend}
        setlovelaceToSend={setlovelaceToSend}
        addressScriptBech32={addressScriptBech32}
        setaddressScriptBech32={setaddressScriptBech32}
      ></NonScriptTxns>
      <br></br>
      <br></br>
      <label>
        Amount in lovelace
        <input
          type="text"
          onChange={(chng) => {
            setlovelaceToSend(Number(chng.target.value));
            console.log(Number(chng.target.value));
          }}
        />
      </label>
      <button onClick={buildSendAdaToPlutusScript}>TransactToScript</button>
    </div>
  );
}
