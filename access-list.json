const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const ACCESS_LIST_URL =
  "https://raw.githubusercontent.com/alibrowser625/auto-entry-access/main/access-list.json";

async function getAccessList() {
  const response = await fetch(ACCESS_LIST_URL);

  if (!response.ok) {
    throw new Error(`Could not load access-list.json: ${response.status}`);
  }

  return response.json();
}

function hashAccessKey(accessKey) {
  return crypto
    .createHash("sha256")
    .update(accessKey, "utf8")
    .digest("hex");
}

app.get("/health", async (req, res) => {
  try {
    await getAccessList();

    res.json({
      ok: true,
      repository: "alibrowser625/auto-entry-access",
      file: "access-list.json"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { id, accessKey } = req.body;

    if (!id || !accessKey) {
      return res.status(400).json({
        ok: false,
        error: "ID and access key are required"
      });
    }

    const accessList = await getAccessList();

    const user = accessList.users?.find(
      user => user.id === id && user.active === true
    );

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Invalid ID or access key"
      });
    }

    const suppliedHash = hashAccessKey(accessKey);

    const valid = crypto.timingSafeEqual(
      Buffer.from(suppliedHash, "utf8"),
      Buffer.from(user.keyHash, "utf8")
    );

    if (!valid) {
      return res.status(401).json({
        ok: false,
        error: "Invalid ID or access key"
      });
    }

    res.json({
      ok: true,
      message: "Login successful"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
