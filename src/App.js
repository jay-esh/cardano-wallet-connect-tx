import React, { useState } from "react";
import {
  Address,
  BaseAddress,
  MultiAsset,
  Assets,
  ScriptHash,
  Costmdls,
  Language,
  CostModel,
  AssetName,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutputBuilder,
  LinearFee,
  BigNum,
  BigInt,
  TransactionHash,
  TransactionInputs,
  TransactionInput,
  TransactionWitnessSet,
  Transaction,
  PlutusData,
  PlutusScripts,
  PlutusScript,
  PlutusList,
  Redeemers,
  Redeemer,
  RedeemerTag,
  Ed25519KeyHashes,
  ConstrPlutusData,
  ExUnits,
  Int,
  NetworkInfo,
  EnterpriseAddress,
  TransactionOutputs,
  hash_transaction,
  hash_script_data,
  hash_plutus_data,
  // index_of_input,
  ScriptDataHash,
  Ed25519KeyHash,
  NativeScript,
  StakeCredential,
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
    "addr_test1wruv9whqljf3jhv3tk5q8v0e6aa5dqap8tz3yw64q3d4vtsfzmhu7"
  );
  const [datumStr, setdarumStr] = useState("123456");
  const [CollatUtxos, setCollatUtxos] = useState(undefined);
  const [transactionIdLocked, settransactionIdLocked] = useState(
    "6014fcd13144bb86624a395708d9718bb04edced26c65a0eaa1a9b7caeaaac67"
  );
  const [transactionIndxLocked, settransactionIndxLocked] = useState(0);
  const [plutusScriptCborHex, setplutusScriptCborHex] = useState(
    "59077b01000033232323232323232323232323232332232323232223222323253353330073333573466e1cd55cea802a40004642460020046eb4d5d09aab9e500623263533573803603203002e6eb4010cccd5cd19b8735573aa004900011991091980080180119191919191919191919191999ab9a3370e6aae754029200023333333333222222222212333333333300100b00a009008007006005004003002335015232323333573466e1cd55cea8012400046644246600200600460406ae854008c068d5d09aba2500223263533573805605205004e26aae7940044dd50009aba1500a33501501635742a012666aa030eb9405cd5d0a804199aa80c3ae501735742a00e66a02a0406ae854018cd4054cd5408c085d69aba150053232323333573466e1cd55cea801240004664424660020060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008cd4099d69aba150023027357426ae8940088c98d4cd5ce01781681601589aab9e5001137540026ae854008c8c8c8cccd5cd19b8735573aa004900011991091980080180119a8133ad35742a004604e6ae84d5d1280111931a99ab9c02f02d02c02b135573ca00226ea8004d5d09aba2500223263533573805605205004e26aae7940044dd50009aba1500433501575c6ae85400ccd4054cd5408dd710009aba15002301d357426ae8940088c98d4cd5ce01381281201189aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aab9e5001137540026ae854008c8c8c8cccd5cd19b875001480188c848888c010014c060d5d09aab9e500323333573466e1d40092004232122223002005301a357426aae7940108cccd5cd19b875003480088c848888c004014c058d5d09aab9e500523333573466e1d40112000232122223003005375c6ae84d55cf280311931a99ab9c02202001f01e01d01c01b135573aa00226ea8004d5d09aba2500223263533573803603203002e2030264c6a66ae712410350543500018017135573ca00226ea80044dd50008919118011bac001320013550142233335573e0024a012466a01060086ae84008c00cd5d100100991919191999ab9a3370e6aae75400d20002333222123330010040030023232323333573466e1cd55cea80124000466442466002006004602a6ae854008cd4038050d5d09aba2500223263533573803403002e02c26aae7940044dd50009aba150033335500775ca00c6ae854008cd4029d71aba135744a004464c6a66ae7005805004c0484d5d1280089aab9e500113754002266aa002eb9d6889119118011bab00132001355012223233335573e0044a010466a00e66aa028600c6aae754008c014d55cf280118021aba200301213574200222440042442446600200800624464646666ae68cdc3a800a40004642446004006600a6ae84d55cf280191999ab9a3370ea0049001109100091931a99ab9c01201000f00e00d135573aa00226ea80048c8c8cccd5cd19b8735573aa004900011991091980080180118029aba15002375a6ae84d5d1280111931a99ab9c00f00d00c00b135573ca00226ea80048c8cccd5cd19b8735573aa002900011bae357426aae7940088c98d4cd5ce00680580500489baa00112232323333573466e1d400520042122200123333573466e1d40092002232122230030043006357426aae7940108cccd5cd19b87500348000848880088c98d4cd5ce00800700680600580509aab9d5001137540024646666ae68cdc3a800a4004424400446666ae68cdc3a801240004244002464c6a66ae7003002802402001c4d55ce9baa001232323232323333573466e1d4005200c21222222200323333573466e1d4009200a21222222200423333573466e1d400d2008233221222222233001009008375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c4664424444444660040120106eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc8848888888cc018024020c030d5d0a8049bae357426ae8940248cccd5cd19b875006480088c848888888c01c020c034d5d09aab9e500b23333573466e1d401d2000232122222223005008300e357426aae7940308c98d4cd5ce00a00900880800780700680600580509aab9d5004135573ca00626aae7940084d55cf280089baa0012323232323333573466e1d400520022333222122333001005004003375a6ae854010dd69aba15003375a6ae84d5d1280191999ab9a3370ea0049000119091180100198041aba135573ca00c464c6a66ae7003402c0280240204d55cea80189aba25001135573ca00226ea80048c8c8cccd5cd19b875001480088c8488c00400cdd71aba135573ca00646666ae68cdc3a8012400046424460040066eb8d5d09aab9e500423263533573801401000e00c00a26aae7540044dd50008891119191999ab9a3370e6aae754009200023355009300635742a004600a6ae84d5d1280111931a99ab9c00a008007006135573ca00226ea8005261200111221233001003002491035054310011232300100122330033002002001332222232533500110061335738920112636f646520646964206e6f74206d617463680000532333573466e1c00400c018014d400c8004488008488005"
  );
  {
    /*
    [
        {
            "tx_hash": "11e655601b0fab4551bccb1b7e18f1640b48bac3b144aafb2060c89562a43680",
            "tx_index": 0,
            "purpose": "spend",
            "datum_hash": "9e1199a988ba72ffd6e9c269cadb3b53b5f360ff99f112d9b2ee30c4d74ad88b",
            "unit_mem": "385810",
            "unit_steps": "172312954",
            "fee": "34686"
        }
    ]*/
  }
  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  const buildSendAdaToPlutusScript = async () => {
    const raw = await API.getChangeAddress();
    setchangeAddress(Address.from_bytes(Buffer.from(raw, "hex")).to_bech32());

    const txBuilder = await initTransactionBuilder();
    const ScriptAddress = Address.from_bech32(addressScriptBech32);
    const shelleyChangeAddress = Address.from_bech32(changeAddress);

    //building the txn output
    let txOutputBuilder = TransactionOutputBuilder.new();

    // including the address where the output would go to
    txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
    console.log(txOutputBuilder);

    // adding datum to the txn output
    const dataHash = hash_plutus_data(
      PlutusData.new_integer(BigInt.from_str(datumStr))
    );
    console.log(dataHash);
    txOutputBuilder = txOutputBuilder.with_data_hash(dataHash);
    console.log(txOutputBuilder);

    // now converting TransactionOutputBuilder to TransactionOutputAmountBuilder
    txOutputBuilder = txOutputBuilder.next();

    //adding the amount of lovelace to be sent in the output
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
    //   lovelaceLocked: lovelaceToSend,
    // });
  };

  /**
   * The collateral is need for working with Plutus Scripts
   * Essentially you need to provide collateral to pay for fees if the
   * script execution fails after the script has been validated...
   * this should be an uncommon occurrence and would suggest the smart contract
   * would have been incorrectly written.
   * The amount of collateral to use is set in the wallet
   * @returns {Promise<void>}
   */
  const getCollateral = async () => {
    let CollatUtxos = [];

    try {
      let collateral = [];

      const wallet = whichWalletSelected;
      if (wallet === "nami") {
        collateral = await API.experimental.getCollateral();
        console.log(collateral);
      } else {
        collateral = await API.getCollateral();
      }

      for (const x of collateral) {
        const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
        CollatUtxos.push(utxo);
        // console.log(utxo)
      }
      console.log(CollatUtxos);
      setCollatUtxos(CollatUtxos);
    } catch (err) {
      console.log(err);
    }
  };

  const buildRedeemAdaFromPlutusScript = async () => {
    try {
      // getting the address of the connected wallet
      const raw = await API.getChangeAddress();
      setchangeAddress(Address.from_bytes(Buffer.from(raw, "hex")).to_bech32());

      const txBuilder = await initTransactionBuilder();
      const ScriptAddress = Address.from_bech32(addressScriptBech32);
      const shelleyChangeAddress = Address.from_bech32(changeAddress);

      txBuilder.add_input(
        ScriptAddress,
        TransactionInput.new(
          TransactionHash.from_bytes(Buffer.from(transactionIdLocked, "hex")),
          transactionIndxLocked
        ),
        Value.new(BigNum.from_str("3000000"))
      ); // how much lovelace is at that UTXO

      // txBuilder.set_ttl()
      txBuilder.set_fee(BigNum.from_str("900000"));

      const scripts = PlutusScripts.new();
      scripts.add(
        PlutusScript.from_bytes(Buffer.from(plutusScriptCborHex, "hex"))
      ); //from cbor of plutus script

      // Add outputs
      const outputVal = 3000000 - 900000;
      const outputValStr = outputVal.toString();
      txBuilder.add_output(
        TransactionOutput.new(
          shelleyChangeAddress,
          Value.new(BigNum.from_str(outputValStr))
        ) //IUB_973nr8%$
      ); //""transaction submit error ShelleyTxValidationError ShelleyBasedEraAlonzo (ApplyTxError [UtxowFailure (NonOutputSupplimentaryDatums (fromList [SafeHash \"7cfec515f56d4413375aa9775f5de15ee60180861e9eaa954bcf9d015054857c\(->123)"]) (fromList [])),UtxowFailure (ExtraRedeemers [RdmrPtr Spend 0]),UtxowFailure (WrappedShelleyEraFailure (MissingScriptWitnessesUTXOW (fromList [ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\"]))),UtxowFailure (WrappedShelleyEraFailure (UtxoFailure (UtxosFailure (CollectErrors [NoWitness (ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\")]))))])""
      // NonOutputSupplimentaryDatums
      //""transaction submit error ShelleyTxValidationError ShelleyBasedEraAlonzo (ApplyTxError [UtxowFailure (NonOutputSupplimentaryDatums (fromList [SafeHash \"9e1199a988ba72ffd6e9c269cadb3b53b5f360ff99f112d9b2ee30c4d74ad88b\(->42)"]) (fromList [])),UtxowFailure (ExtraRedeemers [RdmrPtr Spend 0]),UtxowFailure (WrappedShelleyEraFailure (MissingScriptWitnessesUTXOW (fromList [ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\"]))),UtxowFailure (WrappedShelleyEraFailure (UtxoFailure (UtxosFailure (CollectErrors [NoWitness (ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\")]))))])""
      // MissingScriptWitnessUTXOW
      // "“transaction submit error ShelleyTxValidationError ShelleyBasedEraAlonzo (ApplyTxError [UtxowFailure (NonOutputSupplimentaryDatums (fromList [SafeHash \“7cfec515f56d4413375aa9775f5de15ee60180861e9eaa954bcf9d015054857c\(->123)“]) (fromList [])),UtxowFailure (ExtraRedeemers [RdmrPtr Spend 0]),UtxowFailure (WrappedShelleyEraFailure (MissingScriptWitnessesUTXOW (fromList [ScriptHash \“f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\“]))),UtxowFailure (WrappedShelleyEraFailure (UtxoFailure (UtxosFailure (CollectErrors [NoWitness (ScriptHash \“f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\“)]))))])“”
      // NoWitness
      //""transaction submit error ShelleyTxValidationError ShelleyBasedEraAlonzo (ApplyTxError [UtxowFailure (NonOutputSupplimentaryDatums (fromList [SafeHash \"87eea4f31833397f5a984236f634b1b657639e066a077007ce5affaee4cf21e0\(->123456)"]) (fromList [])),UtxowFailure (ExtraRedeemers [RdmrPtr Spend 0]),UtxowFailure (WrappedShelleyEraFailure (MissingScriptWitnessesUTXOW (fromList [ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\"]))),UtxowFailure (WrappedShelleyEraFailure (UtxoFailure (UtxosFailure (CollectErrors [NoWitness (ScriptHash \"f8c2bae0fc93195d915da803b1f9d77b4683a13ac5123b55045b562e\")]))))])""
      // once the transaction is ready, we build it to get the tx body without witnesses
      const txBody = await txBuilder.build();

      const collateral = CollatUtxos;
      const inputs = TransactionInputs.new();
      console.log(collateral);
      console.log(CollatUtxos);
      collateral.forEach((utxo) => {
        inputs.add(utxo.input());
      });

      let datums = PlutusList.new();
      // datums.add(PlutusData.from_bytes(Buffer.from(datumStr, "utf8")));
      datums.add(PlutusData.new_integer(BigInt.from_str(datumStr)));
      // console.log(Buffer.from(datums.to_bytes(), "hex").toString("hex"));
      // console.log(Buffer(datums.get(0).to_bytes(), "hex").toString("hex"));

      const redeemers = Redeemers.new();

      const data = PlutusData.new_constr_plutus_data(
        ConstrPlutusData.new(BigNum.from_str("0"), PlutusList.new())
      );

      // const redeemerIndex = txBuilder.index_of_input(scriptDataHash.input());

      const redeemer = Redeemer.new(
        RedeemerTag.new_spend(),
        BigNum.from_str("0"),
        data,
        ExUnits.new(BigNum.from_str("7000000"), BigNum.from_str("3000000000"))
      );

      redeemers.add(redeemer);

      // Tx witness
      const transactionWitnessSet = TransactionWitnessSet.new();

      transactionWitnessSet.set_plutus_scripts(scripts);
      transactionWitnessSet.set_plutus_data(datums);
      transactionWitnessSet.set_redeemers(redeemers);

      const cost_model_vals = [
        197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32,
        2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100,
        29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32,
        150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000,
        425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1,
        150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32,
        150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1,
        103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32,
        150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0,
        1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1,
        148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000,
        5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000,
        32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1,
      ];

      const costModel = CostModel.new();
      cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));

      const costModels = Costmdls.new();
      costModels.insert(Language.new_plutus_v1(), costModel);

      const scriptDataHash = hash_script_data(redeemers, costModels, datums);
      txBody.set_script_data_hash(scriptDataHash);

      txBody.set_collateral(inputs);

      const baseAddress = BaseAddress.from_address(shelleyChangeAddress);
      const requiredSigners = Ed25519KeyHashes.new();
      requiredSigners.add(baseAddress.payment_cred().to_keyhash());

      txBody.set_required_signers(requiredSigners);

      const tx = Transaction.new(
        txBody,
        TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
      );

      // console.log(tx);
      let txVkeyWitnesses = await API.signTx(
        Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
        true
      );

      txVkeyWitnesses = TransactionWitnessSet.from_bytes(
        Buffer.from(txVkeyWitnesses, "hex")
      );

      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      const signedTx = Transaction.new(
        tx.body(),
        transactionWitnessSet,
        tx.auxiliary_data()
      );
      console.log(`txVkeyWitnesses : ${signedTx}`);

      const submittedTxHash = await API.submitTx(
        Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
      );
      console.log(submittedTxHash);
      // this.setState({ submittedTxHash });
    } catch (error) {
      console.log(typeof error);
      console.log(error.info);
      console.log(error.message);
    }
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
      <button onClick={getCollateral}>Get Collateral</button>
      <button onClick={buildRedeemAdaFromPlutusScript}>redeem funds</button>
    </div>
  );
}
