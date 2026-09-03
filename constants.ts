export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'member' | 'admin' | 'exco';

export interface User {
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emailVerified?: boolean;
  approvalStatus?: ApprovalStatus;
  role?: UserRole;
  rejectionReason?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const ADMIN_EMAILS = [
  "sunnyvaleabujamasjid@gmail.com",
  "rave.devv@gmail.com",
];

export const BANK_DETAILS = [
  {
    bank: "ZENITH BANK",
    accountNumber: "1012828460",
    accountName: "Sunnyvale Homes Muslim Community Masjid",
  },
  {
    bank: "JAIZ BANK",
    accountNumber: "0001788527",
    accountName: "Sunnyvale Homes Muslim Community Masjid",
  },
  {
    bank: "AEDC (Electricity Credit)",
    accountNumber: "0195130015108",
    accountName: "Meter Number",
  },
];

export const CONTACT_PHONES = ["08034135325", "08032873089"];
export const MOSQUE_EMAIL = "Sunnyvaleabujamasjid@gmail.com";

export const DONATION_PURPOSES = [
  { id: 'monthly', label: 'Monthly Contribution', description: 'Regular monthly member pledge (Min ₦5,000)' },
  { id: 'maintenance', label: 'Masjid Maintenance', description: 'Repairs, sound system, carpets & cleaning' },
  { id: 'electricity', label: 'Electricity (AEDC Credit)', description: 'Powering air conditioning and masjid lighting' },
  { id: 'academy', label: 'Alhamideen Academy', description: 'Islamic education, learning materials & teacher support' },
  { id: 'school', label: 'School Project', description: 'Building and infrastructure development fund' },
  { id: 'ramadan', label: 'Ramadan & Iftar Program', description: 'Daily iftar meals, taraweeh and itikaf support' },
  { id: 'sadaqah', label: 'General Sadaqah', description: 'Voluntary charity for general mosque operations' },
  { id: 'zakat', label: 'Zakat Al-Mal', description: 'Purification of wealth distributed to eligible recipients' },
  { id: 'welfare', label: 'Welfare & Helping Needy', description: 'Direct assistance to vulnerable community members' },
];

export const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000, 250000];

// Current estimated Nisab threshold in Nigerian Naira (87.48g of 24k gold or 612.36g silver)
export const CURRENT_NISAB_GOLD_NGN = 11500000; // ~ ₦11.5M (approximate gold nisab)
export const CURRENT_NISAB_SILVER_NGN = 1250000; // ~ ₦1.25M (silver nisab)

export const DAILY_HADITHS = [
  {
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation: "Actions are but by intentions, and every person will have only what they intended.",
    source: "Sahih al-Bukhari 1",
    theme: "Sincerity & Intention"
  },
  {
    arabic: "مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ",
    translation: "Whoever builds a mosque for Allah, Allah will build for him a house like it in Paradise.",
    source: "Sahih al-Bukhari 450",
    theme: "Sadaqah Jariyah"
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation: "The best among you are those who learn the Qur'an and teach it.",
    source: "Sahih al-Bukhari 5027",
    theme: "Knowledge"
  },
  {
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih al-Bukhari 13",
    theme: "Brotherhood"
  },
  {
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    translation: "Charity does not decrease wealth.",
    source: "Sahih Muslim 2588",
    theme: "Charity"
  }
];

