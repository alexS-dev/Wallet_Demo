import React, { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
  const [ordinalsAddress, setOrdinalsAddress] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useState("");
  const [paymentPublicKey, setPaymentPublicKey] = useState("");

  const [isXverseWalletConnectClicked, setIsXverseWalletConnectClicked] =
    useState(false);
  const [isXverseWalletConnected, setIsXverseWalletConnected] = useState(false);

  const [isUniSatWalletConnectClicked, setIsUniSatWalletConnectClicked] =
    useState(false);
  const [isUniSatWalletConnected, setIsUniSatWalletConnected] = useState(false);

  const [NETWORK, setNetwork] = useState("Testnet");

  return (
    <WalletContext.Provider
      value={{
        ordinalsAddress,
        setOrdinalsAddress,
        paymentAddress,
        setPaymentAddress,
        ordinalsPublicKey,
        setOrdinalsPublicKey,
        paymentPublicKey,
        setPaymentPublicKey,
        isXverseWalletConnectClicked,
        setIsXverseWalletConnectClicked,
        isXverseWalletConnected,
        setIsXverseWalletConnected,
        isUniSatWalletConnectClicked,
        setIsUniSatWalletConnectClicked,
        isUniSatWalletConnected,
        setIsUniSatWalletConnected,
        NETWORK,
        setNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
