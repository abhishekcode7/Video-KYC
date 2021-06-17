import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@material-ui/core";
import "./Screenshot.css";
const Screenshot = ({ snap, func }) => {
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
    func(base64Image);
  }
  return (
    <>
      {snap !== null && (
        <div>
          <div className="img-display">
            <ReactCrop
              src={snap}
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onImageLoaded={setImage}
            />
            <div className="options-2">
              <Button
                variant="outlined"
                color="primary"
                onClick={getCroppedImg}
              >
                Crop
              </Button>
              <Button variant="outlined" color="secondary" size="small" onClick={()=>func(null)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Screenshot;
