// Package management service for Cheetahnet Internet Services

// Available internet packages
const INTERNET_PACKAGES = {
  '1': {
    name: 'Starter',
    data: '5 Mbps',
    validity: '30 days',
    price: 15000,
    description: 'Perfect for light browsing and social media'
  },
  '2': {
    name: 'Standard',
    data: '15 Mbps',
    validity: '30 days',
    price: 35000,
    description: 'Great for streaming and home office'
  },
  '3': {
    name: 'Premium',
    data: '30 Mbps',
    validity: '30 days',
    price: 75000,
    description: 'Heavy usage and multiple devices'
  },
  '4': {
    name: 'Ka Weekie',
    data: '50 Mbps',
    validity: '7 days',
    price: 25000,
    description: 'True Unlimited data for 7 days'
  },
  '5': {
    name: 'Super Flux',
    data: '100 Mbps',
    validity: '30 days',
    price: 125000,
    description: 'True Unlimited data for 30 days'
  }
};

// Get all available packages
export function getAvailablePackages() {
  let packagesText = "Available Internet Packages:\n\n";
  
  Object.entries(INTERNET_PACKAGES).forEach(([key, pkg]) => {
    packagesText += `${key}. ${pkg.name}\n`;
    packagesText += `   📊 Speed: ${pkg.data} - ${pkg.validity}\n`;
    packagesText += `   💰 UGX ${pkg.price.toLocaleString()}\n`;
    packagesText += `   📝 ${pkg.description}\n`;
    packagesText += `.........................\n\n`;
  });
  
  packagesText += "Reply with the package number to select:";
  
  return { reply: packagesText };
}

// Get package details by ID
export function getPackageById(packageId) {
  const pkg = INTERNET_PACKAGES[packageId];
  if (!pkg) {
    return { reply: "❌ Invalid package selection. Please choose a valid package number." };
  }
  
  return {
    reply: `📦 Selected Package: ${pkg.name}\n📊 Data: ${pkg.data}\n⏰ Validity: ${pkg.validity}\n💰 Price: UGX ${pkg.price.toLocaleString()}\n\n✅ Confirm this package? (Reply YES to confirm or NO to choose another)`,
    package: pkg
  };
}

// Validate package selection
export function validatePackageSelection(packageId) {
  return INTERNET_PACKAGES.hasOwnProperty(packageId);
}

// Get package price
export function getPackagePrice(packageId) {
  const pkg = INTERNET_PACKAGES[packageId];
  return pkg ? pkg.price : 0;
}

// Get package name
export function getPackageName(packageId) {
  const pkg = INTERNET_PACKAGES[packageId];
  return pkg ? pkg.name : 'Unknown Package';
}
