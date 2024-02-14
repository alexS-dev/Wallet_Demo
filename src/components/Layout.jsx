import React, { useState, useEffect, useRef } from "react";
import { getAddress, sendBtcTransaction, signMessage } from "sats-connect";
import { useWallet } from "../WalletContext";

const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const Layout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    ordinalsAddress,
    setOrdinalsAddress,
    paymentAddress,
    setPaymentAddress,
    ordinalsPublicKey,
    setOrdinalsPublicKey,
    paymentPublicKey,
    setPaymentPublicKey,
    NETWORK,
    setNetwork,

    isXverseWalletConnectClicked,
    setIsXverseWalletConnectClicked,
    isXverseWalletConnected,
    setIsXverseWalletConnected,
    isUniSatWalletConnectClicked,
    setIsUniSatWalletConnectClicked,
    isUniSatWalletConnected,
    setIsUniSatWalletConnected,

    LABB_endpoint
  } = useWallet();

  const [walletName, setWalletName] = useState("");
  const [btcBalance, setBtcBalance] = useState("");
  const [labbBalance, setLabbBalance] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [labbAmount, setLabbAmount] = useState(0);
  const [MessageObject, setMessageObject] = useState("");

  // Close Wallet Connect Modal
  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Click Xverse Wallet Connect Button
  const onXverseWalletConnectClick = async () => {
    setIsXverseWalletConnectClicked(true);
    onConnectClick("xverse");
  };

  // Click UniSat Wallet Connect Button
  const onUniSatWalletConnectClick = () => {
    setIsUniSatWalletConnectClicked(true);
    onConnectClick("unisat");
  };


  // Wallet Connect
  const onConnectClick = async (flag) => {
    if (flag === "xverse") {
      const getAddressOptions = {
        payload: {
          purposes: ["ordinals", "payment"],
          message: "Address for receiving Ordinals",
          network: {
            type: NETWORK,
          },
        },
        onFinish: (response) => {
          setOrdinalsAddress(response.addresses[0].address);
          setPaymentAddress(response.addresses[1].address);
          setOrdinalsPublicKey(response.addresses[0].publicKey);
          setPaymentPublicKey(response.addresses[1].publicKey);
          setIsXverseWalletConnected(true);
          setWalletName("Xverse Wallet");
          handleClose();
        },
        onCancel: () => {
          alert("Request Cancel");
          setIsXverseWalletConnectClicked(false);
        },
      };
      await getAddress(getAddressOptions);
    }

    if (flag === "unisat") {
      const unisat = window.unisat;
      if (unisat) {
        try {
          const accounts = await unisat.requestAccounts();
          if (accounts.length > 0) {
            console.log("unisat accounts", accounts);
            const publicKey = await unisat.getPublicKey();
            setOrdinalsAddress(accounts[0]);
            setPaymentAddress(accounts[0]);
            setOrdinalsPublicKey(publicKey);
            setPaymentPublicKey(publicKey);
            setIsUniSatWalletConnected(true);
            setWalletName("UniSat Wallet");
            handleClose();
          }
        } catch (error) {
          setIsUniSatWalletConnectClicked(false);
          handleClose();
          alert("Could not connect to Unisat");
          console.error("Error connecting to Unisat:", error);
        }
      }
    }
  };


  // Calculate Balance
  const fetchBTCSum = async (Address) => {
    try {
      let url = `https://mempool.space/api/address/${Address}`;
      if (NETWORK == "Testnet") {
        url = `https://mempool.space/testnet/api/address/${Address}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      const btcBalance =
        (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) /
        100000000;
      setBtcBalance(btcBalance);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Calculate Labb Balance
  const fetchLabbBalance = async (Address) => {
    const url = `${LABB_endpoint}/labb_balance`;
    try {
      if( ordinalsAddress==''){
        return;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setLabbBalance(data.balance/100000000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchBTCSum(ordinalsAddress);
    fetchLabbBalance(ordinalsAddress);
  }, [ordinalsAddress]);

  // Test Transaction
  const sendTestTransaction = () => {
    const handleTransactionAmountChange = (event) => {
      const value = parseFloat(event.target.value);
      if (value >= 0) {
        // Only update the state if the value is non-negative
        setTransactionAmount(value);
      }
    };
    const handleMaxAmount = () => {
      const maxAmount = Math.max(btcBalance - 0.0001, 0);
      setTransactionAmount(maxAmount);
    };
    const onSendBtcClick = async () => {
      const recipients_address = ordinalsAddress;
      const recipients_amountSats = parseInt(transactionAmount * 100000000);

      if (isXverseWalletConnected) {
        const sendBtcOptions = {
          payload: {
            network: {
              type: NETWORK,
            },
            recipients: [
              {
                address: recipients_address,
                amountSats: recipients_amountSats,
              },
            ],
            senderAddress: paymentAddress,
          },
          onFinish: (response) => {
            alert(response);
          },
          onCancel: () => alert("Canceled"),
        };
        await sendBtcTransaction(sendBtcOptions);
      }
      if (isUniSatWalletConnected) {
        const unisat = window.unisat;
        try {
          await unisat.sendBitcoin(recipients_address, recipients_amountSats);
        } catch (e) {
          alert("Canceled");
          console.log(e);
        }
      }
    };

    return (
      <div className="flex flex-row mx-5 relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
        >
          <input
            style={{
              width: "100%",
              height: "100%",
              color: "black",
              border: "none",
              background: "transparent",
              outline: "none",
            }}
            type="number"
            min="0"
            value={transactionAmount}
            onChange={handleTransactionAmountChange}
          />
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 ">
            <p
              style={{ color: "black", cursor: "pointer" }}
              onClick={handleMaxAmount}
            >
              Max
            </p>
          </span>
        </button>
        <button
          className="bg-[#FF7248] px-2 border rounded-lg font-bold"
          onClick={onSendBtcClick}
        >
          Send Transaction
        </button>
      </div>
    );
  };

  const sendLabbTransaction = () => {
    const handleTransactionAmountChange = (event) => {
      const value = parseFloat(event.target.value);
      if (value >= 0) {
        // Only update the state if the value is non-negative
        setLabbAmount(value);
      }
    };
    const handleMaxAmount = () => {
      const maxAmount = Math.max(btcBalance - 0.0001, 0);
      setTransactionAmount(maxAmount);
    };

    const onSendLabbClick = async () => {
      const amtMultiplied = parseInt(labbAmount) * Math.pow(10, 8);

      const payload = {
        method: "peg_in",
        rAddr: ordinalsAddress,
        amt: amtMultiplied
      };

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      };
      const ec = new TextEncoder()
      const response = await fetch(`${LABB_endpoint}/bridge_peg_in`, requestOptions);
      const responseData = await response.json();
      if(!responseData.address){
        alert(" bridge peg in address null!");
        return;
      }
      // setLabbResponse(responseData);
      // console.log("sign transfer address:"+ responseData.address+",amount: "+data.amount)
      // setIsClicked(true); 
    };

    return (
      <div className="flex flex-row mx-5 relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
        >
          <input
            style={{
              width: "100%",
              height: "100%",
              color: "black",
              border: "none",
              background: "transparent",
              outline: "none",
            }}
            type="number"
            min="0"
            value={labbAmount}
            onChange={handleTransactionAmountChange}
          />
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 ">
            <p
              style={{ color: "black", cursor: "pointer" }}
              onClick={handleMaxAmount}
            >
              Max
            </p>
          </span>
        </button>
        <button
          className="bg-[#FF7248] px-2 border rounded-lg font-bold"
          onClick={onSendLabbClick}
        >
          Send Transaction
        </button>
      </div>
    );
  };

  // Test Sign Message
  const signTextMessage = () => {
    const handleMessageObject = (event) => {
      setMessageObject(event.target.value);
    };

    const onSignMessageClick = async () => {
      if (isXverseWalletConnected) {
        const signMessageOptions = {
          payload: {
            network: {
              type: NETWORK,
            },
            address: paymentAddress,
            message: JSON.stringify(MessageObject),
          },
          onFinish: () => {
            console.log("sign message");
          },
          onCancel: () => alert("Request canceled."),
        };

        await signMessage(signMessageOptions);
      }
      if (isUniSatWalletConnected) {
        const unisat = window.unisat;
        try {
          await unisat.signMessage(JSON.stringify(MessageObject));
        } catch (e) {
          alert("Canceled");
          console.log(e);
        }
      }
    };
    return (
      <div className="flex flex-row mx-5 relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
        >
          <input
            style={{
              width: "100%",
              height: "100%",
              color: "black",
              border: "none",
              background: "transparent",
              outline: "none",
            }}
            type="text"
            value={MessageObject}
            onChange={handleMessageObject}
          />
        </button>
        <button
          className="bg-[#FF7248] px-2 border rounded-lg font-bold"
          onClick={onSignMessageClick}
        >
          Sign Message
        </button>
      </div>
    );
  };

  return (
    <div className="overflow-y-hidden flex flex-col h-screen">
      <div className="flex justify-end px-5 py-10">
        <div className="mr-10 items-center gap-4 hidden md:flex">
          {!ordinalsAddress ? (
            <button
              className="bg-[#FF7248] p-2 border rounded-lg font-bold text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex flex-col">
              <button className="bg-[#FF7248] p-2 border rounded-lg font-bold text-white">
                {formatAddress(ordinalsAddress)}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Network: {NETWORK}
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Wallet Name: {walletName}
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Ordinals Address: {ordinalsAddress}
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Ordinals Address Public Key: {ordinalsPublicKey}
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Btc Balance: {btcBalance}
      </div>
      <div className="flex flex-col text-white px-5 py-5">
        Labb Balance: {labbBalance}
      </div>
      <div className="flex flex-row items-center text-white px-5 py-5">
        Send Btc Transaction: {sendTestTransaction()}
      </div>
      {/* <div className="flex flex-row items-center text-white px-5 py-5">
        Sign Message: {signTextMessage()}
      </div> */}
      <div className="flex flex-row items-center text-white px-5 py-5">
        Send Labb Transaction: {sendLabbTransaction()}
      </div>
      {isModalOpen && (
        <div
          id="static-modal"
          data-modal-backdrop="static"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 text-white "
        >
          <div className="relative p-4 w-full max-w-2xl border border-white rounded-3xl bg-black">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-12 h-8 ms-auto inline-flex justify-center items-center  "
                onClick={handleClose}
              >
                Close
              </button>
            </div>

            <div className="text-white font-sans text-center">
              <p className="text-3xl my-5">Connect your Wallet</p>
              <div className="flex justify-center flex-col items-center">
                <button
                  onClick={onXverseWalletConnectClick}
                  className="flex justify-center items-center border border-white w-80 rounded-3xl px-5 my-5"
                >
                  <img
                    src="/img/wallet-logo/xverse-wallet.svg"
                    alt="Connect-Logo"
                    className="h-20"
                  />
                  <p className="text-[70px] font-medium pb-4">verse</p>
                </button>
                <button
                  onClick={onUniSatWalletConnectClick}
                  className="flex justify-center items-center border border-white w-80 rounded-3xl px-5 my-5"
                >
                  <img
                    src="/img/wallet-logo/unisat-wallet.svg"
                    alt="Connect-Logo"
                    className="h-20"
                  />
                  <p className="text-[70px] font-medium pb-4">UniSat</p>
                </button>
              </div>
              <p className="text-sm py-5">Click to connect wallet</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
