import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@material-ui/core";
import "./Screenshot.css";
import CropIcon from "@material-ui/icons/Crop";
import DeleteIcon from "@material-ui/icons/Delete";
const Screenshot = ({ snap, func, index, deleteSnap }) => {
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const [image, setImage] = useState(null);
  function getCroppedImg() {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    // console.log(snap);
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // As Base64 string
    const base64Image = canvas.toDataURL("image/jpeg");
    func(base64Image, index);
  }
  return (
    <>
      {snap !== [] && (
        <div>
          <div className="img-display" key={index}>
            <ReactCrop
              src={snap}
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onImageLoaded={setImage}
            />
            <div className="options-2" style={{ marginLeft: "10px" }}>
              <CropIcon
                className="hover-item"
                title="Crop image"
                onClick={getCroppedImg}
              />
              <DeleteIcon
                onClick={() => deleteSnap(index)}
                title="Delete image"
                className="hover-item"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Screenshot;
