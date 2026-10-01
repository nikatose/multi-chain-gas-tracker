const networks = [
  {
    name: "Ethereum",
    symbol: "ETH",
    rpc: "https://eth.llamarpc.com"
  },
  {
    name: "Arbitrum One",
    symbol: "ETH",
    rpc: "https://arbitrum.publicnode.com"
  },
  {
    name: "Optimism",
    symbol: "ETH",
    rpc: "https://mainnet.optimism.io"
  },
  {
    name: "Base",
    symbol: "ETH",
    rpc: "https://mainnet.base.org"
  },
  {
    name: "Polygon",
    symbol: "POL",
    rpc: "https://polygon-rpc.com"
  }
];


async function getGasPrice(network) {

  const response = await fetch(network.rpc, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    })

  });

  if (!response.ok) {
    throw new Error("RPC request failed");
  }

  const data = await response.json();

  if (!data.result) {
    throw new Error("Invalid RPC response");
  }

  const wei = BigInt(data.result);

  const gwei =
    Number(wei) / 1_000_000_000;

  return gwei;
}


function createCard(network) {

  return `
    <article class="network">

      <div class="network-header">

        <div class="network-name">
          <span class="dot"></span>
          ${network.name}
        </div>

        <span class="gas-label">
          ${network.symbol}
        </span>

      </div>

      <div class="gas-label">
        Current Gas Price
      </div>

      <div class="gas-price" id="${network.name.replace(/\s/g, "-")}">
        ...
        <span class="unit">Gwei</span>
      </div>

      <div class="updated" id="${network.name.replace(/\s/g, "-")}-time">
        Updating...
      </div>

    </article>
  `;
}


function renderCards() {

  const container =
    document.getElementById("networks");

  container.innerHTML =
    networks.map(createCard).join("");

}


async function updateNetwork(network) {

  const id =
    network.name.replace(/\s/g, "-");

  const element =
    document.getElementById(id);

  const timeElement =
    document.getElementById(`${id}-time`);

  try {

    const gas =
      await getGasPrice(network);

    element.innerHTML =
      `${gas.toFixed(2)}
       <span class="unit">Gwei</span>`;

    element.classList.remove("error");

    const now =
      new Date().toLocaleTimeString();

    timeElement.textContent =
      `Updated at ${now}`;

  } catch (error) {

    element.innerHTML =
      `<span class="error">Unavailable</span>`;

    timeElement.textContent =
      "RPC request failed";

  }

}


async function updateAll() {

  const status =
    document.getElementById("status");

  status.textContent =
    "Updating...";

  await Promise.all(
    networks.map(updateNetwork)
  );

  status.textContent =
    "● Live";

}


renderCards();

updateAll();

setInterval(
  updateAll,
  15000
);
