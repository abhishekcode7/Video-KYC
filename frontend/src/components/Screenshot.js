import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@material-ui/core";
import "./Screenshot.css";
import CropIcon from "@material-ui/icons/Crop";
import DeleteIcon from "@material-ui/icons/Delete";
const Screenshot = ({ snap, func, index, deleteSnap, setName }) => {
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
          <div>
            <select
              className="form-select form-select-sm w-50"
              aria-label=".form-select-sm example"
              onChange={(e) => setName(index, e.target.value)}
            >
              <option selected>Select image type</option>
              <option value="User_Photo">User Photo</option>
              <option value="Aadhaar_Card_Front">Aadhaar Card Front</option>
              <option value="Aadhaar_Card_Back">Aadhaar Card Back</option>
              <option value="Pan_Card">Pan Card</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default Screenshot;
