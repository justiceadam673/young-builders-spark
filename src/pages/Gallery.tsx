import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import image1 from "@/assets/gallery/youth-outdoor-1.jpg";
import image2 from "@/assets/gallery/youth-outdoor-2.jpg";
import image3 from "@/assets/gallery/youth-outdoor-3.jpg";
import image4 from "@/assets/gallery/youth-indoor-1.jpg";
import image5 from "@/assets/gallery/speaker.jpg";
import image6 from "@/assets/gallery/mentoring.jpg";
import image7 from "@/assets/gallery/prayer.jpg";

const galleryImages = [
  { src: image1, alt: "Youth fellowship outdoor activity", title: "Community Gathering" },
  { src: image2, alt: "Young people celebrating together", title: "Unity & Joy" },
  { src: image3, alt: "Youth mentoring session", title: "Growing Together" },
  { src: image4, alt: "Indoor fellowship", title: "Fellowship Time" },
  { src: image5, alt: "Youth speaker sharing message", title: "Inspiring Messages" },
  { src: image6, alt: "One-on-one mentoring", title: "Personal Mentorship" },
  { src: image7, alt: "Youth in prayer", title: "Faith & Prayer" },
];

const Gallery = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground">
              Moments of growth, fellowship, and community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-gold transition-smooth animate-fade-in aspect-square"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end p-6">
                  <h3 className="text-white font-bold text-lg">{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
