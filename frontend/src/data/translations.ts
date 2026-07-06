/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  title: string;
  subtitle: string;
  sectorBadge: string;
  commandTab: string;
  agentsTab: string;
  socialTab: string;
  analyticsTab: string;
  securityTab: string;
  settingsTab: string;
  responderTab: string;
  disasterLog: string;
  submitTicket: string;
  activeDossier: string;
  exportDossier: string;
  descriptionLabel: string;
  aiBriefLabel: string;
  safetyBoundsLabel: string;
  milestonesLabel: string;
  languageSelect: string;
  missingPersonsTab: string;
  sosAlert: string;
}

export const TRANSLATIONS: Record<string, TranslationSet> = {
  en: {
    title: "CrisisOps AI",
    subtitle: "Multi-Agent Disaster Response Coordination Platform",
    sectorBadge: "EOC SECTOR 4",
    commandTab: "Command Center HUD",
    agentsTab: "Agent Orchestration",
    socialTab: "Social & Missing Portal",
    analyticsTab: "Incident Analytics",
    securityTab: "Security & Audit Vault",
    settingsTab: "Command Settings",
    responderTab: "Field Responder App",
    disasterLog: "Active Disaster Command Log",
    submitTicket: "File Incident Dispatch Ticket",
    activeDossier: "ACTIVE DOSSIER VIEW",
    exportDossier: "EXPORT SITUATION DOSSIER",
    descriptionLabel: "Operational Description",
    aiBriefLabel: "AI GENERATED SITUATION BRIEF",
    safetyBoundsLabel: "Enforced Safety Bounds",
    milestonesLabel: "Operational Milestones",
    languageSelect: "Select Command Language",
    missingPersonsTab: "Missing Persons Search",
    sosAlert: "CRITICAL SOS ACTIVE"
  },
  hi: {
    title: "क्राइसिसऑप्स एआई",
    subtitle: "बहु-एजेंट आपदा प्रतिक्रिया समन्वय मंच",
    sectorBadge: "ईओसी सेक्टर ४",
    commandTab: "कमांड सेंटर हड",
    agentsTab: "एजेंट आर्केस्ट्रेशन",
    socialTab: "सामाजिक और लापता पोर्टल",
    analyticsTab: "घटना विश्लेषण",
    securityTab: "सुरक्षा और ऑडिट वॉल्ट",
    settingsTab: "कमांड सेटिंग्स",
    responderTab: "फील्ड रिस्पॉन्डर ऐप",
    disasterLog: "सक्रिय आपदा कमांड लॉग",
    submitTicket: "आपदा प्रेषण टिकट दर्ज करें",
    activeDossier: "सक्रिय डोजियर दृश्य",
    exportDossier: "स्थिति डोजियर निर्यात करें",
    descriptionLabel: "परिचालन विवरण",
    aiBriefLabel: "एआई जनित स्थिति संक्षिप्त",
    safetyBoundsLabel: "लागू सुरक्षा सीमाएं",
    milestonesLabel: "परिचालन मील के पत्थर",
    languageSelect: "कमांड भाषा चुनें",
    missingPersonsTab: "लापता व्यक्तियों की खोज",
    sosAlert: "महत्वपूर्ण एसओएस सक्रिय"
  },
  bn: {
    title: "ক্রাইসিসঅপস এআই",
    subtitle: "মাল্টি-এজেন্ট দুর্যোগ প্রতিক্রিয়া সমন্বয় প্ল্যাটফর্ম",
    sectorBadge: "ইওসি সেক্টর ৪",
    commandTab: "কমান্ড সেন্টার হাড",
    agentsTab: "এজেন্ট অর্কেস্ট্রেশন",
    socialTab: "সামাজিক ও নিখোঁজ পোর্টাল",
    analyticsTab: "ঘটনা বিশ্লেষণ",
    securityTab: "নিরাপত্তা ও অডিট ভল্ট",
    settingsTab: "কমান্ড সেটিংস",
    responderTab: "ফিল্ড রেসপন্ডার অ্যাপ",
    disasterLog: "সক্রিয় দুর্যোগ কমান্ড লগ",
    submitTicket: "দুর্যোগ প্রেরণ টিকিট ফাইল করুন",
    activeDossier: "সক্রিয় ডসিয়ার ভিউ",
    exportDossier: "স্থিতি ডসিয়ার রপ্তানি করুন",
    descriptionLabel: "কার্যকরী বিবরণ",
    aiBriefLabel: "এআই জেনারেটেড পরিস্থিতি সংক্ষিপ্ত বিবরণ",
    safetyBoundsLabel: "প্রয়োগকৃত নিরাপত্তা সীমা",
    milestonesLabel: "কার্যকরী মাইলফলক",
    languageSelect: "কমান্ড ভাষা নির্বাচন করুন",
    missingPersonsTab: "নিখোঁজ ব্যক্তিদের অনুসন্ধান",
    sosAlert: "গুরুত্বপূর্ণ এসওএস সক্রিয়"
  },
  ta: {
    title: "கிரைசிஸ்ஆப்ஸ் ஏஐ",
    subtitle: "பல முகவர் பேரிடர் மறுமொழி ஒருங்கிணைப்பு தளம்",
    sectorBadge: "ஈஓசி பிரிவு 4",
    commandTab: "கட்டளை மைய ஹட்",
    agentsTab: "முகவர் ஒழுங்கமைப்பு",
    socialTab: "சமூக & காணாமல் போனோர் போர்டல்",
    analyticsTab: "சம்பவ பகுப்பாய்வு",
    securityTab: "பாதுகாப்பு & தணிக்கை பெட்டகம்",
    settingsTab: "கட்டளை அமைப்புகள்",
    responderTab: "களப் பணியாளர் செயலி",
    disasterLog: "செயலில் உள்ள பேரிடர் கட்டளை பதிவு",
    submitTicket: "பேரிடர் அனுப்பும் சீட்டை தாக்கல் செய்க",
    activeDossier: "செயலில் உள்ள கோப்பு பார்வை",
    exportDossier: "நிலைமை கோப்பை ஏற்றுமதி செய்க",
    descriptionLabel: "செயல்பாட்டு விளக்கம்",
    aiBriefLabel: "ஏஐ உருவாக்கிய நிலைமை சுருக்கம்",
    safetyBoundsLabel: "அமுல்படுத்தப்பட்ட பாதுகாப்பு எல்லைகள்",
    milestonesLabel: "செயல்பாட்டு மைல்கற்கள்",
    languageSelect: "கட்டளை மொழியைத் தேர்ந்தெடுக்கவும்",
    missingPersonsTab: "காணாமல் போனவர்கள் தேடல்",
    sosAlert: "முக்கியமான எஸ்ஓஎஸ் செயலில் உள்ளது"
  },
  te: {
    title: "క్రైసిస్ఆప్స్ ఏఐ",
    subtitle: "మల్టీ-ఏజెంట్ విపత్తు ప్రతిస్పందన సమన్వయ వేదిక",
    sectorBadge: "ఈఓసీ సెక‍్టర్ 4",
    commandTab: "కమాండ్ సెంటర్ హడ్",
    agentsTab: "ఏజెంట్ ఆర్కెస్ట్రేషన్",
    socialTab: "సోషల్ & మిస్సింగ్ పోర్టల్",
    analyticsTab: "సంగటన విశ్లేషణ",
    securityTab: "సెక్యూరిటీ & ఆడిట్ వాల్ట్",
    settingsTab: "కమాండ్ సెట్టింగులు",
    responderTab: "ఫీల్డ్ రెస్పాండర్ యాప్",
    disasterLog: "సక్రియ విపత్తు కమాండ్ లాగ్",
    submitTicket: "విపత్తు డిస్పాచ్ టికెట్ దాఖలు చేయండి",
    activeDossier: "సక్రియ డాసియర్ వీక్షణ",
    exportDossier: "పరిస్థితి డాసియర్ ఎగుమతి చేయండి",
    descriptionLabel: "కార్యాచరణ వివరణ",
    aiBriefLabel: "ఏఐ రూపొందించిన పరిస్థితి సంక్షిప్త సమాచారం",
    safetyBoundsLabel: "అమలు చేయబడిన భద్రతా పరిమితులు",
    milestonesLabel: "కార్యాచరణ మైలురాళ్ళు",
    languageSelect: "కమాండ్ భాషను ఎంచుకోండి",
    missingPersonsTab: "మిస్సింగ్ పర్సన్స్ శోధన",
    sosAlert: "కీలకమైన ఎస్ఓఎస్ యాక్టివ్‌గా ఉంది"
  },
  mr: {
    title: "क्रायसिसऑप्स एआय",
    subtitle: "मल्टी-एजंट आपत्ती प्रतिसाद समन्वय मंच",
    sectorBadge: "ईओसी सेक्टर ४",
    commandTab: "कमांड सेंटर हड",
    agentsTab: "एजंट ऑर्केस्ट्रेशन",
    socialTab: "सामाजिक आणि गहाळ पोर्टल",
    analyticsTab: "घटना विश्लेषण",
    securityTab: "सुरक्षा आणि ऑडिट वॉल्ट",
    settingsTab: "कमांड सेटिंग्ज",
    responderTab: "फील्ड रिस्पॉन्डर ॲप",
    disasterLog: "सक्रिय आपत्ती कमांड लॉग",
    submitTicket: "आपत्ती प्रेषण तिकीट दाखल करा",
    activeDossier: "सक्रिय दस्तऐवज दृश्य",
    exportDossier: "स्थिती दस्तऐवज निर्यात करा",
    descriptionLabel: "कार्यात्मक वर्णन",
    aiBriefLabel: "एआय जनित परिस्थिती संक्षिप्त",
    safetyBoundsLabel: "लागू सुरक्षा मर्यादा",
    milestonesLabel: "कार्यात्मक टप्पे",
    languageSelect: "कमांड भाषा निवडा",
    missingPersonsTab: "गहाळ व्यक्तींचा शोध",
    sosAlert: "महत्वपूर्ण एसओएस सक्रिय"
  }
};
