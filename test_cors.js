fetch("https://tradelense-ai-engine.fly.dev/analyze", {
  method: "OPTIONS",
  headers: {
    "Origin": "https://traderlense.com",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
  }
}).then(async res => {
  console.log("OPTIONS Status:", res.status);
  res.headers.forEach((v, k) => console.log(k, ":", v));

  if (res.ok) {
    console.log("\nStarting POST...");
    const postRes = await fetch("https://tradelense-ai-engine.fly.dev/analyze", {
      method: "POST",
      headers: {
        "Origin": "https://traderlense.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        asset: "BTC/USD - Time Horizon: SCALP - Bias: LONG - Rationale: Trendline bounce"
      })
    });
    console.log("POST Status:", postRes.status);
    postRes.headers.forEach((v, k) => console.log(k, ":", v));
    const text = await postRes.text();
    console.log("Response Body:", text);
  }
}).catch(err => console.error("Error:", err));
