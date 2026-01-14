const https = require('https');

const address = "0xc0c314Ac5B015449801A49087EaFD3D222F73Af9";
const apiKey = "6cba56501b3640d1b0b4f28690900992"; // From .env.local
const url = `https://sepolia.infura.io/v3/${apiKey}`;

const data = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getCode",
    params: [address, "latest"],
    id: 1
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Checking address:", address);

const req = https.request(url, options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(body);
            if (result.error) {
                console.error("RPC Error:", result.error);
            } else {
                const code = result.result;
                console.log("Code length:", code.length);
                if (code === "0x" || code === "0x0") {
                    console.log("❌ No code at this address on Sepolia!");
                } else {
                    console.log("✅ Code found at this address on Sepolia.");
                }
            }
        } catch (e) {
            console.error("Parse Error:", e);
        }
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.write(data);
req.end();
