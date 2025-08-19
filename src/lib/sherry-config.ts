// Sherry SDK configuration for POAP mini-app

export interface SherryMetadata {
  type: "action";
  url: string;
  icon: string;
  title: string;
  description: string;
  actions: SherryAction[];
}

export interface SherryAction {
  label: string;
  address: string;
  abi: any[];
  functionName: string;
  paramsLabel: string[];
  chain: string;
}

// This will be the metadata for our POAP minting mini-app
export const createPOAPMetadata = (eventId: number, eventName: string): SherryMetadata => {
  return {
    type: "action",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    icon: "/poap-event-image.png",
    title: `Mint ${eventName} POAP`,
    description: "Claim your commemorative POAP badge",
    actions: [
      {
        label: "Mint POAP",
        // This would be the POAP contract address
        address: "0x22C1f6050E56d2876009903609a2cC3fEf83B415", // POAP contract on mainnet
        abi: [
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              }
            ],
            "name": "mintToken",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "mintToken",
        paramsLabel: ["Event ID", "Recipient"],
        chain: "mainnet"
      }
    ]
  };
};