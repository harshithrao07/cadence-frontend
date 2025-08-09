import { Button } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";

export default function ProfilePictureSelector() {
  const [image, setImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = () => {
    setImage(null);
    fileInputRef.current.value = null; // clear file input
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewOpen]);

  return (
    <div className="relative flex flex-col text-center items-center space-y-4 p-6 border rounded-lg w-64 mx-auto">
      <div className="relative">
        {image ? (
          <div className="p-[2px] rounded-full border-2 border-transparent">
            <img
              src={image}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border cursor-pointer hover:scale-105 transition-transform duration-300 hover:brightness-75"
              onClick={() => setIsPreviewOpen(true)}
            />
          </div>
        ) : (
          <div
            onClick={handleButtonClick}
            className="cursor-pointer w-32 h-32 rounded-full border flex items-center justify-center text-gray-400 hover:bg-[#181818] transition-transform duration-300"
          >
            No Image
          </div>
        )}
      </div>

      {
        image &&
        <Button
          size="sm"
          variant="outlined"
          color="white"
          className="flex items-center gap-3"
          onClick={handleButtonClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>

          Change Picture
        </Button>
      }

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      {!image && (
        <p className="text-sm text-gray-500">
          No photo yet — add one whenever you like.
        </p>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full px-2 hover:bg-opacity-80 transition"
              aria-label="Close Preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={() => { handleDeleteImage(); setIsPreviewOpen(false); }}
              className="absolute top-2 left-2 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full px-2 hover:bg-opacity-80 transition"
              aria-label="Delete Profile Picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500">
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
              </svg>
            </button>

            <img
              src={image}
              alt="Full Preview"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition duration-300 ease-in-out"
            />
          </div>
        </div>
      )}
    </div>
  );
}
