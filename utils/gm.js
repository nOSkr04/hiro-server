import { encode } from "blurhash";
import sharp from "sharp";
import gm from "gm";

export const setBlurHash = async (file) => {
  if (!file) {
    return null;
  }

  const { data, info } = await sharp(file.buffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const blurHash = encode(data, info.width, info.height, 4, 3);
  return blurHash;
};

export const gmSize = async (file) => {
  const im = gm.subClass({ imageMagick: true });
  const buffer = file.buffer;
  return new Promise((resolve, reject) => {
    (typeof buffer === "string" ? im(buffer) : im(buffer)).size((err, size) => {
      if (err) return reject(err);

      const width = size.width;
      const height = size.height;

      resolve({
        width,
        height,
      });
    });
  });
};

export const gmResize = (buffer, size) => {
  return new Promise((resolve, reject) => {
    const im = gm.subClass({ imageMagick: true });

    (typeof buffer === "string" ? im(buffer) : im(buffer))
      .autoOrient()
      .resize(size)
      .noProfile()
      .toBuffer("JPG", (err, buffer) => {
        if (err) return reject(err);

        resolve(buffer);
      });
  });
};
export const createThumbnail = async (file) => {
  if (!file) {
    return null;
  }

  const { data, info } = await sharp(file)
    .raw()
    .resize({ fit: sharp.fit.center })
    .toFormat("png")
    .png({ quality: 100 })
    .toBuffer({ resolveWithObject: true });
  // const pixelArray = new Uint8ClampedArray(data);
  // console.log("pixelArray", pixelArray);
  // const { width, height, channels } = info;
  // const img = await sharp(pixelArray, {
  //   raw: { width, height, channels },
  // }).toFile("my-changed-image.jpg");
  // console.log("img", img);
  return data;
};
