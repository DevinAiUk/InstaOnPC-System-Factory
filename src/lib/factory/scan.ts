import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
export function publicIPv4(address: string) {
  if (isIP(address) !== 4) return false;
  const [a, b] = address.split(".").map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0)) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0)
  );
}
export async function scanPublicSite(raw: string) {
  const url = new URL(raw);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    isIP(url.hostname) ||
    url.hostname.endsWith(".example")
  )
    throw new Error(
      "Use a public HTTPS domain without credentials or a custom port.",
    );
  const addresses = await lookup(url.hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some((x) => !publicIPv4(x.address)))
    throw new Error(
      "Private or reserved network destinations are not permitted.",
    );
  const html = await new Promise<string>((resolve, reject) => {
    const req = request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "InstaOnPC-System-Factory/1.0 (operator-requested public page review)",
          Accept: "text/html",
        },
        lookup: (_host, _opts, cb) => cb(null, addresses[0].address, 4),
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(
            new Error(
              "Page returned HTTP " +
                res.statusCode +
                ". Redirects are not followed; enter the final URL or paste an approved source.",
            ),
          );
          return;
        }
        if (!res.headers["content-type"]?.includes("text/html")) {
          res.resume();
          reject(new Error("Only HTML pages are supported."));
          return;
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > 512000) {
            req.destroy(new Error("Page exceeds the 500 KB scan limit."));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      },
    );
    const timer = setTimeout(
      () => req.destroy(new Error("Scan timed out; paste a source instead.")),
      10000,
    );
    req.on("close", () => clearTimeout(timer));
    req.on("error", reject);
    req.end();
  });
  const clean = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const title = clean(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || url.hostname,
  );
  const text = clean(
    html.replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ""),
  ).slice(0, 10000);
  if (!text)
    throw new Error("No readable HTML content; paste a source instead.");
  return { title, url: url.href, text };
}
