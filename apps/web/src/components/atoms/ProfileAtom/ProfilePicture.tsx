import React, { useState } from 'react';

interface ProfilePictureProps {
  defaultImage: string;
  className?: string;
}

const ProfilePicture = ({ defaultImage, className }: ProfilePictureProps) => {
  const [image, setImage] = useState<string>(defaultImage);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput')?.click();
  };

  return (
    <div className={className}>
      <img 
        src={image} 
        alt="Profile" 
        onClick={triggerFileInput} 
        style={{ width: '150px', height: '150px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} 
      />
      <input 
        id="fileInput" 
        type="file" 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageChange} 
      />
    </div>
  );
};

export default ProfilePicture;
