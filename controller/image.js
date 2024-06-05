import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import Image from "../models/Image.js";
import fs from "fs";
import { url } from "inspector";
import imageSize from "image-size";
import { createThumbnail, setBlurHash } from "../utils/gm.js";

export const uploadClientPhoto = asyncHandler(async (req, res, next) => {
  const type = req.params.type; // banner | product | user
  const file = req.files.file;
  if (!file) {
    throw new MyError("Та зураг сонгоно уу.", 400);
  }
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }
  const size = await imageSize(file.data);
  console.log("size", size);
  const resize = await createThumbnail(file.data);
  console.log("resize", resize);

  const blurHash = await setBlurHash(file.data);
  console.log("blurHash", blurHash);
  file.name = `${uuidv4()}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/${type}/${file.name}`,
    async (err) => {
      if (err) {
        throw new MyError(
          "Файлыг хуулах явцад алдаа гарлаа. Алдаа : " + err.message,
          400
        );
      }
      const imageUrl = `${req.protocol}://${req.get("host")}/upload/${type}/${
        file.name
      }`;

      const newImage = await Image.create({
        name: file.name,
        type: type,
        user: req.userId,
        url: imageUrl,
        blurHash: blurHash,
        thumbnail: imageUrl,
      });

      res.status(200).json({
        success: true,
        data: file.name,
        url: imageUrl,
        image: newImage._id,
      });
    }
  );
});
