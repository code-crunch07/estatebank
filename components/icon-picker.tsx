"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";
import { cn } from "@/lib/utils";

// Popular Lucide icons - Expanded with amenity-specific icons
const lucideIconList = [
  "Home", "Building2", "Key", "IndianRupee", "FileText", "Search", "MapPin",
  "Phone", "Mail", "Calendar", "Users", "User", "Settings", "Heart",
  "Star", "ShoppingCart", "CreditCard", "Shield", "Lock", "Unlock",
  "CheckCircle", "XCircle", "AlertCircle", "Info", "HelpCircle", "Camera",
  "Image", "Video", "Music", "File", "Folder", "Download", "Upload",
  "Share2", "Link", "ExternalLink", "ArrowRight", "ArrowLeft", "ChevronRight",
  "ChevronLeft", "Menu", "X", "Plus", "Minus", "Edit", "Trash2", "Save",
  "Copy", "Clipboard", "Printer", "Bell", "BellOff", "Bookmark", "Tag",
  "Filter", "Grid", "List", "Layout", "BarChart", "PieChart", "TrendingUp",
  "TrendingDown", "Activity", "Zap", "Sun", "Moon", "Cloud", "CloudRain",
  "Wind", "Droplet", "Flame", "TreePine", "Leaf", "Flower", "Bug",
  "Car", "Bike", "Plane", "Ship", "Train", "Bus", "Taxi", "Navigation",
  "Compass", "Map", "Globe", "Wifi", "Bluetooth", "Battery", "Power",
  "Volume2", "VolumeX", "Play", "Pause", "SkipForward", "SkipBack",
  "Repeat", "Shuffle", "Radio", "Tv", "Monitor", "Smartphone", "Tablet",
  "Laptop", "Mouse", "Keyboard", "Headphones", "Speaker", "Mic", "MicOff",
  // Amenity-specific icons
  "Dumbbell", "ParkingCircle", "Trees", "Sprout", "Waves",
  "Thermometer", "Snowflake", "Fan", "Droplets", "ShieldCheck",
  "Gamepad2", "Trophy", "UtensilsCrossed", "Coffee", "Wine", "Beer",
  "Bed", "Bath", "Shower", "DoorOpen", "Window", "Lamp", "Lightbulb",
  "Cable", "Router", "Satellite", "Briefcase", "Stethoscope", "Hospital",
  "Church", "Anchor", "Sailboat", "Helicopter", "Scooter", "Footprints",
  "Wheelchair", "Stairs", "ArrowUp", "ArrowDown", "Baby", "Dog", "Cat",
  "ParkingSquare", "CarFront", "Caravan", "PlaneLanding", "PlaneTakeoff",
];

// Popular React Icons from different libraries
const reactIconList = [
  // Font Awesome
  { name: "FaHome", library: "fa", component: FaIcons.FaHome },
  { name: "FaBuilding", library: "fa", component: FaIcons.FaBuilding },
  { name: "FaKey", library: "fa", component: FaIcons.FaKey },
  { name: "FaRupeeSign", library: "fa", component: FaIcons.FaRupeeSign },
  { name: "FaFile", library: "fa", component: FaIcons.FaFile },
  { name: "FaSearch", library: "fa", component: FaIcons.FaSearch },
  { name: "FaMapMarkerAlt", library: "fa", component: FaIcons.FaMapMarkerAlt },
  { name: "FaPhone", library: "fa", component: FaIcons.FaPhone },
  { name: "FaEnvelope", library: "fa", component: FaIcons.FaEnvelope },
  { name: "FaCalendar", library: "fa", component: FaIcons.FaCalendar },
  { name: "FaUsers", library: "fa", component: FaIcons.FaUsers },
  { name: "FaUser", library: "fa", component: FaIcons.FaUser },
  { name: "FaCog", library: "fa", component: FaIcons.FaCog },
  { name: "FaHeart", library: "fa", component: FaIcons.FaHeart },
  { name: "FaStar", library: "fa", component: FaIcons.FaStar },
  { name: "FaShoppingCart", library: "fa", component: FaIcons.FaShoppingCart },
  { name: "FaCreditCard", library: "fa", component: FaIcons.FaCreditCard },
  { name: "FaShieldAlt", library: "fa", component: FaIcons.FaShieldAlt },
  { name: "FaLock", library: "fa", component: FaIcons.FaLock },
  { name: "FaCheckCircle", library: "fa", component: FaIcons.FaCheckCircle },
  { name: "FaTimesCircle", library: "fa", component: FaIcons.FaTimesCircle },
  { name: "FaInfoCircle", library: "fa", component: FaIcons.FaInfoCircle },
  { name: "FaCamera", library: "fa", component: FaIcons.FaCamera },
  { name: "FaImage", library: "fa", component: FaIcons.FaImage },
  { name: "FaVideo", library: "fa", component: FaIcons.FaVideo },
  { name: "FaFileDownload", library: "fa", component: FaIcons.FaFileDownload },
  { name: "FaFileUpload", library: "fa", component: FaIcons.FaFileUpload },
  { name: "FaShare", library: "fa", component: FaIcons.FaShare },
  { name: "FaLink", library: "fa", component: FaIcons.FaLink },
  { name: "FaExternalLinkAlt", library: "fa", component: FaIcons.FaExternalLinkAlt },
  { name: "FaArrowRight", library: "fa", component: FaIcons.FaArrowRight },
  { name: "FaArrowLeft", library: "fa", component: FaIcons.FaArrowLeft },
  { name: "FaChevronRight", library: "fa", component: FaIcons.FaChevronRight },
  { name: "FaChevronLeft", library: "fa", component: FaIcons.FaChevronLeft },
  { name: "FaBars", library: "fa", component: FaIcons.FaBars },
  { name: "FaTimes", library: "fa", component: FaIcons.FaTimes },
  { name: "FaPlus", library: "fa", component: FaIcons.FaPlus },
  { name: "FaMinus", library: "fa", component: FaIcons.FaMinus },
  { name: "FaEdit", library: "fa", component: FaIcons.FaEdit },
  { name: "FaTrash", library: "fa", component: FaIcons.FaTrash },
  { name: "FaSave", library: "fa", component: FaIcons.FaSave },
  { name: "FaCopy", library: "fa", component: FaIcons.FaCopy },
  { name: "FaPrint", library: "fa", component: FaIcons.FaPrint },
  { name: "FaBell", library: "fa", component: FaIcons.FaBell },
  { name: "FaBookmark", library: "fa", component: FaIcons.FaBookmark },
  { name: "FaTag", library: "fa", component: FaIcons.FaTag },
  { name: "FaFilter", library: "fa", component: FaIcons.FaFilter },
  { name: "FaTh", library: "fa", component: FaIcons.FaTh },
  { name: "FaList", library: "fa", component: FaIcons.FaList },
  { name: "FaChartBar", library: "fa", component: FaIcons.FaChartBar },
  { name: "FaChartPie", library: "fa", component: FaIcons.FaChartPie },
  { name: "FaChartLine", library: "fa", component: FaIcons.FaChartLine },
  { name: "FaBolt", library: "fa", component: FaIcons.FaBolt },
  { name: "FaSun", library: "fa", component: FaIcons.FaSun },
  { name: "FaMoon", library: "fa", component: FaIcons.FaMoon },
  { name: "FaCloud", library: "fa", component: FaIcons.FaCloud },
  { name: "FaCar", library: "fa", component: FaIcons.FaCar },
  { name: "FaBicycle", library: "fa", component: FaIcons.FaBicycle },
  { name: "FaPlane", library: "fa", component: FaIcons.FaPlane },
  { name: "FaShip", library: "fa", component: FaIcons.FaShip },
  { name: "FaTrain", library: "fa", component: FaIcons.FaTrain },
  { name: "FaBus", library: "fa", component: FaIcons.FaBus },
  { name: "FaTaxi", library: "fa", component: FaIcons.FaTaxi },
  { name: "FaCompass", library: "fa", component: FaIcons.FaCompass },
  { name: "FaMap", library: "fa", component: FaIcons.FaMap },
  { name: "FaGlobe", library: "fa", component: FaIcons.FaGlobe },
  { name: "FaWifi", library: "fa", component: FaIcons.FaWifi },
  { name: "FaBluetooth", library: "fa", component: FaIcons.FaBluetooth },
  { name: "FaBatteryFull", library: "fa", component: FaIcons.FaBatteryFull },
  { name: "FaPowerOff", library: "fa", component: FaIcons.FaPowerOff },
  { name: "FaVolumeUp", library: "fa", component: FaIcons.FaVolumeUp },
  { name: "FaVolumeMute", library: "fa", component: FaIcons.FaVolumeMute },
  { name: "FaPlay", library: "fa", component: FaIcons.FaPlay },
  { name: "FaPause", library: "fa", component: FaIcons.FaPause },
  { name: "FaForward", library: "fa", component: FaIcons.FaForward },
  { name: "FaBackward", library: "fa", component: FaIcons.FaBackward },
  { name: "FaRedo", library: "fa", component: FaIcons.FaRedo },
  { name: "FaRandom", library: "fa", component: FaIcons.FaRandom },
  { name: "FaTv", library: "fa", component: FaIcons.FaTv },
  { name: "FaDesktop", library: "fa", component: FaIcons.FaDesktop },
  { name: "FaMobile", library: "fa", component: FaIcons.FaMobile },
  { name: "FaTablet", library: "fa", component: FaIcons.FaTablet },
  { name: "FaLaptop", library: "fa", component: FaIcons.FaLaptop },
  { name: "FaMouse", library: "fa", component: FaIcons.FaMouse },
  { name: "FaKeyboard", library: "fa", component: FaIcons.FaKeyboard },
  { name: "FaHeadphones", library: "fa", component: FaIcons.FaHeadphones },
  { name: "FaMicrophone", library: "fa", component: FaIcons.FaMicrophone },
  { name: "FaMicrophoneSlash", library: "fa", component: FaIcons.FaMicrophoneSlash },
  // Font Awesome - Amenity-specific icons (only verified existing icons)
  { name: "FaDumbbell", library: "fa", component: FaIcons.FaDumbbell },
  { name: "FaParking", library: "fa", component: FaIcons.FaParking },
  { name: "FaTree", library: "fa", component: FaIcons.FaTree },
  { name: "FaUmbrella", library: "fa", component: FaIcons.FaUmbrella },
  { name: "FaWater", library: "fa", component: FaIcons.FaWater },
  { name: "FaThermometerHalf", library: "fa", component: FaIcons.FaThermometerHalf },
  { name: "FaSnowflake", library: "fa", component: FaIcons.FaSnowflake },
  { name: "FaFire", library: "fa", component: FaIcons.FaFire },
  { name: "FaFireExtinguisher", library: "fa", component: FaIcons.FaFireExtinguisher },
  { name: "FaGamepad", library: "fa", component: FaIcons.FaGamepad },
  { name: "FaTrophy", library: "fa", component: FaIcons.FaTrophy },
  { name: "FaBaby", library: "fa", component: FaIcons.FaBaby },
  { name: "FaDog", library: "fa", component: FaIcons.FaDog },
  { name: "FaCat", library: "fa", component: FaIcons.FaCat },
  { name: "FaUtensils", library: "fa", component: FaIcons.FaUtensils },
  { name: "FaCoffee", library: "fa", component: FaIcons.FaCoffee },
  { name: "FaWineGlass", library: "fa", component: FaIcons.FaWineGlass },
  { name: "FaBeer", library: "fa", component: FaIcons.FaBeer },
  { name: "FaBed", library: "fa", component: FaIcons.FaBed },
  { name: "FaBath", library: "fa", component: FaIcons.FaBath },
  { name: "FaShower", library: "fa", component: FaIcons.FaShower },
  { name: "FaLandmark", library: "fa", component: FaIcons.FaLandmark },
  { name: "FaBuilding", library: "fa", component: FaIcons.FaBuilding },
  { name: "FaWarehouse", library: "fa", component: FaIcons.FaWarehouse },
  { name: "FaIndustry", library: "fa", component: FaIcons.FaIndustry },
  { name: "FaStore", library: "fa", component: FaIcons.FaStore },
  { name: "FaSchool", library: "fa", component: FaIcons.FaSchool },
  { name: "FaGraduationCap", library: "fa", component: FaIcons.FaGraduationCap },
  { name: "FaBriefcase", library: "fa", component: FaIcons.FaBriefcase },
  { name: "FaHospital", library: "fa", component: FaIcons.FaHospital },
  { name: "FaChurch", library: "fa", component: FaIcons.FaChurch },
  { name: "FaMosque", library: "fa", component: FaIcons.FaMosque },
  { name: "FaCarSide", library: "fa", component: FaIcons.FaCarSide },
  { name: "FaCaravan", library: "fa", component: FaIcons.FaCaravan },
  { name: "FaAnchor", library: "fa", component: FaIcons.FaAnchor },
  { name: "FaShip", library: "fa", component: FaIcons.FaShip },
  { name: "FaHelicopter", library: "fa", component: FaIcons.FaHelicopter },
  { name: "FaBicycle", library: "fa", component: FaIcons.FaBicycle },
  { name: "FaWheelchair", library: "fa", component: FaIcons.FaWheelchair },
  { name: "FaArrowUp", library: "fa", component: FaIcons.FaArrowUp },
  { name: "FaArrowDown", library: "fa", component: FaIcons.FaArrowDown },
  { name: "FaConciergeBell", library: "fa", component: FaIcons.FaConciergeBell },
  { name: "FaBook", library: "fa", component: FaIcons.FaBook },
  { name: "FaChild", library: "fa", component: FaIcons.FaChild },
  { name: "FaPaw", library: "fa", component: FaIcons.FaPaw },
  { name: "FaCocktail", library: "fa", component: FaIcons.FaCocktail },
  // Font Awesome - Real Estate Amenities
  { name: "FaSwimmingPool", library: "fa", component: FaIcons.FaSwimmingPool },
  { name: "FaDumbbell", library: "fa", component: FaIcons.FaDumbbell },
  { name: "FaParking", library: "fa", component: FaIcons.FaParking },
  { name: "FaTree", library: "fa", component: FaIcons.FaTree },
  { name: "FaShieldAlt", library: "fa", component: FaIcons.FaShieldAlt },
  { name: "FaVideo", library: "fa", component: FaIcons.FaVideo },
  { name: "FaCamera", library: "fa", component: FaIcons.FaCamera },
  { name: "FaWifi", library: "fa", component: FaIcons.FaWifi },
  { name: "FaBolt", library: "fa", component: FaIcons.FaBolt },
  { name: "FaBatteryFull", library: "fa", component: FaIcons.FaBatteryFull },
  { name: "FaArrowUp", library: "fa", component: FaIcons.FaArrowUp },
  { name: "FaArrowDown", library: "fa", component: FaIcons.FaArrowDown },
  { name: "FaRunning", library: "fa", component: FaIcons.FaRunning },
  { name: "FaBasketballBall", library: "fa", component: FaIcons.FaBasketballBall },
  { name: "FaFootballBall", library: "fa", component: FaIcons.FaFootballBall },
  { name: "FaTableTennis", library: "fa", component: FaIcons.FaTableTennis },
  { name: "FaVolleyballBall", library: "fa", component: FaIcons.FaVolleyballBall },
  { name: "FaBaseballBall", library: "fa", component: FaIcons.FaBaseballBall },
  { name: "FaGolfBall", library: "fa", component: FaIcons.FaGolfBall },
  { name: "FaSwimmer", library: "fa", component: FaIcons.FaSwimmer },
  { name: "FaHiking", library: "fa", component: FaIcons.FaHiking },
  { name: "FaMountain", library: "fa", component: FaIcons.FaMountain },
  { name: "FaUmbrellaBeach", library: "fa", component: FaIcons.FaUmbrellaBeach },
  { name: "FaHotTub", library: "fa", component: FaIcons.FaHotTub },
  { name: "FaSpa", library: "fa", component: FaIcons.FaSpa },
  { name: "FaChild", library: "fa", component: FaIcons.FaChild },
  { name: "FaHorse", library: "fa", component: FaIcons.FaHorse },
  { name: "FaDog", library: "fa", component: FaIcons.FaDog },
  { name: "FaCat", library: "fa", component: FaIcons.FaCat },
  { name: "FaPaw", library: "fa", component: FaIcons.FaPaw },
  { name: "FaUtensils", library: "fa", component: FaIcons.FaUtensils },
  { name: "FaHamburger", library: "fa", component: FaIcons.FaHamburger },
  { name: "FaPizzaSlice", library: "fa", component: FaIcons.FaPizzaSlice },
  { name: "FaIceCream", library: "fa", component: FaIcons.FaIceCream },
  { name: "FaCookie", library: "fa", component: FaIcons.FaCookie },
  { name: "FaBirthdayCake", library: "fa", component: FaIcons.FaBirthdayCake },
  { name: "FaConciergeBell", library: "fa", component: FaIcons.FaConciergeBell },
  { name: "FaBell", library: "fa", component: FaIcons.FaBell },
  { name: "FaDoorOpen", library: "fa", component: FaIcons.FaDoorOpen },
  { name: "FaLock", library: "fa", component: FaIcons.FaLock },
  { name: "FaKey", library: "fa", component: FaIcons.FaKey },
  { name: "FaIdCard", library: "fa", component: FaIcons.FaIdCard },
  { name: "FaShieldAlt", library: "fa", component: FaIcons.FaShieldAlt },
  { name: "FaEye", library: "fa", component: FaIcons.FaEye },
  { name: "FaEyeSlash", library: "fa", component: FaIcons.FaEyeSlash },
  { name: "FaSearch", library: "fa", component: FaIcons.FaSearch },
  { name: "FaSearchLocation", library: "fa", component: FaIcons.FaSearchLocation },
  { name: "FaSearchDollar", library: "fa", component: FaIcons.FaSearchDollar },
  { name: "FaSearchPlus", library: "fa", component: FaIcons.FaSearchPlus },
  { name: "FaSearchMinus", library: "fa", component: FaIcons.FaSearchMinus },
  { name: "FaMapMarkerAlt", library: "fa", component: FaIcons.FaMapMarkerAlt },
  { name: "FaMapMarkedAlt", library: "fa", component: FaIcons.FaMapMarkedAlt },
  { name: "FaMapPin", library: "fa", component: FaIcons.FaMapPin },
  { name: "FaLocationArrow", library: "fa", component: FaIcons.FaLocationArrow },
  { name: "FaCompass", library: "fa", component: FaIcons.FaCompass },
  { name: "FaRoute", library: "fa", component: FaIcons.FaRoute },
  { name: "FaDirections", library: "fa", component: FaIcons.FaDirections },
  { name: "FaWalking", library: "fa", component: FaIcons.FaWalking },
  { name: "FaRunning", library: "fa", component: FaIcons.FaRunning },
  { name: "FaBicycle", library: "fa", component: FaIcons.FaBicycle },
  { name: "FaMotorcycle", library: "fa", component: FaIcons.FaMotorcycle },
  { name: "FaCar", library: "fa", component: FaIcons.FaCar },
  { name: "FaCarSide", library: "fa", component: FaIcons.FaCarSide },
  { name: "FaCarAlt", library: "fa", component: FaIcons.FaCarAlt },
  { name: "FaParking", library: "fa", component: FaIcons.FaParking },
  { name: "FaWarehouse", library: "fa", component: FaIcons.FaWarehouse },
  { name: "FaBuilding", library: "fa", component: FaIcons.FaBuilding },
  { name: "FaCity", library: "fa", component: FaIcons.FaCity },
  { name: "FaHome", library: "fa", component: FaIcons.FaHome },
  { name: "FaHouseDamage", library: "fa", component: FaIcons.FaHouseDamage },
  { name: "FaHouseUser", library: "fa", component: FaIcons.FaHouseUser },
  // Material Design
  { name: "MdHome", library: "md", component: MdIcons.MdHome },
  { name: "MdBusiness", library: "md", component: MdIcons.MdBusiness },
  { name: "MdVpnKey", library: "md", component: MdIcons.MdVpnKey },
  { name: "MdAttachMoney", library: "md", component: MdIcons.MdAttachMoney },
  { name: "MdDescription", library: "md", component: MdIcons.MdDescription },
  { name: "MdSearch", library: "md", component: MdIcons.MdSearch },
  { name: "MdLocationOn", library: "md", component: MdIcons.MdLocationOn },
  { name: "MdPhone", library: "md", component: MdIcons.MdPhone },
  { name: "MdEmail", library: "md", component: MdIcons.MdEmail },
  { name: "MdCalendarToday", library: "md", component: MdIcons.MdCalendarToday },
  { name: "MdPeople", library: "md", component: MdIcons.MdPeople },
  { name: "MdPerson", library: "md", component: MdIcons.MdPerson },
  { name: "MdSettings", library: "md", component: MdIcons.MdSettings },
  { name: "MdFavorite", library: "md", component: MdIcons.MdFavorite },
  { name: "MdStar", library: "md", component: MdIcons.MdStar },
  { name: "MdShoppingCart", library: "md", component: MdIcons.MdShoppingCart },
  { name: "MdCreditCard", library: "md", component: MdIcons.MdCreditCard },
  { name: "MdSecurity", library: "md", component: MdIcons.MdSecurity },
  { name: "MdLock", library: "md", component: MdIcons.MdLock },
  { name: "MdCheckCircle", library: "md", component: MdIcons.MdCheckCircle },
  { name: "MdCancel", library: "md", component: MdIcons.MdCancel },
  { name: "MdInfo", library: "md", component: MdIcons.MdInfo },
  { name: "MdCamera", library: "md", component: MdIcons.MdCamera },
  { name: "MdImage", library: "md", component: MdIcons.MdImage },
  { name: "MdVideoLibrary", library: "md", component: MdIcons.MdVideoLibrary },
  { name: "MdFileDownload", library: "md", component: MdIcons.MdFileDownload },
  { name: "MdFileUpload", library: "md", component: MdIcons.MdFileUpload },
  { name: "MdShare", library: "md", component: MdIcons.MdShare },
  { name: "MdLink", library: "md", component: MdIcons.MdLink },
  { name: "MdOpenInNew", library: "md", component: MdIcons.MdOpenInNew },
  { name: "MdArrowForward", library: "md", component: MdIcons.MdArrowForward },
  { name: "MdArrowBack", library: "md", component: MdIcons.MdArrowBack },
  { name: "MdChevronRight", library: "md", component: MdIcons.MdChevronRight },
  { name: "MdChevronLeft", library: "md", component: MdIcons.MdChevronLeft },
  { name: "MdMenu", library: "md", component: MdIcons.MdMenu },
  { name: "MdClose", library: "md", component: MdIcons.MdClose },
  { name: "MdAdd", library: "md", component: MdIcons.MdAdd },
  { name: "MdRemove", library: "md", component: MdIcons.MdRemove },
  { name: "MdEdit", library: "md", component: MdIcons.MdEdit },
  { name: "MdDelete", library: "md", component: MdIcons.MdDelete },
  { name: "MdSave", library: "md", component: MdIcons.MdSave },
  { name: "MdContentCopy", library: "md", component: MdIcons.MdContentCopy },
  { name: "MdPrint", library: "md", component: MdIcons.MdPrint },
  { name: "MdNotifications", library: "md", component: MdIcons.MdNotifications },
  { name: "MdBookmark", library: "md", component: MdIcons.MdBookmark },
  { name: "MdLabel", library: "md", component: MdIcons.MdLabel },
  { name: "MdFilterList", library: "md", component: MdIcons.MdFilterList },
  { name: "MdViewModule", library: "md", component: MdIcons.MdViewModule },
  { name: "MdViewList", library: "md", component: MdIcons.MdViewList },
  { name: "MdBarChart", library: "md", component: MdIcons.MdBarChart },
  { name: "MdPieChart", library: "md", component: MdIcons.MdPieChart },
  { name: "MdTrendingUp", library: "md", component: MdIcons.MdTrendingUp },
  { name: "MdTrendingDown", library: "md", component: MdIcons.MdTrendingDown },
  { name: "MdShowChart", library: "md", component: MdIcons.MdShowChart },
  { name: "MdFlashOn", library: "md", component: MdIcons.MdFlashOn },
  { name: "MdWbSunny", library: "md", component: MdIcons.MdWbSunny },
  { name: "MdDarkMode", library: "md", component: MdIcons.MdDarkMode },
  { name: "MdCloud", library: "md", component: MdIcons.MdCloud },
  { name: "MdDirectionsCar", library: "md", component: MdIcons.MdDirectionsCar },
  { name: "MdDirectionsBike", library: "md", component: MdIcons.MdDirectionsBike },
  { name: "MdFlight", library: "md", component: MdIcons.MdFlight },
  { name: "MdDirectionsBoat", library: "md", component: MdIcons.MdDirectionsBoat },
  { name: "MdTrain", library: "md", component: MdIcons.MdTrain },
  { name: "MdDirectionsBus", library: "md", component: MdIcons.MdDirectionsBus },
  { name: "MdLocalTaxi", library: "md", component: MdIcons.MdLocalTaxi },
  { name: "MdExplore", library: "md", component: MdIcons.MdExplore },
  { name: "MdMap", library: "md", component: MdIcons.MdMap },
  { name: "MdPublic", library: "md", component: MdIcons.MdPublic },
  { name: "MdWifi", library: "md", component: MdIcons.MdWifi },
  { name: "MdBluetooth", library: "md", component: MdIcons.MdBluetooth },
  { name: "MdBatteryFull", library: "md", component: MdIcons.MdBatteryFull },
  { name: "MdPowerSettingsNew", library: "md", component: MdIcons.MdPowerSettingsNew },
  { name: "MdVolumeUp", library: "md", component: MdIcons.MdVolumeUp },
  { name: "MdVolumeOff", library: "md", component: MdIcons.MdVolumeOff },
  { name: "MdPlayArrow", library: "md", component: MdIcons.MdPlayArrow },
  { name: "MdPause", library: "md", component: MdIcons.MdPause },
  { name: "MdSkipNext", library: "md", component: MdIcons.MdSkipNext },
  { name: "MdSkipPrevious", library: "md", component: MdIcons.MdSkipPrevious },
  { name: "MdRepeat", library: "md", component: MdIcons.MdRepeat },
  { name: "MdShuffle", library: "md", component: MdIcons.MdShuffle },
  { name: "MdRadio", library: "md", component: MdIcons.MdRadio },
  { name: "MdTv", library: "md", component: MdIcons.MdTv },
  { name: "MdComputer", library: "md", component: MdIcons.MdComputer },
  { name: "MdPhoneIphone", library: "md", component: MdIcons.MdPhoneIphone },
  { name: "MdTablet", library: "md", component: MdIcons.MdTablet },
  { name: "MdLaptop", library: "md", component: MdIcons.MdLaptop },
  { name: "MdMouse", library: "md", component: MdIcons.MdMouse },
  { name: "MdKeyboard", library: "md", component: MdIcons.MdKeyboard },
  { name: "MdHeadphones", library: "md", component: MdIcons.MdHeadphones },
  { name: "MdSpeaker", library: "md", component: MdIcons.MdSpeaker },
  { name: "MdMic", library: "md", component: MdIcons.MdMic },
  { name: "MdMicOff", library: "md", component: MdIcons.MdMicOff },
  // Material Design - Amenity-specific icons
  { name: "MdPool", library: "md", component: MdIcons.MdPool },
  { name: "MdFitnessCenter", library: "md", component: MdIcons.MdFitnessCenter },
  { name: "MdLocalParking", library: "md", component: MdIcons.MdLocalParking },
  { name: "MdElevator", library: "md", component: MdIcons.MdElevator },
  { name: "MdPark", library: "md", component: MdIcons.MdPark },
  { name: "MdNature", library: "md", component: MdIcons.MdNature },
  { name: "MdBeachAccess", library: "md", component: MdIcons.MdBeachAccess },
  { name: "MdWaterDrop", library: "md", component: MdIcons.MdWaterDrop },
  { name: "MdAcUnit", library: "md", component: MdIcons.MdAcUnit },
  { name: "MdWhatshot", library: "md", component: MdIcons.MdWhatshot },
  { name: "MdSecurity", library: "md", component: MdIcons.MdSecurity },
  { name: "MdVideogameAsset", library: "md", component: MdIcons.MdVideogameAsset },
  { name: "MdEmojiEvents", library: "md", component: MdIcons.MdEmojiEvents },
  { name: "MdChildCare", library: "md", component: MdIcons.MdChildCare },
  { name: "MdPets", library: "md", component: MdIcons.MdPets },
  { name: "MdRestaurant", library: "md", component: MdIcons.MdRestaurant },
  { name: "MdLocalCafe", library: "md", component: MdIcons.MdLocalCafe },
  { name: "MdLocalBar", library: "md", component: MdIcons.MdLocalBar },
  { name: "MdHotel", library: "md", component: MdIcons.MdHotel },
  { name: "MdBathtub", library: "md", component: MdIcons.MdBathtub },
  { name: "MdShower", library: "md", component: MdIcons.MdShower },
  { name: "MdBusiness", library: "md", component: MdIcons.MdBusiness },
  { name: "MdStore", library: "md", component: MdIcons.MdStore },
  { name: "MdSchool", library: "md", component: MdIcons.MdSchool },
  { name: "MdWork", library: "md", component: MdIcons.MdWork },
  { name: "MdLocalHospital", library: "md", component: MdIcons.MdLocalHospital },
  { name: "MdDirectionsCar", library: "md", component: MdIcons.MdDirectionsCar },
  { name: "MdDirectionsBike", library: "md", component: MdIcons.MdDirectionsBike },
  { name: "MdAccessibility", library: "md", component: MdIcons.MdAccessibility },
  { name: "MdAccessibilityNew", library: "md", component: MdIcons.MdAccessibilityNew },
  { name: "MdStairs", library: "md", component: MdIcons.MdStairs },
  { name: "MdArrowUpward", library: "md", component: MdIcons.MdArrowUpward },
  { name: "MdArrowDownward", library: "md", component: MdIcons.MdArrowDownward },
  { name: "MdRoomService", library: "md", component: MdIcons.MdRoomService },
  { name: "MdHotTub", library: "md", component: MdIcons.MdHotTub },
  { name: "MdSpa", library: "md", component: MdIcons.MdSpa },
  { name: "MdSportsTennis", library: "md", component: MdIcons.MdSportsTennis },
  { name: "MdSportsBasketball", library: "md", component: MdIcons.MdSportsBasketball },
  { name: "MdSportsSoccer", library: "md", component: MdIcons.MdSportsSoccer },
  { name: "MdMenuBook", library: "md", component: MdIcons.MdMenuBook },
  { name: "MdLocalLibrary", library: "md", component: MdIcons.MdLocalLibrary },
  { name: "MdBusinessCenter", library: "md", component: MdIcons.MdBusinessCenter },
  { name: "MdChildFriendly", library: "md", component: MdIcons.MdChildFriendly },
  { name: "MdBabyChangingStation", library: "md", component: MdIcons.MdBabyChangingStation },
  { name: "MdRestaurantMenu", library: "md", component: MdIcons.MdRestaurantMenu },
  { name: "MdLocalPizza", library: "md", component: MdIcons.MdLocalPizza },
  { name: "MdWeekend", library: "md", component: MdIcons.MdWeekend },
  { name: "MdChair", library: "md", component: MdIcons.MdChair },
  { name: "MdDoorFront", library: "md", component: MdIcons.MdDoorFront },
  { name: "MdWindow", library: "md", component: MdIcons.MdWindow },
  { name: "MdLightbulb", library: "md", component: MdIcons.MdLightbulb },
  { name: "MdPower", library: "md", component: MdIcons.MdPower },
  { name: "MdSatellite", library: "md", component: MdIcons.MdSatellite },
  { name: "MdSatelliteAlt", library: "md", component: MdIcons.MdSatelliteAlt },
  { name: "MdBalcony", library: "md", component: MdIcons.MdBalcony },
  { name: "MdDeck", library: "md", component: MdIcons.MdDeck },
  { name: "MdGrass", library: "md", component: MdIcons.MdGrass },
  { name: "MdFireplace", library: "md", component: MdIcons.MdFireplace },
  { name: "MdKitchen", library: "md", component: MdIcons.MdKitchen },
  { name: "MdDining", library: "md", component: MdIcons.MdDining },
  { name: "MdLiving", library: "md", component: MdIcons.MdLiving },
  { name: "MdBedroomParent", library: "md", component: MdIcons.MdBedroomParent },
  { name: "MdBedroomBaby", library: "md", component: MdIcons.MdBedroomBaby },
  { name: "MdBedroomChild", library: "md", component: MdIcons.MdBedroomChild },
  { name: "MdGarage", library: "md", component: MdIcons.MdGarage },
  { name: "MdWarehouse", library: "md", component: MdIcons.MdWarehouse },
  { name: "MdFoundation", library: "md", component: MdIcons.MdFoundation },
  { name: "MdRoofing", library: "md", component: MdIcons.MdRoofing },
  { name: "MdFence", library: "md", component: MdIcons.MdFence },
  { name: "MdYard", library: "md", component: MdIcons.MdYard },
  { name: "MdWaves", library: "md", component: MdIcons.MdWaves },
  { name: "MdSelfImprovement", library: "md", component: MdIcons.MdSelfImprovement },
  { name: "MdSportsVolleyball", library: "md", component: MdIcons.MdSportsVolleyball },
  { name: "MdSportsBaseball", library: "md", component: MdIcons.MdSportsBaseball },
  { name: "MdSportsGolf", library: "md", component: MdIcons.MdSportsGolf },
  { name: "MdSportsCricket", library: "md", component: MdIcons.MdSportsCricket },
  { name: "MdSportsHandball", library: "md", component: MdIcons.MdSportsHandball },
  { name: "MdSportsKabaddi", library: "md", component: MdIcons.MdSportsKabaddi },
  { name: "MdSportsMartialArts", library: "md", component: MdIcons.MdSportsMartialArts },
  { name: "MdSportsMotorsports", library: "md", component: MdIcons.MdSportsMotorsports },
  { name: "MdSportsRugby", library: "md", component: MdIcons.MdSportsRugby },
  { name: "MdSportsEsports", library: "md", component: MdIcons.MdSportsEsports },
  { name: "MdSportsHockey", library: "md", component: MdIcons.MdSportsHockey },
  { name: "MdSportsMma", library: "md", component: MdIcons.MdSportsMma },
  { name: "MdSelfImprovement", library: "md", component: MdIcons.MdSelfImprovement },
  { name: "MdFitnessCenter", library: "md", component: MdIcons.MdFitnessCenter },
  { name: "MdDirectionsRun", library: "md", component: MdIcons.MdDirectionsRun },
  { name: "MdDirectionsWalk", library: "md", component: MdIcons.MdDirectionsWalk },
  { name: "MdDirectionsBike", library: "md", component: MdIcons.MdDirectionsBike },
  { name: "MdPool", library: "md", component: MdIcons.MdPool },
  { name: "MdHotTub", library: "md", component: MdIcons.MdHotTub },
  { name: "MdSpa", library: "md", component: MdIcons.MdSpa },
  { name: "MdLocalParking", library: "md", component: MdIcons.MdLocalParking },
  { name: "MdElevator", library: "md", component: MdIcons.MdElevator },
  { name: "MdSecurity", library: "md", component: MdIcons.MdSecurity },
  { name: "MdVideocam", library: "md", component: MdIcons.MdVideocam },
  { name: "MdVideocamOff", library: "md", component: MdIcons.MdVideocamOff },
  { name: "MdCamera", library: "md", component: MdIcons.MdCamera },
  { name: "MdCameraAlt", library: "md", component: MdIcons.MdCameraAlt },
  { name: "MdCameraEnhance", library: "md", component: MdIcons.MdCameraEnhance },
  { name: "MdCameraFront", library: "md", component: MdIcons.MdCameraFront },
  { name: "MdCameraRear", library: "md", component: MdIcons.MdCameraRear },
  { name: "MdCameraRoll", library: "md", component: MdIcons.MdCameraRoll },
  { name: "MdWifi", library: "md", component: MdIcons.MdWifi },
  { name: "MdWifiOff", library: "md", component: MdIcons.MdWifiOff },
  { name: "MdWifiTethering", library: "md", component: MdIcons.MdWifiTethering },
  { name: "MdWifiTetheringError", library: "md", component: MdIcons.MdWifiTetheringError },
  { name: "MdWifiTetheringOff", library: "md", component: MdIcons.MdWifiTetheringOff },
  { name: "MdPower", library: "md", component: MdIcons.MdPower },
  { name: "MdPowerOff", library: "md", component: MdIcons.MdPowerOff },
  { name: "MdPowerSettingsNew", library: "md", component: MdIcons.MdPowerSettingsNew },
  { name: "MdBatteryFull", library: "md", component: MdIcons.MdBatteryFull },
  { name: "MdBatteryChargingFull", library: "md", component: MdIcons.MdBatteryChargingFull },
  { name: "MdBatteryStd", library: "md", component: MdIcons.MdBatteryStd },
  { name: "MdBatteryUnknown", library: "md", component: MdIcons.MdBatteryUnknown },
  { name: "MdArrowUpward", library: "md", component: MdIcons.MdArrowUpward },
  { name: "MdArrowDownward", library: "md", component: MdIcons.MdArrowDownward },
  { name: "MdArrowDropUp", library: "md", component: MdIcons.MdArrowDropUp },
  { name: "MdArrowDropDown", library: "md", component: MdIcons.MdArrowDropDown },
  { name: "MdStairs", library: "md", component: MdIcons.MdStairs },
  { name: "MdChildCare", library: "md", component: MdIcons.MdChildCare },
  { name: "MdChildFriendly", library: "md", component: MdIcons.MdChildFriendly },
  { name: "MdBabyChangingStation", library: "md", component: MdIcons.MdBabyChangingStation },
  { name: "MdPets", library: "md", component: MdIcons.MdPets },
  { name: "MdRestaurant", library: "md", component: MdIcons.MdRestaurant },
  { name: "MdLocalCafe", library: "md", component: MdIcons.MdLocalCafe },
  { name: "MdLocalBar", library: "md", component: MdIcons.MdLocalBar },
  { name: "MdLocalPizza", library: "md", component: MdIcons.MdLocalPizza },
  { name: "MdLocalDining", library: "md", component: MdIcons.MdLocalDining },
  { name: "MdLocalDrink", library: "md", component: MdIcons.MdLocalDrink },
  { name: "MdLocalGroceryStore", library: "md", component: MdIcons.MdLocalGroceryStore },
  { name: "MdLocalGasStation", library: "md", component: MdIcons.MdLocalGasStation },
  { name: "MdLocalHospital", library: "md", component: MdIcons.MdLocalHospital },
  { name: "MdLocalPharmacy", library: "md", component: MdIcons.MdLocalPharmacy },
  { name: "MdLocalAtm", library: "md", component: MdIcons.MdLocalAtm },
  { name: "MdLocalConvenienceStore", library: "md", component: MdIcons.MdLocalConvenienceStore },
  { name: "MdLocalFlorist", library: "md", component: MdIcons.MdLocalFlorist },
  { name: "MdLocalLaundryService", library: "md", component: MdIcons.MdLocalLaundryService },
  { name: "MdLocalLibrary", library: "md", component: MdIcons.MdLocalLibrary },
  { name: "MdLocalMovies", library: "md", component: MdIcons.MdLocalMovies },
  { name: "MdLocalOffer", library: "md", component: MdIcons.MdLocalOffer },
  { name: "MdLocalParking", library: "md", component: MdIcons.MdLocalParking },
  { name: "MdLocalPostOffice", library: "md", component: MdIcons.MdLocalPostOffice },
  { name: "MdLocalPrintshop", library: "md", component: MdIcons.MdLocalPrintshop },
  { name: "MdLocalSee", library: "md", component: MdIcons.MdLocalSee },
  { name: "MdLocalShipping", library: "md", component: MdIcons.MdLocalShipping },
  { name: "MdLocalTaxi", library: "md", component: MdIcons.MdLocalTaxi },
  { name: "MdBusinessCenter", library: "md", component: MdIcons.MdBusinessCenter },
  { name: "MdWork", library: "md", component: MdIcons.MdWork },
  { name: "MdWorkOff", library: "md", component: MdIcons.MdWorkOff },
  { name: "MdWorkOutline", library: "md", component: MdIcons.MdWorkOutline },
  { name: "MdMeetingRoom", library: "md", component: MdIcons.MdMeetingRoom },
  { name: "MdRoomService", library: "md", component: MdIcons.MdRoomService },
  { name: "MdRoom", library: "md", component: MdIcons.MdRoom },
  { name: "MdRoomPreferences", library: "md", component: MdIcons.MdRoomPreferences },
  { name: "MdHotel", library: "md", component: MdIcons.MdHotel },
  { name: "MdApartment", library: "md", component: MdIcons.MdApartment },
  { name: "MdHouse", library: "md", component: MdIcons.MdHouse },
  { name: "MdHome", library: "md", component: MdIcons.MdHome },
  { name: "MdHomeWork", library: "md", component: MdIcons.MdHomeWork },
  { name: "MdVilla", library: "md", component: MdIcons.MdVilla },
  { name: "MdCottage", library: "md", component: MdIcons.MdCottage },
  { name: "MdCastle", library: "md", component: MdIcons.MdCastle },
  { name: "MdFactory", library: "md", component: MdIcons.MdFactory },
  { name: "MdStore", library: "md", component: MdIcons.MdStore },
  { name: "MdStorefront", library: "md", component: MdIcons.MdStorefront },
  { name: "MdShoppingBag", library: "md", component: MdIcons.MdShoppingBag },
  { name: "MdShoppingBasket", library: "md", component: MdIcons.MdShoppingBasket },
  { name: "MdShoppingCart", library: "md", component: MdIcons.MdShoppingCart },
  { name: "MdSchool", library: "md", component: MdIcons.MdSchool },
  { name: "MdLocalLibrary", library: "md", component: MdIcons.MdLocalLibrary },
  { name: "MdMenuBook", library: "md", component: MdIcons.MdMenuBook },
  { name: "MdBook", library: "md", component: MdIcons.MdBook },
  { name: "MdBookOnline", library: "md", component: MdIcons.MdBookOnline },
  { name: "MdBookmark", library: "md", component: MdIcons.MdBookmark },
  { name: "MdBookmarkAdd", library: "md", component: MdIcons.MdBookmarkAdd },
  { name: "MdBookmarkBorder", library: "md", component: MdIcons.MdBookmarkBorder },
  { name: "MdBookmarkRemove", library: "md", component: MdIcons.MdBookmarkRemove },
  { name: "MdDirectionsCar", library: "md", component: MdIcons.MdDirectionsCar },
  { name: "MdDirectionsBike", library: "md", component: MdIcons.MdDirectionsBike },
  { name: "MdDirectionsBus", library: "md", component: MdIcons.MdDirectionsBus },
  { name: "MdDirectionsSubway", library: "md", component: MdIcons.MdDirectionsSubway },
  { name: "MdDirectionsWalk", library: "md", component: MdIcons.MdDirectionsWalk },
  { name: "MdDirectionsRun", library: "md", component: MdIcons.MdDirectionsRun },
  { name: "MdAccessibility", library: "md", component: MdIcons.MdAccessibility },
  { name: "MdAccessibilityNew", library: "md", component: MdIcons.MdAccessibilityNew },
  { name: "MdAccessible", library: "md", component: MdIcons.MdAccessible },
  { name: "MdAccessibleForward", library: "md", component: MdIcons.MdAccessibleForward },
  { name: "MdWheelchairPickup", library: "md", component: MdIcons.MdWheelchairPickup },
  { name: "MdPark", library: "md", component: MdIcons.MdPark },
  { name: "MdNature", library: "md", component: MdIcons.MdNature },
  { name: "MdNaturePeople", library: "md", component: MdIcons.MdNaturePeople },
  { name: "MdGrass", library: "md", component: MdIcons.MdGrass },
  { name: "MdYard", library: "md", component: MdIcons.MdYard },
  { name: "MdDeck", library: "md", component: MdIcons.MdDeck },
  { name: "MdBalcony", library: "md", component: MdIcons.MdBalcony },
  { name: "MdRoofing", library: "md", component: MdIcons.MdRoofing },
  { name: "MdFoundation", library: "md", component: MdIcons.MdFoundation },
  { name: "MdFence", library: "md", component: MdIcons.MdFence },
  { name: "MdGarage", library: "md", component: MdIcons.MdGarage },
  { name: "MdWarehouse", library: "md", component: MdIcons.MdWarehouse },
  { name: "MdBusiness", library: "md", component: MdIcons.MdBusiness },
  { name: "MdDomain", library: "md", component: MdIcons.MdDomain },
  { name: "MdCorporateFare", library: "md", component: MdIcons.MdCorporateFare },
  { name: "MdAccountBalance", library: "md", component: MdIcons.MdAccountBalance },
  { name: "MdAccountBalanceWallet", library: "md", component: MdIcons.MdAccountBalanceWallet },
  { name: "MdAccountBox", library: "md", component: MdIcons.MdAccountBox },
  { name: "MdAccountCircle", library: "md", component: MdIcons.MdAccountCircle },
  { name: "MdPerson", library: "md", component: MdIcons.MdPerson },
  { name: "MdPersonAdd", library: "md", component: MdIcons.MdPersonAdd },
  { name: "MdPersonAddAlt", library: "md", component: MdIcons.MdPersonAddAlt },
  { name: "MdPersonAddAlt1", library: "md", component: MdIcons.MdPersonAddAlt1 },
  { name: "MdPersonOff", library: "md", component: MdIcons.MdPersonOff },
  { name: "MdPersonOutline", library: "md", component: MdIcons.MdPersonOutline },
  { name: "MdPersonPin", library: "md", component: MdIcons.MdPersonPin },
  { name: "MdPersonPinCircle", library: "md", component: MdIcons.MdPersonPinCircle },
  { name: "MdPeople", library: "md", component: MdIcons.MdPeople },
  { name: "MdPeopleAlt", library: "md", component: MdIcons.MdPeopleAlt },
  { name: "MdPeopleOutline", library: "md", component: MdIcons.MdPeopleOutline },
  { name: "MdGroups", library: "md", component: MdIcons.MdGroups },
  { name: "MdGroup", library: "md", component: MdIcons.MdGroup },
  { name: "MdGroupAdd", library: "md", component: MdIcons.MdGroupAdd },
  { name: "MdGroupOff", library: "md", component: MdIcons.MdGroupOff },
  { name: "MdGroupWork", library: "md", component: MdIcons.MdGroupWork },
  { name: "MdSupervisorAccount", library: "md", component: MdIcons.MdSupervisorAccount },
  { name: "MdSupportAgent", library: "md", component: MdIcons.MdSupportAgent },
  { name: "MdSupport", library: "md", component: MdIcons.MdSupport },
  { name: "MdHelp", library: "md", component: MdIcons.MdHelp },
  { name: "MdHelpOutline", library: "md", component: MdIcons.MdHelpOutline },
  { name: "MdHelpCenter", library: "md", component: MdIcons.MdHelpCenter },
  { name: "MdQuestionAnswer", library: "md", component: MdIcons.MdQuestionAnswer },
  { name: "MdContactSupport", library: "md", component: MdIcons.MdContactSupport },
  { name: "MdContactMail", library: "md", component: MdIcons.MdContactMail },
  { name: "MdContactPhone", library: "md", component: MdIcons.MdContactPhone },
  { name: "MdContactPage", library: "md", component: MdIcons.MdContactPage },
  { name: "MdContactEmergency", library: "md", component: MdIcons.MdContactEmergency },
  { name: "MdEmergency", library: "md", component: MdIcons.MdEmergency },
  { name: "MdEmergencyShare", library: "md", component: MdIcons.MdEmergencyShare },
  { name: "MdLocalFireDepartment", library: "md", component: MdIcons.MdLocalFireDepartment },
  { name: "MdLocalPolice", library: "md", component: MdIcons.MdLocalPolice },
  { name: "MdSecurity", library: "md", component: MdIcons.MdSecurity },
  { name: "MdLock", library: "md", component: MdIcons.MdLock },
  { name: "MdLockOpen", library: "md", component: MdIcons.MdLockOpen },
  { name: "MdLockOutline", library: "md", component: MdIcons.MdLockOutline },
  { name: "MdLockClock", library: "md", component: MdIcons.MdLockClock },
  { name: "MdLockPerson", library: "md", component: MdIcons.MdLockPerson },
  { name: "MdVpnKey", library: "md", component: MdIcons.MdVpnKey },
  { name: "MdVpnKeyOff", library: "md", component: MdIcons.MdVpnKeyOff },
  { name: "MdKey", library: "md", component: MdIcons.MdKey },
  { name: "MdKeyOff", library: "md", component: MdIcons.MdKeyOff },
  { name: "MdPassword", library: "md", component: MdIcons.MdPassword },
  { name: "MdFingerprint", library: "md", component: MdIcons.MdFingerprint },
  { name: "MdFace", library: "md", component: MdIcons.MdFace },
  { name: "MdFaceRetouchingNatural", library: "md", component: MdIcons.MdFaceRetouchingNatural },
  { name: "MdFaceRetouchingOff", library: "md", component: MdIcons.MdFaceRetouchingOff },
  { name: "MdFaceUnlock", library: "md", component: MdIcons.MdFaceUnlock },
  { name: "MdVerifiedUser", library: "md", component: MdIcons.MdVerifiedUser },
  { name: "MdVerified", library: "md", component: MdIcons.MdVerified },
  { name: "MdAdminPanelSettings", library: "md", component: MdIcons.MdAdminPanelSettings },
  { name: "MdSettings", library: "md", component: MdIcons.MdSettings },
  { name: "MdSettingsApplications", library: "md", component: MdIcons.MdSettingsApplications },
  { name: "MdSettingsBackupRestore", library: "md", component: MdIcons.MdSettingsBackupRestore },
  { name: "MdSettingsBluetooth", library: "md", component: MdIcons.MdSettingsBluetooth },
  { name: "MdSettingsBrightness", library: "md", component: MdIcons.MdSettingsBrightness },
  { name: "MdSettingsCell", library: "md", component: MdIcons.MdSettingsCell },
  { name: "MdSettingsEthernet", library: "md", component: MdIcons.MdSettingsEthernet },
  { name: "MdSettingsInputAntenna", library: "md", component: MdIcons.MdSettingsInputAntenna },
  { name: "MdSettingsInputComponent", library: "md", component: MdIcons.MdSettingsInputComponent },
  { name: "MdSettingsInputComposite", library: "md", component: MdIcons.MdSettingsInputComposite },
  { name: "MdSettingsInputHdmi", library: "md", component: MdIcons.MdSettingsInputHdmi },
  { name: "MdSettingsInputSvideo", library: "md", component: MdIcons.MdSettingsInputSvideo },
  { name: "MdSettingsOverscan", library: "md", component: MdIcons.MdSettingsOverscan },
  { name: "MdSettingsPhone", library: "md", component: MdIcons.MdSettingsPhone },
  { name: "MdSettingsPower", library: "md", component: MdIcons.MdSettingsPower },
  { name: "MdSettingsRemote", library: "md", component: MdIcons.MdSettingsRemote },
  { name: "MdSettingsVoice", library: "md", component: MdIcons.MdSettingsVoice },
  { name: "MdTune", library: "md", component: MdIcons.MdTune },
  { name: "MdBuild", library: "md", component: MdIcons.MdBuild },
  { name: "MdBuildCircle", library: "md", component: MdIcons.MdBuildCircle },
  { name: "MdEngineering", library: "md", component: MdIcons.MdEngineering },
  { name: "MdConstruction", library: "md", component: MdIcons.MdConstruction },
  { name: "MdHandyman", library: "md", component: MdIcons.MdHandyman },
  { name: "MdPlumbing", library: "md", component: MdIcons.MdPlumbing },
  { name: "MdElectricalServices", library: "md", component: MdIcons.MdElectricalServices },
  { name: "MdWaterDrop", library: "md", component: MdIcons.MdWaterDrop },
  { name: "MdWater", library: "md", component: MdIcons.MdWater },
  { name: "MdWaves", library: "md", component: MdIcons.MdWaves },
  { name: "MdBeachAccess", library: "md", component: MdIcons.MdBeachAccess },
  { name: "MdPool", library: "md", component: MdIcons.MdPool },
  { name: "MdHotTub", library: "md", component: MdIcons.MdHotTub },
  { name: "MdSpa", library: "md", component: MdIcons.MdSpa },
  { name: "MdSelfImprovement", library: "md", component: MdIcons.MdSelfImprovement },
  { name: "MdFitnessCenter", library: "md", component: MdIcons.MdFitnessCenter },
  { name: "MdDirectionsRun", library: "md", component: MdIcons.MdDirectionsRun },
  { name: "MdDirectionsWalk", library: "md", component: MdIcons.MdDirectionsWalk },
  { name: "MdDirectionsBike", library: "md", component: MdIcons.MdDirectionsBike },
  { name: "MdSportsTennis", library: "md", component: MdIcons.MdSportsTennis },
  { name: "MdSportsBasketball", library: "md", component: MdIcons.MdSportsBasketball },
  { name: "MdSportsSoccer", library: "md", component: MdIcons.MdSportsSoccer },
  { name: "MdSportsVolleyball", library: "md", component: MdIcons.MdSportsVolleyball },
  { name: "MdSportsBaseball", library: "md", component: MdIcons.MdSportsBaseball },
  { name: "MdSportsGolf", library: "md", component: MdIcons.MdSportsGolf },
  { name: "MdSportsCricket", library: "md", component: MdIcons.MdSportsCricket },
  { name: "MdSportsHandball", library: "md", component: MdIcons.MdSportsHandball },
  { name: "MdSportsKabaddi", library: "md", component: MdIcons.MdSportsKabaddi },
  { name: "MdSportsMartialArts", library: "md", component: MdIcons.MdSportsMartialArts },
  { name: "MdSportsMotorsports", library: "md", component: MdIcons.MdSportsMotorsports },
  { name: "MdSportsRugby", library: "md", component: MdIcons.MdSportsRugby },
  { name: "MdSportsEsports", library: "md", component: MdIcons.MdSportsEsports },
  { name: "MdSportsHockey", library: "md", component: MdIcons.MdSportsHockey },
  { name: "MdSportsMma", library: "md", component: MdIcons.MdSportsMma },
  { name: "MdEmojiEvents", library: "md", component: MdIcons.MdEmojiEvents },
  // Hero Icons
  { name: "HiHome", library: "hi", component: HiIcons.HiHome },
  { name: "HiOfficeBuilding", library: "hi", component: HiIcons.HiOfficeBuilding },
  { name: "HiKey", library: "hi", component: HiIcons.HiKey },
  { name: "HiSearch", library: "hi", component: HiIcons.HiSearch },
  { name: "HiLocationMarker", library: "hi", component: HiIcons.HiLocationMarker },
  { name: "HiPhone", library: "hi", component: HiIcons.HiPhone },
  { name: "HiMail", library: "hi", component: HiIcons.HiMail },
  { name: "HiCalendar", library: "hi", component: HiIcons.HiCalendar },
  { name: "HiUsers", library: "hi", component: HiIcons.HiUsers },
  { name: "HiUser", library: "hi", component: HiIcons.HiUser },
  { name: "HiCog", library: "hi", component: HiIcons.HiCog },
  { name: "HiHeart", library: "hi", component: HiIcons.HiHeart },
  { name: "HiStar", library: "hi", component: HiIcons.HiStar },
  { name: "HiShieldCheck", library: "hi", component: HiIcons.HiShieldCheck },
  { name: "HiLockClosed", library: "hi", component: HiIcons.HiLockClosed },
  { name: "HiCheckCircle", library: "hi", component: HiIcons.HiCheckCircle },
  { name: "HiXCircle", library: "hi", component: HiIcons.HiXCircle },
  { name: "HiInformationCircle", library: "hi", component: HiIcons.HiInformationCircle },
  { name: "HiCamera", library: "hi", component: HiIcons.HiCamera },
  { name: "HiPhotograph", library: "hi", component: HiIcons.HiPhotograph },
  { name: "HiVideoCamera", library: "hi", component: HiIcons.HiVideoCamera },
  { name: "HiDownload", library: "hi", component: HiIcons.HiDownload },
  { name: "HiUpload", library: "hi", component: HiIcons.HiUpload },
  { name: "HiShare", library: "hi", component: HiIcons.HiShare },
  { name: "HiLink", library: "hi", component: HiIcons.HiLink },
  { name: "HiExternalLink", library: "hi", component: HiIcons.HiExternalLink },
  { name: "HiArrowRight", library: "hi", component: HiIcons.HiArrowRight },
  { name: "HiArrowLeft", library: "hi", component: HiIcons.HiArrowLeft },
  { name: "HiChevronRight", library: "hi", component: HiIcons.HiChevronRight },
  { name: "HiChevronLeft", library: "hi", component: HiIcons.HiChevronLeft },
  { name: "HiMenu", library: "hi", component: HiIcons.HiMenu },
  { name: "HiX", library: "hi", component: HiIcons.HiX },
  { name: "HiPlus", library: "hi", component: HiIcons.HiPlus },
  { name: "HiMinus", library: "hi", component: HiIcons.HiMinus },
  { name: "HiPencil", library: "hi", component: HiIcons.HiPencil },
  { name: "HiTrash", library: "hi", component: HiIcons.HiTrash },
  { name: "HiSave", library: "hi", component: HiIcons.HiSave },
  { name: "HiClipboardCopy", library: "hi", component: HiIcons.HiClipboardCopy },
  { name: "HiPrinter", library: "hi", component: HiIcons.HiPrinter },
  { name: "HiBell", library: "hi", component: HiIcons.HiBell },
  { name: "HiBookmark", library: "hi", component: HiIcons.HiBookmark },
  { name: "HiTag", library: "hi", component: HiIcons.HiTag },
  { name: "HiFilter", library: "hi", component: HiIcons.HiFilter },
  { name: "HiViewGrid", library: "hi", component: HiIcons.HiViewGrid },
  { name: "HiViewList", library: "hi", component: HiIcons.HiViewList },
  { name: "HiChartBar", library: "hi", component: HiIcons.HiChartBar },
  { name: "HiChartPie", library: "hi", component: HiIcons.HiChartPie },
  { name: "HiLightningBolt", library: "hi", component: HiIcons.HiLightningBolt },
  { name: "HiSun", library: "hi", component: HiIcons.HiSun },
  { name: "HiMoon", library: "hi", component: HiIcons.HiMoon },
  { name: "HiCloud", library: "hi", component: HiIcons.HiCloud },
  { name: "HiTruck", library: "hi", component: HiIcons.HiTruck },
  { name: "HiGlobe", library: "hi", component: HiIcons.HiGlobe },
  { name: "HiWifi", library: "hi", component: HiIcons.HiWifi },
  { name: "HiVolumeUp", library: "hi", component: HiIcons.HiVolumeUp },
  { name: "HiVolumeOff", library: "hi", component: HiIcons.HiVolumeOff },
  { name: "HiPlay", library: "hi", component: HiIcons.HiPlay },
  { name: "HiPause", library: "hi", component: HiIcons.HiPause },
  { name: "HiDesktopComputer", library: "hi", component: HiIcons.HiDesktopComputer },
  { name: "HiDeviceMobile", library: "hi", component: HiIcons.HiDeviceMobile },
  { name: "HiSpeakerphone", library: "hi", component: HiIcons.HiSpeakerphone },
  { name: "HiMicrophone", library: "hi", component: HiIcons.HiMicrophone },
  // Ionicons
  { name: "IoHome", library: "io", component: IoIcons.IoHome },
  { name: "IoBusiness", library: "io", component: IoIcons.IoBusiness },
  { name: "IoKey", library: "io", component: IoIcons.IoKey },
  { name: "IoSearch", library: "io", component: IoIcons.IoSearch },
  { name: "IoLocation", library: "io", component: IoIcons.IoLocation },
  { name: "IoCall", library: "io", component: IoIcons.IoCall },
  { name: "IoMail", library: "io", component: IoIcons.IoMail },
  { name: "IoCalendar", library: "io", component: IoIcons.IoCalendar },
  { name: "IoPeople", library: "io", component: IoIcons.IoPeople },
  { name: "IoPerson", library: "io", component: IoIcons.IoPerson },
  { name: "IoSettings", library: "io", component: IoIcons.IoSettings },
  { name: "IoHeart", library: "io", component: IoIcons.IoHeart },
  { name: "IoStar", library: "io", component: IoIcons.IoStar },
  { name: "IoShieldCheckmark", library: "io", component: IoIcons.IoShieldCheckmark },
  { name: "IoLockClosed", library: "io", component: IoIcons.IoLockClosed },
  { name: "IoCheckmarkCircle", library: "io", component: IoIcons.IoCheckmarkCircle },
  { name: "IoCloseCircle", library: "io", component: IoIcons.IoCloseCircle },
  { name: "IoInformationCircle", library: "io", component: IoIcons.IoInformationCircle },
  { name: "IoCamera", library: "io", component: IoIcons.IoCamera },
  { name: "IoImage", library: "io", component: IoIcons.IoImage },
  { name: "IoVideocam", library: "io", component: IoIcons.IoVideocam },
  { name: "IoDownload", library: "io", component: IoIcons.IoDownload },
  { name: "IoCloudUpload", library: "io", component: IoIcons.IoCloudUpload },
  { name: "IoShareSocial", library: "io", component: IoIcons.IoShareSocial },
  { name: "IoLink", library: "io", component: IoIcons.IoLink },
  { name: "IoOpenOutline", library: "io", component: IoIcons.IoOpenOutline },
  { name: "IoArrowForward", library: "io", component: IoIcons.IoArrowForward },
  { name: "IoArrowBack", library: "io", component: IoIcons.IoArrowBack },
  { name: "IoChevronForward", library: "io", component: IoIcons.IoChevronForward },
  { name: "IoChevronBack", library: "io", component: IoIcons.IoChevronBack },
  { name: "IoMenu", library: "io", component: IoIcons.IoMenu },
  { name: "IoClose", library: "io", component: IoIcons.IoClose },
  { name: "IoAdd", library: "io", component: IoIcons.IoAdd },
  { name: "IoRemove", library: "io", component: IoIcons.IoRemove },
  { name: "IoCreate", library: "io", component: IoIcons.IoCreate },
  { name: "IoTrash", library: "io", component: IoIcons.IoTrash },
  { name: "IoSave", library: "io", component: IoIcons.IoSave },
  { name: "IoCopy", library: "io", component: IoIcons.IoCopy },
  { name: "IoPrint", library: "io", component: IoIcons.IoPrint },
  { name: "IoNotifications", library: "io", component: IoIcons.IoNotifications },
  { name: "IoBookmark", library: "io", component: IoIcons.IoBookmark },
  { name: "IoPricetag", library: "io", component: IoIcons.IoPricetag },
  { name: "IoFilter", library: "io", component: IoIcons.IoFilter },
  { name: "IoGrid", library: "io", component: IoIcons.IoGrid },
  { name: "IoList", library: "io", component: IoIcons.IoList },
  { name: "IoBarChart", library: "io", component: IoIcons.IoBarChart },
  { name: "IoPieChart", library: "io", component: IoIcons.IoPieChart },
  { name: "IoFlash", library: "io", component: IoIcons.IoFlash },
  { name: "IoSunny", library: "io", component: IoIcons.IoSunny },
  { name: "IoMoon", library: "io", component: IoIcons.IoMoon },
  { name: "IoCloud", library: "io", component: IoIcons.IoCloud },
  { name: "IoCar", library: "io", component: IoIcons.IoCar },
  { name: "IoBicycle", library: "io", component: IoIcons.IoBicycle },
  { name: "IoGlobe", library: "io", component: IoIcons.IoGlobe },
  { name: "IoWifi", library: "io", component: IoIcons.IoWifi },
  { name: "IoBatteryFull", library: "io", component: IoIcons.IoBatteryFull },
  { name: "IoVolumeHigh", library: "io", component: IoIcons.IoVolumeHigh },
  { name: "IoVolumeMute", library: "io", component: IoIcons.IoVolumeMute },
  { name: "IoPlay", library: "io", component: IoIcons.IoPlay },
  { name: "IoPause", library: "io", component: IoIcons.IoPause },
  { name: "IoDesktop", library: "io", component: IoIcons.IoDesktop },
  { name: "IoPhonePortrait", library: "io", component: IoIcons.IoPhonePortrait },
  { name: "IoTabletPortrait", library: "io", component: IoIcons.IoTabletPortrait },
  { name: "IoLaptop", library: "io", component: IoIcons.IoLaptop },
  { name: "IoHeadset", library: "io", component: IoIcons.IoHeadset },
  { name: "IoMic", library: "io", component: IoIcons.IoMic },
  { name: "IoMicOff", library: "io", component: IoIcons.IoMicOff },
];

interface IconPickerProps {
  value?: { icon: string; iconLibrary: "lucide" | "react-icons" };
  onChange: (value: { icon: string; iconLibrary: "lucide" | "react-icons" }) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<"lucide" | "react-icons">(value?.iconLibrary || "lucide");

  useEffect(() => {
    if (value?.iconLibrary) {
      setSelectedLibrary(value.iconLibrary);
    }
  }, [value?.iconLibrary]);

  const filteredLucideIcons = lucideIconList.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReactIcons = reactIconList.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (iconName: string, library: "lucide" | "react-icons") => {
    if (library === "lucide") {
      const IconComponent = (LucideIcons as any)[iconName];
      if (!IconComponent) return null;
      return <IconComponent className="h-5 w-5" />;
    } else {
      // Find icon by name in react-icons list
      const icon = reactIconList.find((i) => i.name === iconName);
      if (!icon) return null;
      const IconComponent = icon.component;
      return <IconComponent className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Icon Library</Label>
        <select
          value={selectedLibrary}
          onChange={(e) => {
            const lib = e.target.value as "lucide" | "react-icons";
            setSelectedLibrary(lib);
            onChange({ icon: "", iconLibrary: lib });
          }}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="lucide">Lucide Icons</option>
          <option value="react-icons">React Icons (Font Awesome, Material, Hero, Ionicons)</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Search Icons</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
        {selectedLibrary === "lucide" ? (
          <div className="grid grid-cols-6 gap-2">
            {filteredLucideIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              if (!IconComponent) return null;
              const isSelected = value?.icon === iconName && value?.iconLibrary === "lucide";
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange({ icon: iconName, iconLibrary: "lucide" })}
                  className={cn(
                    "p-2 rounded-md border transition-colors hover:bg-accent",
                    isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                  )}
                  title={iconName}
                >
                  <IconComponent className="h-5 w-5 mx-auto" />
                </button>
              );
            })}
          </div>
        ) : (
          <Tabs defaultValue="fa" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="fa">FA</TabsTrigger>
              <TabsTrigger value="md">MD</TabsTrigger>
              <TabsTrigger value="hi">HI</TabsTrigger>
              <TabsTrigger value="io">IO</TabsTrigger>
            </TabsList>
            <TabsContent value="fa" className="mt-0">
              <div className="grid grid-cols-6 gap-2">
                {filteredReactIcons
                  .filter((icon) => icon.library === "fa")
                  .map((icon) => {
                    const IconComponent = icon.component;
                    const isSelected = value?.icon === icon.name && value?.iconLibrary === "react-icons";
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => onChange({ icon: icon.name, iconLibrary: "react-icons" })}
                        className={cn(
                          "p-2 rounded-md border transition-colors hover:bg-accent",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                        )}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
            <TabsContent value="md" className="mt-0">
              <div className="grid grid-cols-6 gap-2">
                {filteredReactIcons
                  .filter((icon) => icon.library === "md")
                  .map((icon) => {
                    const IconComponent = icon.component;
                    const isSelected = value?.icon === icon.name && value?.iconLibrary === "react-icons";
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => onChange({ icon: icon.name, iconLibrary: "react-icons" })}
                        className={cn(
                          "p-2 rounded-md border transition-colors hover:bg-accent",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                        )}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
            <TabsContent value="hi" className="mt-0">
              <div className="grid grid-cols-6 gap-2">
                {filteredReactIcons
                  .filter((icon) => icon.library === "hi")
                  .map((icon) => {
                    const IconComponent = icon.component;
                    const isSelected = value?.icon === icon.name && value?.iconLibrary === "react-icons";
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => onChange({ icon: icon.name, iconLibrary: "react-icons" })}
                        className={cn(
                          "p-2 rounded-md border transition-colors hover:bg-accent",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                        )}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
            <TabsContent value="io" className="mt-0">
              <div className="grid grid-cols-6 gap-2">
                {filteredReactIcons
                  .filter((icon) => icon.library === "io")
                  .map((icon) => {
                    const IconComponent = icon.component;
                    const isSelected = value?.icon === icon.name && value?.iconLibrary === "react-icons";
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => onChange({ icon: icon.name, iconLibrary: "react-icons" })}
                        className={cn(
                          "p-2 rounded-md border transition-colors hover:bg-accent",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                        )}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {value?.icon && (
        <div className="p-3 border rounded-md bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded border">
              {renderIcon(value.icon, value.iconLibrary)}
            </div>
            <div>
              <p className="text-sm font-medium">Selected Icon</p>
              <p className="text-xs text-muted-foreground">{value.icon} ({value.iconLibrary})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

