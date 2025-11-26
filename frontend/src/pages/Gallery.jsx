import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import GalleryGrid from '../components/GalleryGrid';

const Gallery = () => {
  // Sample gallery images - replace with actual images from your backend
  const galleryImages = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    'https://images.unsplash.com/photo-1583500178067-c8c22b0e0c4e?w=800',
  ];

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Gallery"
          subtitle="Take a look at our world-class facilities and vibrant community"
          center
        />
        <GalleryGrid images={galleryImages} />
      </div>
    </div>
  );
};

export default Gallery;

