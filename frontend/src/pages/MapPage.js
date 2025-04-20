import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/MapPage.css";
import { Link } from "react-router-dom";

// Function to dynamically adjust popup offset
const getPopupOffset = (lat, lng) => {
    if (lng > 80) return [0, -10]; // Open below if in the right area
    if (lng < 70) return [0, 10];  // Open above if in the left area
    return [10, 0]; // Default offset
};

const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const indiaBounds = [
    [0.0000, 68.1097], // Southwest corner (Lakshadweep region)
    [100.0000, 97.3954], // Northeast corner (Arunachal Pradesh region)
  ];

const locations = [
    { name: "Srinagar, Leh", craft: "Pashmina Shawls", lat: 34.1526, lng: 77.5770, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743099655/Introducing_our_new_pashmina_collection_Our_new_bjnfbx.jpg" },
    { name: "Srinagar", craft: "Kashmiri Carpets", lat: 34.0837, lng: 74.7973, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100000/Discover_the_Unique_Types_of_Kashmiri_Carpets_for_Every_Interior_xrogg6.jpg" },
    { name: "Kullu Valley", craft: "Kullu Shawls", lat: 31.9566, lng: 77.1095, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100063/Kullu_Himachal_l0a7a9.jpg" },
    { name: "Chamba district", craft: "Chamba Rumal", lat: 32.5534, lng: 76.1258, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100165/83d6768b-b5d7-4402-9637-db041088dd71_mjutd2.jpg" },
    { name: "Patiala", craft: "Phulkari Embroidery", lat: 30.3398, lng: 76.3869, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100301/749cca58-0bb6-4bff-a195-d9aec0014c14_inc9vf.jpg" },
    { name: "Amritsar", craft: "Phulkari Embroidery", lat: 31.6340, lng: 74.8723, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100301/749cca58-0bb6-4bff-a195-d9aec0014c14_inc9vf.jpg" },
    { name: "Jaipur", craft: "Blue Pottery", lat: 26.9124, lng: 75.7873, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100510/From_Multan_Pak_._lgcgvh.jpg" },
    { name: "Jodhpur", craft: "Bandhani", lat: 26.2389, lng: 73.0243, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100729/Multi_Colour_Bandhani_Print_Georgette_Fabric_-Multi__44_inches_pnk7ez.jpg" },
    { name: "Udaipur", craft: "Bandhani", lat: 24.5854, lng: 73.7125, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100729/Multi_Colour_Bandhani_Print_Georgette_Fabric_-Multi__44_inches_pnk7ez.jpg" },
    { name: "Bhilwara", craft: "Phad Painting", lat: 25.3478, lng: 74.6408, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100790/Phad_Paintings_from_Rajasthan_bwiywy.jpg" },
    { name: "Lucknow", craft: "Chikankari", lat: 26.8467, lng: 80.9462, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100922/Chikankari-_Hand_Embroidery_from_India_fs1gyi.jpg" },
    { name: "Varanasi", craft: "Banarasi Silk Sarees", lat: 25.3176, lng: 82.9739, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101079/Banarasi_Handloom_Pure_Katan_Silk_Saree_jv3kib.jpg" },
    { name: "Patan", craft: "Patola Silk", lat: 23.8500, lng: 72.1334, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101161/Rajwadi_Patola_Saree_with_rich_Pallu_Exquisite_3D_Weaving_sarees_Ethnic_Indian_Saree_for_Women_in_the_USA_UK_Canada_and_Australia_Gift__wozguy.jpg" },
    { name: "Jamnagar", craft: "Bandhani", lat: 22.4707, lng: 70.0577, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743100729/Multi_Colour_Bandhani_Print_Georgette_Fabric_-Multi__44_inches_pnk7ez.jpg" },
    { name: "Ajrakhpur", craft: "Ajrakh Block Printing", lat: 23.1736, lng: 69.8839, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101254/Ajrakh_Pattern_Block_Print_Batik_Print_Stock_Illustration_2546460585___Shutterstock_fsbb71.jpg" },
    { name: "Dhamadka", craft: "Ajrakh Block Printing", lat: 23.2838, lng: 69.8856, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101254/Ajrakh_Pattern_Block_Print_Batik_Print_Stock_Illustration_2546460585___Shutterstock_fsbb71.jpg" },
    { name: "Paithan", craft: "Paithani Sarees", lat: 19.4764, lng: 75.3859, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101340/Pure_patola_Paithani_Silk_Sarees_Patola_Pochampally_Paithani_saree_zbp0jv.jpg" },
    { name: "Dahanu", craft: "Warli Painting", lat: 19.9939, lng: 72.7397, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101391/Warli_Art_Painting_Ideas_at_Nathanielwidea_xxy8zh.jpg" },
    { name: "Chanderi", craft: "Chanderi Sarees", lat: 24.7194, lng: 78.1363, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101443/Red_Chanderi_Silk_Saree_-_Handloom_Collection_qsy94d.jpg" },
    { name: "Maheshwar", craft: "Maheshwari Sarees", lat: 22.1765, lng: 75.5871, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101574/MAHESHWARI_COTTON_SILK_SAREE_CODEHPOO2992Humble_Pleats_offers_ALL_INDIA_FREE_SHIPPING_Accepts_online_payments_drntbv.jpg" },
    { name: "Bastar", craft: "Bastar Iron Craft", lat: 19.1071, lng: 82.0035, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101628/Bastar_Iron_Craft_bztl9j.jpg" },
    { name: "Kondagaon", craft: "Godna Art", lat: 19.5880, lng: 81.6636, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101713/Krishna_the_Gopis_k6iukm.jpg" },
    { name: "Bolpur", craft: "Kantha Stitch", lat: 23.6670, lng: 87.7012, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101792/Kantha_pth16y.jpg" },
    { name: "Bishnupur", craft: "Terracotta Craft", lat: 23.0738, lng: 87.3165, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101910/Terracotta_Sets___Terracotta_Jewellery_3_9_ydxzih.jpg" },
    { name: "Raghurajpur", craft: "Pattachitra", lat: 19.8976, lng: 85.5014, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743101957/https___deepsigne_etsy_t0adux.jpg" },
    { name: "Madhubani", craft: "Madhubani Painting", lat: 26.3472, lng: 86.0712, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102005/Madhubani_Sun_God_Painting_jntl1d.jpg" },
    { name: "Sualkuchi", craft: "Muga Silk Weaving", lat: 26.2352, lng: 91.5747, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102103/Hand_woven_authentic_Muga_Silk_Shawl___Dupatta_with_Muga_silk_and_Eri_Silk_motifs_from_Assam_India_afyqfa.jpg" },
    { name: "Ziro Valley", craft: "Apatani Weaving", lat: 27.5916, lng: 93.8197, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102326/93091340-579a-4084-a659-7885e476263d_kokq4s.jpg" },
    { name: "Tawang", craft: "Monpa Wooden Mask Making", lat: 27.5861, lng: 91.8650, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102448/Masks_and_Heads_-_Phillips_Antiques_t6myv5.jpg" },
    { name: "Imphal", craft: "Manipuri Dance Costumes", lat: 24.8170, lng: 93.9368, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102514/manipuridance_manipur_dance_epnmys.jpg" },
    { name: "Kohima", craft: "Naga Shawls", lat: 25.6747, lng: 94.1109, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102634/8c91e3bb-dc88-40ae-b30d-5d5fa89bd6c9_xl2di4.jpg" },
    { name: "Agartala", craft: "Risa and Rignai Weaving", lat: 23.8315, lng: 91.2868, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102645/RISHA_from_Tripura_-A_woven_project_-_Kamakhya_Ranjan_jreiil.jpg" },
    { name: "Gangtok", craft: "Thangka Paintings", lat: 27.3389, lng: 88.6065, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102743/Sikkim_a_Himalayan_jewel_is_celebrated_for_its_pjfvvz.jpg" },
    { name: "Thanjavur", craft: "Tanjore Paintings", lat: 10.7867, lng: 79.1378, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743102787/Tanjore_Painting_small_gifts_gifting_corporategifting_Ideas_srimudhraarts_chennai_apyvpe.jpg" },
    { name: "Aranmula", craft: "Aranmula Kannadi", lat: 9.3226, lng: 76.6972, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103839/ARANMULA_KANNADI_BUY_ONLINE_ormdqi.jpg" },
    { name: "Alleppey", craft: "Coir Products", lat: 9.4969, lng: 76.3314, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103084/Half_Moon_Braided_Coir_Doormat_vr9reg.jpg" },
    { name: "Bidar", craft: "Bidriware", lat: 17.9133, lng: 77.5301, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103195/Bidriware__Sought_around_the_world_trashed_in_Bidar_rwbza6.jpg" },
    { name: "Port Blair", craft: "Shell Craft", lat: 11.6234, lng: 92.7265, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103205/16379483-f410-40f2-af96-dc81ef01734b_gkgjud.jpg" },
    { name: "Pochampally", craft: "Pochampally sarees", lat: 17.3514, lng: 78.9182, image: "https://res.cloudinary.com/dvdvz4lko/image/upload/v1743019037/Pochampally_ikkath_sarees_y2bpdx.jpg"},
    { name: "Narayanpet", craft: "Narayanpet Sarees", lat: 16.7479, lng: 77.4959, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743019038/NARAYANPET_COTTON_SAREES_ctvkw4.jpg"},
    { name: "Pembarthi", craft: "Pembarthi Brassware", lat: 17.8332, lng: 79.5293, image: "https://res.cloudinary.com/dvdvz4lko/image/upload/v1743019037/Pembarthy_Brassware_xroqfw.jpg" },
    { name: "Nirmal", craft: "Nirmal Paintings", lat: 19.0965, lng: 78.3449, image: "https://res.cloudinary.com/dvdvz4lko/image/upload/v1743019037/Nirmal_Paintings_gygkcg.jpg"},
    { name: "Gadwal", craft: "Gadwal Sarees", lat: 16.2350, lng: 77.7956, image: "https://res.cloudinary.com/dvdvz4lko/image/upload/v1743019039/Gadwal_pattu_saress_rvihnf.jpg" },
    { name: "Siddipet", craft: "Gollabhama Sarees", lat: 18.1045, lng: 78.8520, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103300/a0ae6bf1-0d69-4a67-9bc9-d9bd793ad3dd_u3ngmc.jpg" },
    { name: "Venkatagiri", craft: "Venkatagiri Sarees", lat: 13.9609, lng: 79.5857, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103385/Moss_Green_Venkatagiri_Cotton_Silk_Saree_with_Resham_Buttas_and_Contrast_Blue_Zari_Border_hyz6rh.jpg" },
    { name: "Uppada", craft: "Uppada Jamdani Sarees", lat: 17.0733, lng: 82.3454, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103394/The_shot-colored_green_and_coffee-brown_Uppada_pxxrrn.jpg" },
    { name: "Dharmavaram", craft: "Dharmavaram Silk Sarees", lat: 14.4149, lng: 77.7138, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103478/Dharmavaram_silk_u40lje.jpg" },
    { name: "Mangalagiri", craft: "Mangalagiri Sarees", lat: 16.4296, lng: 80.5602, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103538/MANGALAGIRI_SILK_SAREE__CODE_y6nska.jpg" },
    { name: "Bobbili", craft: "Bobbili Veena", lat: 18.5730, lng: 83.3592, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103664/Bobbili_veena_rxiocm.jpg" },
    { name: "Kondapalli", craft: "Kondapalli Toys", lat: 16.6401, lng: 80.5180, image:"https://res.cloudinary.com/dvdvz4lko/image/upload/v1743103702/Toys_story_wyrpap.jpg" },
  ];
  
const ArtisanMarketMap = () => {
    const navigate = useNavigate(); // Hook to navigate to another page

    useEffect(() => {
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem("loggedIn");
      if (!isLoggedIn || isLoggedIn !== "true") {
          navigate("/"); // Redirect to login if not logged in
      }
    }, [navigate]);
    const handleLogout = () => {
        sessionStorage.removeItem("loggedIn"); // Clear session storage
        
        navigate("/"); // Redirect to login page
        
    };

    return (
        <div className="app">
            {/* Navbar */}
            <nav className="navbar">
                <h1>Hasthaveedhi</h1>
                <div className="nav-links">
                <Link to="/map">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">MyCart</Link>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
      {/* India Map with Zoom & Boundary Restrictions */}
      <MapContainer 
        center={[22.3511, 78.6677]} 
        zoom={5} 
        minZoom={4} 
        maxZoom={12} 
        scrollWheelZoom={true} 
        dragging={true} 
        maxBounds={indiaBounds} 
        maxBoundsViscosity={1.0} 
        className="map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lng]} icon={customIcon}>
            <Popup autoPan={true} autoPanPadding={[50, 50]} offset={getPopupOffset(loc.lat, loc.lng)}>
            <div style={{ width: "150px", maxWidth: "200px", height: "200px", overflow: "hidden", textAlign: "center"}}>
            <b>{loc.name}</b><br />
            <span>{loc.craft}</span><br />
            <Link to={`/shop?craft=${encodeURIComponent(loc.craft)}`}>
      <img 
        src={loc.image} 
        alt={`${loc.name} - ${loc.craft}`} 
        style={{ width: "100%", height: "150px", objectFit: "cover", marginTop: "5px", borderRadius: "6px", cursor: "pointer" }} 
      />
    </Link>
    <br />
    
  </div>
</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ArtisanMarketMap;