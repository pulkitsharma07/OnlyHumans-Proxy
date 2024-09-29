const express = require("express");
const puppeteer = require("puppeteer");
const { Jimp } = require("jimp");
const NodeCache = require("node-cache");

const app = express();
const ORIGIN_URL = process.env.ORIGIN_URL;
const CACHE_TTL_SECONDS = process.env.CACHE_TTL_SECONDS || 60;
const pageCache = new NodeCache();

if (!ORIGIN_URL) {
  console.error("ORIGIN_URL env var is not set");
  process.exit(1);
}

// Function to add watermark to the screenshot
async function addWatermark(screen) {
  try {
    // Read the watermark image
    const watermark = await Jimp.read("./watermark.png");
    watermark.scaleToFit({ w: 1920, h: 1080 });

    // Read the screenshot image from the base64 string
    const screenshot = await Jimp.read(
      Buffer.from(screen, "base64"),
      Jimp.MIME_PNG
    );

    // Get dimensions of the screenshot
    const { width, height } = screenshot.bitmap;

    // Define positions to place the watermark

    const positions = [
      { x: 0, y: 0 },
      { x: 0, y: 600 },
    ];

    // Add watermark to the screenshot at each position
    positions.forEach((pos) => {
      screenshot.composite(watermark, pos.x, pos.y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.03,
      });
    });

    // Return the modified screenshot as a base64 string
    const modifiedScreenshot = await screenshot.getBase64("image/png");
    return modifiedScreenshot;
  } catch (error) {
    console.error("Error adding watermark:", error);
    throw error;
  }
}

// Evaluate the page to get bounding boxes of elements with an area of at least 100 square pixels
async function getBoundingBoxes(page) {
  let boundingBoxes = await page.evaluate(() => {
    const elements = document.querySelectorAll("a");
    const data = [];

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const width = rect.right - rect.x;
      const height = rect.bottom - rect.y;
      const area = width * height;

      if (area >= 10) {
        data.push({
          x: rect.left,
          y: rect.top,
          width: width,
          height: height,
          href: el.href,
          area,
          link_type: "",
        });
      }
    });

    return data;
  });

  boundingBoxes = boundingBoxes.sort((a, b) => b.area - a.area);

  boundingBoxes = boundingBoxes.map((box) => {
    // cleanup
    if (box.href.startsWith(ORIGIN_URL)) {
      box.href = box.href.replace(ORIGIN_URL, "");
      box.link_type = "internal";
    } else if (box.href.startsWith("/")) {
      box.link_type = "not_supported";
    } else {
      box.link_type = "external";
    }

    return box;
  });

  return boundingBoxes;
}

app.get("/api", async (req, res) => {
  const path = Buffer.from(req.query.path, "base64").toString("utf-8");
  if (pageCache.get(path)) {
    return res.json(pageCache.get(path));
  }

  console.log("visiting..: " + ORIGIN_URL + path);
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(ORIGIN_URL + path, { waitUntil: "networkidle2" });

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  const boundingBoxes = await getBoundingBoxes(page);
  const screen = await addWatermark(
    await page.screenshot({ fullPage: false, encoding: "base64" })
  );

  await page.close();

  const resp = {
    screen: screen,
    interactive_elements: boundingBoxes,
  };

  pageCache.set(path, resp, CACHE_TTL_SECONDS);

  res.json(resp);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Puppeteer Server started on port ${PORT}`);
});
