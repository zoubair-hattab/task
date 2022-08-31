var ethers = require('ethers');
  var provider = new ethers.providers.JsonRpcProvider(
    "https://sgb.ftso.com.au/ext/bc/C/rpc"
  );
  const ftsoRegistry = {
    address: "0x6D222fb4544ba230d4b90BA1BfC0A01A94E6cB23",
    abi: [
      {
        type: "function",
        stateMutability: "view",
        outputs: [
          {
            type: "address[]",
            name: "_ftsos",
            internalType: "contract IIFtso[]",
          },
        ],
        name: "getSupportedFtsos",
        inputs: [],
      },
      {
        type: "function",
        stateMutability: "view",
        outputs: [
          {
            type: "string[]",
            name: "_supportedSymbols",
            internalType: "string[]",
          },
        ],
        name: "getSupportedSymbols",
        inputs: [],
      },
      {
        type: "function",
        stateMutability: "view",
        outputs: [
          { type: "uint256", name: "_price", internalType: "uint256" },
          { type: "uint256", name: "_timestamp", internalType: "uint256" },
        ],
        name: "getCurrentPrice",
        inputs: [{ type: "string", name: "_symbol", internalType: "string" }],
      },
      {
        type: "function",
        stateMutability: "view",
        outputs: [
          { type: "uint256", name: "_price", internalType: "uint256" },
          { type: "uint256", name: "_timestamp", internalType: "uint256" },
        ],
        name: "getCurrentPrice",
        inputs: [
          { type: "uint256", name: "_assetIndex", internalType: "uint256" },
        ],
      },
    ],
  };

  const ftsoRegistryContract = new ethers.Contract(
    ftsoRegistry.address,
    ftsoRegistry.abi,
    provider
  );
  let prices=[]

  let supportedSymbols = [];

 main = async () => {
    supportedSymbols = await ftsoRegistryContract.getSupportedSymbols();
    await getSymbolPrices();
    await finalizationListener();
  };
  main()
  async function getSymbolPrices() {
    prices=[]
    
    for (var symbol of supportedSymbols) {
      let response = await ftsoRegistryContract["getCurrentPrice(string)"](
        symbol
      );
      let price = Number(response._price) / 10 ** 5; 
prices.push({symbol,price});
    }
console.log (prices) 
 }
  async function finalizationListener() {
    let supportedFtsos = await ftsoRegistryContract.getSupportedFtsos();

    let ftso = {
      address: supportedFtsos[0],
      abi: [
        {
          type: "event",
          name: "PriceFinalized",
          inputs: [
            {
              type: "uint256",
              name: "epochId",
              internalType: "uint256",
              indexed: true,
            },
            {
              type: "uint256",
              name: "price",
              internalType: "uint256",
              indexed: false,
            },
            {
              type: "bool",
              name: "rewardedFtso",
              internalType: "bool",
              indexed: false,
            },
            {
              type: "uint256",
              name: "lowRewardPrice",
              internalType: "uint256",
              indexed: false,
            },
            {
              type: "uint256",
              name: "highRewardPrice",
              internalType: "uint256",
              indexed: false,
            },
            {
              type: "uint8",
              name: "finalizationType",
              internalType: "enum IFtso.PriceFinalizationType",
              indexed: false,
            },
            {
              type: "uint256",
              name: "timestamp",
              internalType: "uint256",
              indexed: false,
            },
          ],
          anonymous: false,
        },
      ],
    };
    const ftsoContract = new ethers.Contract(ftso.address, ftso.abi, provider);
    ftsoContract.on("PriceFinalized", async () => {
      getSymbolPrices();
    });
  }
