import fs from "fs";
import path from "path";

const roots = [
  "src/app/erp",
  "src/components/erp",
  "src/lib/erp-image-upload.ts",
];

function patchFile(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  const orig = s;

  s = s.replace(
    /import \{ getToken \} from "@\/lib\/auth-store";/g,
    'import { getErpToken } from "@/lib/auth-store";',
  );
  s = s.replace(
    /import \{ getStoredUser, getToken \} from "@\/lib\/auth-store";/g,
    'import { getErpStoredUser, getErpToken } from "@/lib/auth-store";',
  );
  s = s.replace(
    /import \{ getToken, getStoredUser \} from "@\/lib\/auth-store";/g,
    'import { getErpToken, getErpStoredUser } from "@/lib/auth-store";',
  );
  s = s.replace(/\bgetToken\(\)/g, "getErpToken()");
  s = s.replace(/\bgetStoredUser\(\)/g, "getErpStoredUser()");

  if (s !== orig) {
    fs.writeFileSync(filePath, s, "utf8");
    console.log("patched", filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    if (/\.(tsx?|jsx?)$/.test(dir)) patchFile(dir);
    return;
  }
  for (const name of fs.readdirSync(dir)) {
    walk(path.join(dir, name));
  }
}

const base = path.resolve(".");
for (const rel of roots) {
  walk(path.join(base, rel));
}
