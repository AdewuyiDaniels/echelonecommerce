// src/components/Banner.tsx

import React from 'react';

type BannerProps = {
  imageUrl: string;
  alt: string;
};

const Banner: React.FC<BannerProps> = ({ imageUrl, alt }) => {
  return (
    <div className="w-full">
      <img src={imageUrl} alt={alt} className="w-full h-auto object-cover" />
    </div>
  );
};

export default Banner;
