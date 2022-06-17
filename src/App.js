import React, { useEffect } from 'react';
import {
  Address,
  BlockHash,
  BigNum,
  TransactionUnspentOutput,
  TransactionWitnessSet,
  Transaction,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  LinearFee,
  TransactionOutput,
  Value,
  TransactionUnspentOutputs
} from "@emurgo/cardano-serialization-lib-asmjs"
let Buffer = require('buffer/').Buffer

export default function App(){
  const [wallets1, setwallets1] = React.useState([])
  const [whichWalletSelected, setwhichWalletSelected] = React.useState(undefined)
  const [walletIsEnabled, setvwalletIsEnabled] = React.useState(false)
  const [balance1, setbalance] = React.useState(undefined)
  const [show, setshow] = React.useState(false)
  const [radiostate, setradiostate] = React.useState(undefined)
  const [API, setAPI] = React.useState(undefined)
  const [addressBech32SendADA, setaddressBech32SendADA] = React.useState("")
  const [changeAddress, setchangeAddress] = React.useState("")
  const [lovelaceToSend, setlovelaceToSend] = React.useState(0)

  let protocolParams = {
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
  }

  /**
    * Checks if a connection has been established with
    * the wallet
  */
  const checkIfWalletEnabled = async () => {
    let walletIsEnabled = false;

    try {
        const walletName = whichWalletSelected;
        walletIsEnabled = await window.cardano[walletName].isEnabled();
    } catch (err) {
        console.log(err)
    }
    setvwalletIsEnabled(walletIsEnabled);
    return walletIsEnabled;
  }

  // returns an array for the number of cardano wallets available at your browser
  const walletselected = (count = 0) => {
    const wallets = [];
    for(const key in window.cardano) {
        if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
            wallets.push(key);
        }

    }
    if (wallets.length === 0 && count < 3) {
      setTimeout(() => {
          walletselected(count + 1);
      }, 1000);
      return;
    }
    setwallets1(wallets)
    console.log(wallets)
  }

  // responsible for the pop-up from the respective wallet

  const enableWallet = async () =>{
    const walletKey = whichWalletSelected;
    try {
        const newAPI = await window.cardano[walletKey].enable();
        setAPI(newAPI)
        
    } catch(err) {
        console.log(err); 
    }
    return checkIfWalletEnabled();
  }
  
  if(walletIsEnabled){
    console.log(`${whichWalletSelected} connected`)
  }else{
    console.log("not yet connected")
  }

  const getBalanceApi = async ()=>{
    const raw = await API.getChangeAddress();
    const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
    const fetching = await fetch(changeAddress)
    const json = await fetching.json()
    console.log(json.address)
    console.log(json.amount[0].quantity, json.amount[0].unit)
    setbalance(json.amount[0].quantity)
    setshow(true)  
    return json 
  }

  const getBalanceRepo = async () =>{
    const balanceCBORHex = await API.getBalance()
    const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str()
    setbalance(balance)
    setshow(true)
    return (balance)
  }

  const isWalletSelected = (val)=>{ 
    if (radiostate === val) {
      return true
    }
    else{
      return false
    }
  }

  /**
    * the function below os boiled plate 
    * check it out here: https://github.com/dynamicstrategies/cardano-wallet-connector/blob/master/src/App.js
    */
  const initTransactionBuilder = async () => {

    const txBuilder = TransactionBuilder.new(
      TransactionBuilderConfigBuilder.new()
              .fee_algo(LinearFee.new(BigNum.from_str(protocolParams.linearFee.minFeeA), BigNum.from_str(protocolParams.linearFee.minFeeB)))
              .pool_deposit(BigNum.from_str(protocolParams.poolDeposit))
              .key_deposit(BigNum.from_str(protocolParams.keyDeposit))
              .coins_per_utxo_word(BigNum.from_str(protocolParams.coinsPerUtxoWord))
              .max_value_size(protocolParams.maxValSize)
              .max_tx_size(protocolParams.maxTxSize)
              .prefer_pure_change(true)
              .build()
    );

    return txBuilder
  }

  const getUtxos = async ()=>{
    const rawutxos = await API.getUtxos()
    console.log(rawutxos)
    const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawutxos[0], "hex"))
    console.log(utxo)
  }

  // builds the transaction

  const buildSendADATxn = async ()=>{

    // getting the address of the connected wallet
    const raw = await API.getChangeAddress();
    setchangeAddress(Address.from_bytes(Buffer.from(raw, "hex")).to_bech32())

    // initializing the transaction builder
    const txBuilder = await initTransactionBuilder()
    const shelleyOutputAddress = Address.from_bech32(addressBech32SendADA);
    const shelleyChangeAddress = Address.from_bech32(changeAddress);
    // console.log(addressBech32SendADA)
    // console.log(lovelaceToSend)

    //adding inputs and outputs 
    txBuilder.add_output(
      TransactionOutput.new(
          shelleyOutputAddress,
          Value.new(BigNum.from_str(lovelaceToSend.toString()))
      ),
    )

    // getting the utxos sitting on the connected wallet
    const rawutxos = await API.getUtxos()

    let txUnspentOutputs = TransactionUnspentOutputs.new()
    for (let i = 0; i < rawutxos.length; i++) {
      const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawutxos[i], "hex"))
      txUnspentOutputs.add(utxo)
    }
    // console.log(txUnspentOutputs)
    txBuilder.add_inputs_from(txUnspentOutputs, 1)

    // calculating the fee
    txBuilder.add_change_if_needed(shelleyChangeAddress)

    // build the transaction
    const txBody = txBuilder.build();
    // console.log(txBody)

    const transactionWitnessSet = TransactionWitnessSet.new();

    const tx = Transaction.new(
      txBody,
      TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
    )

    
    let txVkeyWitnesses = await API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
    // console.log(txVkeyWitnesses)

    txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    // signing the transaction
    const signedTx = Transaction.new(
        tx.body(),
        transactionWitnessSet
    );

    // sending the transaction
    const submittedTxHash = await API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
    console.log(submittedTxHash)
  }

  const handleWalletchange = (val)=>{
    setradiostate(Number(val.currentTarget.value))
    setwhichWalletSelected(wallets1[Number(val.currentTarget.value)])
    setvwalletIsEnabled(false)
  }

  React.useEffect(()=>{
    walletselected()
  }, [])

  return (
    <div>
      <button onClick={enableWallet}>{(whichWalletSelected === undefined) 
                                        ? "Choose wallet" 
                                        : `Connect ${whichWalletSelected}`}</button>
      <button onClick={getBalanceRepo}>getbalance</button>
      <br></br>
      <br></br>
      <label> Nami Wallet
      <input type="radio"
             name='react-rasio-btn'
             value={0}
             checked={isWalletSelected(0)} 
             onChange={handleWalletchange}/>
      </label>
      <label> Flint Wallet
      <input type="radio"
             name='react-rasio-btn'
             value={1}
             checked={isWalletSelected(1)}
             onChange={handleWalletchange}/>
      </label>
      { show && <div>{`${balance1} lovelaces`}</div>}
      <br></br>
      <br></br>
      <button onClick={getUtxos}>getUtxos</button>
      <br></br>
      <br></br>
      <label>Receiving address
      <input type="text" onChange={(chng)=>{
        setaddressBech32SendADA(chng.target.value)
        console.log(chng.target.value)
      }}/>
      </label>
      <br></br>
      <br></br>
      <label>Amount in lovelace
      <input type="text" onChange={(chng)=>{
        setlovelaceToSend(Number(chng.target.value))
        console.log((Number(chng.target.value)))
      }}/>
      </label>
      <button onClick={buildSendADATxn}>transact</button>
    </div>
  )
}
