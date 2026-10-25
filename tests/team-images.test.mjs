import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { teamImageManifest } from "../src/lib/team-image-manifest.ts";

test("every published optimized portrait and responsive variant is a valid WebP with matching dimensions", async () => {
  assert.ok(Object.keys(teamImageManifest).length > 0);
  for (const image of Object.values(teamImageManifest)) {
    const photo = await sharp(await readFile(new URL(`../public${image.src}`, import.meta.url))).metadata();
    assert.equal(photo.format, "webp");
    assert.equal(photo.width, image.width);
    assert.equal(photo.height, image.height);
    for (const candidate of image.srcSet.split(", ")) {
      const [src, descriptor] = candidate.split(" ");
      const variant = await sharp(await readFile(new URL(`../public${src}`, import.meta.url))).metadata();
      assert.equal(`${variant.width}w`, descriptor);
      assert.ok(variant.width <= 960);
    }
  }
});
