import React, { useState } from "react";

export default function ConnectWallet(props) {
  /**
   * Checks if a connection has been established with
   * the wallet
   */
  const checkIfWalletEnabled = async () => {
    let walletIsEnabled = false;

    try {
      const walletName = props.whichWalletSelected;
      walletIsEnabled = await window.cardano[walletName].isEnabled(); //returns true or false
    } catch (err) {
      console.log(err);
    }
    props.setwalletIsEnabled(walletIsEnabled);
    return walletIsEnabled;
  };

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  // returns an array for the number of cardano wallets available in your browser
  const walletselected = (count = 0) => {
    const wallets = [];
    console.log(typeof window.cardano);
    // window.cardano is the object containing info and functions related to the cardano wallets present
    // in the browser you are using
    for (const key in window.cardano) {
      // wallets.indexOf(key) => checks if the key is present in the wallets list
      // window.cardano[key].enable => checks if the enable function is avalable or not, cause only wallets
      // will have the enable function
      if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
        wallets.push(key);
      }
    }
    // checks if the available wallets in the browser are added to the `wallets` list or not
    if (wallets.length === 0 && count < 3) {
      setTimeout(() => {
        walletselected(count + 1);
      }, 1000);
      return;
    }
    props.setwallets1(wallets);
    console.log(wallets);
  };

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  // responsible for the pop-up from the respective chosen wallet
  const enableWallet = async () => {
    const walletKey = props.whichWalletSelected;
    try {
      const newAPI = await window.cardano[walletKey].enable();
      // newAPI is just a collection of wallet functions in an object
      props.setAPI(newAPI);
    } catch (err) {
      console.log(err);
    }
    return checkIfWalletEnabled();
  };

  // just looking at this in the console
  if (props.walletIsEnabled) {
    console.log(`${props.whichWalletSelected} connected`);
  } else {
    console.log("not yet connected");
  }

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  const handleWalletchange = (val) => {
    props.setradiostate(Number(val.currentTarget.value));
    props.setwhichWalletSelected(
      props.wallets1[Number(val.currentTarget.value)]
    );
    // setting the walletisenabled state false so the user has to click on the connect button everytime
    // they change the wallet they want to connect
    props.setwalletIsEnabled(false);
  };

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  const isWalletSelected = (val) => {
    if (props.radiostate === val) {
      return true;
    } else {
      return false;
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////

  React.useEffect(() => {
    walletselected();
  }, []);

  return (
    <div>
      <h3>
        {props.whichWalletSelected === undefined
          ? "Choose wallet"
          : `Connect Chosen Wallet`}
      </h3>
      <label>
        {" "}
        {/* <img src={}></img> */}
        Nami Wallet
        <input
          type="radio"
          name="react-rasio-btn"
          value={0}
          checked={isWalletSelected(0)}
          // onchange function is called when we change the wallet to connect
          // it sets the radiostate to the value of this radio input and checks if the value
          // is correct or not is yes then fills the radio circle
          onChange={handleWalletchange}
        />
      </label>
      <label>
        {" "}
        Flint Wallet
        <input
          type="radio"
          name="react-rasio-btn"
          value={1}
          checked={isWalletSelected(1)}
          onChange={handleWalletchange}
        />
      </label>
      <br />
      <br />
      <button onClick={enableWallet}>
        {props.whichWalletSelected === undefined
          ? "Choose wallet"
          : `Connect ${props.whichWalletSelected}`}
      </button>
      <h4>{props.walletIsEnabled ? `Connected` : ``}</h4>
    </div>
  );
}
