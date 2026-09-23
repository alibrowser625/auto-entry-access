const express = require("express");

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

    // Supports either:
    // { "Alihasanptw": "Hollywood123$$" }
    // or:
    // { "users": [{ "id": "Alihasanptw", "accessKey": "Hollywood123$$" }] }

    let valid = false;

    if (
      accessList &&
      typeof accessList === "object" &&
      accessList[id] === accessKey
    ) {
      valid = true;
    }

    if (Array.isArray(accessList?.users)) {
      valid = accessList.users.some(
        user => user.id === id && user.accessKey === accessKey
      );
    }

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
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
