import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  Globe2,
  HeartHandshake,
  HeartPulse,
  Info,
  Landmark,
  LockKeyhole,
  Mic,
  MicOff,
  Phone,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  WalletCards,
  Sparkles,
  Heart,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getGeminiGuidance } from './services/gemini';
import { getHealth, openSession, saveProgress, searchSchemeCatalog, transcribeVoiceWithApi } from './services/api';
import { getOfflineGuidance } from './services/offlineGuidance';
import { checkVoiceCapabilities, requestMicrophoneAccess, createSpeechRecognizer, VoiceRecorder, speakText, stopSpeaking } from './services/voice';
import { detectLanguage } from '../shared/detectLanguage.js';
import { LANGUAGE_META, REGIONAL_LANGUAGE_CODES, CODE_MIXED_LANGUAGE_CODES, getLanguageMeta } from '../shared/languages.js';
import { RESOURCE_CATALOG, RESOURCE_CATEGORIES } from '../shared/resources.js';
import './styles.css';

const PMUY_URL = 'https://www.pmuy.gov.in/ujjwala2.html';

export const LANGUAGE_GREETINGS = {
  hi: 'नमस्ते, मैं सेवा दीदी हूँ।',
  bn: 'নমস্কার, আমি সেবা দিদি।',
  ta: 'வணக்கம், நான் சேவா தீதி.',
  te: 'నమస్కారం, నేను సేవా దీదీని.',
  mr: 'नमस्ते, मी सेवा दीदी आहे.',
  kn: 'ನಮಸ್ಕಾರ, ನಾನು ಸೇವಾ ದೀದಿ.',
  gu: 'નમસ્તે, હું સેવા દીદી છું.',
  ml: 'നമസ്കാരം, ഞാൻ സേവാ ദീദിയാണ്.',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਸੇਵਾ ਦੀਦੀ ਹਾਂ।',
  or: 'ନମସ୍କାର, ମୁଁ ସେବା ଦୀଦି।',
  as: 'নমস্কাৰ, মই সেৱা দিদি।',
  ur: 'سلام، میں سیوا دیدی ہوں۔',
  en: 'Hello, I am Seva Didi.',
  'hi-Latn': 'Namaste, main Seva Didi hoon.',
  'ta-Latn': 'Vanakkam, naan Seva Didi.',
};

export const LANGUAGE_SPOKEN_GREETINGS = {
  hi: 'नमस्ते दीदी! मैं सेवा दीदी हूँ। बताइए, आपको क्या सहायता चाहिए? जैसे मुफ्त गैस कनेक्शन, राशन, मातृत्व सहायता ₹5000, या सिलाई का काम सीखना?',
  bn: 'নমস্কার দিদি! আমি সেবা দিদি। আপনার কী সাহায্য লাগবে? যেমন বিনামূল্যে গ্যাস কানেকশন, রেশন, মাতৃত্ব সাহায্য ৫০০০ টাকা, বা সেলাই কাজ শেখা?',
  ta: 'வணக்கம் அம்மா! நான் சேவா தீதி. உங்களுக்கு என்ன உதவி வேண்டும்? இலவச கேஸ் இணைப்பு, ரேஷன், பிரசவ உதவி ரூ.5000, அல்லது தையல் பயிற்சி?',
  te: 'నమస్కారం అక్కా! నేను సేవా దీదీని. మీకు ఏమి సహాయం కావాలి? ఉచిత గ్యాస్ కనెక్షన్, రేషన్, ప్రసూతి సహాయం రూ.5000 లేదా కుట్టు పని శిక్షణ?',
  mr: 'नमस्ते ताई! मी सेवा दीदी आहे. तुम्हाला कोणती मदत हवी आहे? मोफत गॅस कनेक्शन, रेशन, मातृत्व मदत ₹५०००, किंवा शिलाई काम शिकणे?',
  kn: 'ನಮಸ್ಕಾರ ಅಕ್ಕಾ! ನಾನು ಸೇವಾ ದೀದಿ. ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು? ಉಚಿತ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ, ರೇಷನ್, ಮಾತೃತ್ವ ಸಹಾಯ ₹5000, ಅಥವಾ ಹೊಲಿಗೆ ತರಬೇತಿ?',
  gu: 'નમસ્તે બહેન! હું સેવા દીદી છું. તમને શું મદદ જોઈએ છે? મફત ગેસ કનેક્શન, રાશન, માતૃત્વ સહાય ₹5000, અથવા સીવણ કામ શીખવું?',
  ml: 'നമസ്കാരം ചേച്ചീ! ഞാൻ സേവാ ദീദിയാണ്. നിങ്ങൾക്ക് എന്ത് സഹായമാണ് വേണ്ടത്? സൗജന്യ ഗ്യാസ് കണക്ഷൻ, റേഷൻ, പ്രസവ സഹായം 5000 രൂപ, അല്ലെങ്കിൽ തയ്യൽ പരിശീലനം?',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭੈਣ ਜੀ! ਮੈਂ ਸੇਵਾ ਦੀਦੀ ਹਾਂ। ਤੁਹਾਨੂੰ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ? ਮੁਫ਼ਤ ਗੈਸ ਕਨੈਕਸ਼ਨ, ਰਾਸ਼ਨ, ਜਣੇਪਾ ਸਹਾਇਤਾ ₹5000, ਜਾਂ ਸਿਲਾਈ ਸਿੱਖਣੀ?',
  or: 'ନମସ୍କାର ଭଉଣୀ! ମୁଁ ସେବା ଦୀଦି। ଆପଣଙ୍କୁ କଣ ସାହାଯ୍ୟ ଦରକାର? ମାଗଣା ଗ୍ୟାସ ସଂଯୋଗ, ରାସନ, ମାତୃତ୍ୱ ସହାୟତା ୫୦୦୦ ଟଙ୍କା, ବା ସିଲେଇ କାମ?',
  as: 'নমস্কাৰ বাইদেউ! মই সেৱা দিদি। আপোনাক কি সহায় লাগে? বিনামূলীয়া গেছ সংযোগ, ৰেচন, মাতৃত্ব সাহায্য ৫০০০ টকা, বা চিলাই কাম শিকা?',
  ur: 'سلام باجی! میں سیوا دیدی ہوں۔ آپ کو کیا مدد چاہیے؟ جیسے مفت گیس کنکشن، راشن، زچگی امداد 5000 روپے، یا سلائی کا کام؟',
  en: 'Hello Sister! I am Seva Didi. What help do you need? Free cooking gas connection, ration card, maternity aid ₹5,000, or tailoring training?',
  'hi-Latn': 'Namaste Didi! Main Seva Didi hoon. Bataiye aapko kya madad chahiye? Jaise free gas connection, ration, maternity help 5000, ya silai ka kaam?',
  'ta-Latn': 'Vanakkam Akka! Naan Seva Didi. Ungalukku enna udhavi venum? Free gas connection, ration, maternity aid 5000, illa tailoring training-aa?'
};

export const LANGUAGE_SCHEME_INTRO_SPEECH = {
  'pmuy-new-connection': {
    hi: 'दीदी, प्रधानमंत्री उज्ज्वला योजना में महिलाओं को मुफ्त गैस कनेक्शन और पहला भरा हुआ सिलेंडर मिलता है। क्या आपके घर में पहले से गैस कनेक्शन है?',
    bn: 'দিদি, প্রধানমন্ত্রী উজ্জ্বলা যোজনায় মহিলাদের বিনামূল্যে গ্যাস কানেকশন ও সিলিন্ডার পাওয়া যায়। আপনার বাড়িতে কি আগে থেকেই গ্যাস কানেকশন আছে?',
    ta: 'அம்மா, பிரதம மந்திரி உஜ்வலா திட்டத்தில் பெண்களுக்கு இலவச கேஸ் இணைப்பு மற்றும் முதல் சிலிண்டர் கிடைக்கும். உங்கள் வீட்டில் ஏற்கனவே கேஸ் இணைப்பு உள்ளதா?',
    te: 'అక్కా, ప్రధాన మంత్రి ఉజ్జ్వల పథకంలో మహిళలకు ఉచిత గ్యాస్ కనెక్షన్ మరియు మొదటి సిలిండర్ లభిస్తుంది. మీ ఇంట్లో ఇప్పటికే గ్యాస్ కనెక్షన్ ఉందా?',
    mr: 'ताई, प्रधानमंत्री उज्ज्वला योजनेअंतर्गत महिलांना मोफत गॅस कनेक्शन आणि पहिला भरलेला सिलेंडर मिळतो. तुमच्या घरी आधीपासून गॅस कनेक्शन आहे का?',
    kn: 'ಅಕ್ಕಾ, ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆಯಲ್ಲಿ ಮಹಿಳೆಯರಿಗೆ ಉಚಿತ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಸಿಗುತ್ತದೆ. ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಇದೆಯೇ?',
    gu: 'બહેન, પ્રધાનમંત્રી ઉજ્જ્વલા યોજનામાં મહિલાઓને મફત ગેસ કનેક્શન મળે છે. શું તમારા ઘરમાં પહેલેથી ગેસ કનેક્શન છે?',
    ml: 'ചേച്ചീ, പ്രധാനമന്ത്രി ഉജ്ജ്വല പദ്ധതിയിൽ സൗജന്യ ഗ്യാസ് കണക്ഷൻ ലഭിക്കും. നിങ്ങളുടെ വീട്ടിൽ ഇതിനകം ഗ്യാസ് കണക്ഷൻ ഉണ്ടോ?',
    pa: 'ਭੈਣ ਜੀ, ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਉੱਜਵਲਾ ਯੋਜਨਾ ਵਿੱਚ ਔਰਤਾਂ ਨੂੰ ਮੁਫ਼ਤ ਗੈਸ ਕਨੈਕਸ਼ਨ ਮਿਲਦਾ ਹੈ। ਕੀ ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਗੈਸ ਕਨੈਕਸ਼ਨ ਹੈ?',
    or: 'ଭଉଣୀ, ପ୍ରଧାନମନ୍ତ୍ରୀ ଉଜ୍ଜ୍ୱଳା ଯୋଜନାରେ ମହିଳାମାନଙ୍କୁ ମାଗଣା ଗ୍ୟାସ ସଂଯୋଗ ମିଳେ। ଆପଣଙ୍କ ଘରେ ପୂର୍ବରୁ ଗ୍ୟାସ ସଂଯୋଗ ଅଛି କି?',
    as: 'বাইদেউ, প্ৰধানমন্ত্ৰী উজ্জ্বলা যোজনাত বিনামূলীয়া গেছ সংযোগ পোৱা যায়। আপোনাৰ ঘৰত ইতিমধ্যে গেছ সংযোগ আছে নেকি?',
    ur: 'باجی، پردھان منتری اجولا یوجنا میں خواتین کو مفت گیس کنکشن ملتا ہے۔ کیا آپ کے گھر میں پہلے سے گیس کنکشن ہے؟',
    en: 'Sister, PM Ujjwala Yojana provides a free LPG connection to women. Does your home already have a gas connection?',
    'hi-Latn': 'Didi, PM Ujjwala Yojana mein mahilaon ko free gas connection milta hai. Kya aapke ghar mein pehle se gas connection hai?',
    'ta-Latn': 'Akka, PM Ujjwala thittathula free gas connection kedaikkum. Unga veetla already gas connection irukka?'
  },
  'skill-india': {
    hi: 'दीदी, स्किल इंडिया और प्रधानमंत्री कौशल विकास योजना में महिलाओं को मुफ्त सिलाई और हुनर सिखाया जाता है। क्या आप मुफ्त सिलाई या हुनर सीखना चाहती हैं?',
    bn: 'দিদি, স্কিল ইন্ডিয়া যোজনায় মহিলাদের বিনামূল্যে সেলাই ও কাজের প্রশিক্ষণ দেওয়া হয়। আপনি কি বিনামূল্যে সেলাই বা কাজ শিখতে চান?',
    ta: 'அம்மா, ஸ்கில் இந்தியா திட்டத்தில் பெண்களுக்கு இலவச தையல் மற்றும் தொழில் பயிற்சி அளிக்கப்படுகிறது. நீங்கள் இலவசமாக தையல் பயிற்சி பெற விரும்புகிறீர்களா?',
    te: 'అక్కా, స్కిల్ ఇండియా పథకంలో మహిళలకు ఉచిత కుట్టు పని మరియు నైపుణ్య శిక్షణ ఇస్తారు. మీరు ఉచిత కుట్టు పని నేర్చుకోవాలనుకుంటున్నారా?',
    mr: 'ताई, स्किल इंडिया अंतर्गत महिलांना मोफत शिवणकाम आणि व्यवसाय प्रशिक्षण दिले जाते. तुम्हाला मोफत शिलाई काम शिकायचे आहे का?',
    kn: 'ಅಕ್ಕಾ, ಸ್ಕಿಲ್ ಇಂಡಿಯಾ ಯೋಜನೆಯಲ್ಲಿ ಮಹಿಳೆಯರಿಗೆ ಉಚಿತ ಹೊಲಿಗೆ ತರಬೇತಿ ನೀಡಲಾಗುತ್ತದೆ. ನೀವು ಉಚಿತ ಹೊಲಿಗೆ ಕಲಿಯಲು ಬಯಸುವಿರಾ?',
    gu: 'બહેન, સ્કિલ ઇન્ડિયા યોજનામાં મહિલાઓને મફત સીવણ અને હુનર શીખવવામાં આવે છે. શું તમે મફત સીવણ કામ શીખવા માંગો છો?',
    ml: 'ചേച്ചീ, സ്കിൽ ഇന്ത്യ പദ്ധതിയിൽ സൗജന്യ തയ്യൽ പരിശീലനം നൽകുന്നു. നിങ്ങൾക്ക് സൗജന്യമായി തയ്യൽ പഠിക്കണമെന്നുണ്ടോ?',
    pa: 'ਭੈਣ ਜੀ, ਸਕਿੱਲ ਇੰਡੀਆ ਤਹਿਤ ਔਰਤਾਂ ਨੂੰ ਮੁਫ਼ਤ ਸਿਲਾਈ ਅਤੇ ਹੁਨਰ ਸਿਖਾਇਆ ਜਾਂਦਾ ਹੈ। ਕੀ ਤੁਸੀਂ ਮੁਫ਼ਤ ਸਿਲਾਈ ਸਿੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
    or: 'ଭଉଣୀ, ସ୍କିଲ ଇଣ୍ଡିଆ ଯୋଜନାରେ ମହିଳାମାନଙ୍କୁ ମାଗଣା ସିଲେଇ ତାଲିମ ଦିଆଯାଏ। ଆପଣ ମାଗଣାରେ ସିଲେଇ ଶିଖିବାକୁ ଚାହାଁନ୍ତି କି?',
    as: 'বাইদেউ, স্কিল ইণ্ডিয়া যোজনাত বিনামূলীয়া চিলাই প্ৰশিক্ষণ দিয়া হয়। আপুনি বিনামূলীয়া চিলাই শিকিব বিচাৰে নেকি?',
    ur: 'باجی، اسکل انڈیا میں خواتین کو مفت سلائی اور ہنر سکھایا جاتا ہے۔ کیا آپ مفت سلائی کا کام سیکھنا چاہتی ہیں؟',
    en: 'Sister, Skill India offers free tailoring and vocational training for women. Do you want to learn free tailoring or crafts?',
    'hi-Latn': 'Didi, Skill India mein mahilaon ko free silai training di jaati hai. Kya aap free silai ya hunar seekhna chahti hain?',
    'ta-Latn': 'Akka, Skill India-la free-aa tailoring thittam irukku. Neenga free tailoring kathukka aasaipadreengala?'
  },
  'pmmvy': {
    hi: 'दीदी, प्रधानमंत्री मातृ वंदना योजना में गर्भवती माताओं को ₹5,000 की नकद सहायता सीधे बैंक में मिलती है। क्या यह आपका पहला या दूसरा बच्चा है?',
    bn: 'দিদি, প্রধানমন্ত্রী মাতৃ বন্দনা যোজনায় গর্ভবতী মায়েদের ৫০০০ টাকা সরাসরি ব্যাংক একাউন্টে দেওয়া হয়। এটা কি আপনার প্রথম বা দ্বিতীয় সন্তান?',
    ta: 'அம்மா, மாத்ரு வந்தனா திட்டத்தில் கர்ப்பிணி பெண்களுக்கு ரூ.5000 உதவித்தொகை நேரடியாக வங்கியில் கிடைக்கும். இது உங்கள் முதல் அல்லது இரண்டாவது குழந்தையா?',
    te: 'అక్కా, ప్రధాన మంత్రి మాతృ వందన పథకంలో గర్భిణులకు రూ.5000 నేరుగా బ్యాంకు ఖాతాలో అందుతాయి. ఇది మీ మొదటి లేదా రెండవ బిడ్డా?',
    mr: 'ताई, प्रधानमंत्री मातृ वंदना योजनेअंतर्गत गरोदर मातांना ₹५००० ची मदत थेट बँक खात्यात मिळते. हे तुमचे पहिले किंवा दुसरे बाळ आहे का?',
    kn: 'ಅಕ್ಕಾ, ಮಾತೃ ವಂದನಾ ಯೋಜನೆಯಲ್ಲಿ ಗರ್ಭಿಣಿ ತಾಯಂದಿರಿಗೆ ₹5000 ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಮೊದಲ ಅಥವಾ ಎರಡನೇ ಮಗುವಾ?',
    gu: 'બહેન, પ્રધાનમંત્રી માતૃ વંદના યોજનામાં સગર્ભા માતાઓને ₹૫૦૦૦ ની સહાય સીધી બેંક ખાતામાં મળે છે. શું આ તમારું પહેલું કે બીજું બાળક છે?',
    ml: 'ചേച്ചീ, മാതൃ വന്ദന പദ്ധതിയിൽ ഗർഭിണികൾക്ക് 5000 രൂപ നേരിട്ട് ബാങ്കിൽ ലഭിക്കും. ഇത് നിങ്ങളുടെ ഒന്നാമത്തെയോ രണ്ടാമത്തെയോ കുട്ടിയാണോ?',
    pa: 'ਭੈਣ ਜੀ, ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਮਾਤਰੂ ਵੰਦਨਾ ਯੋਜਨਾ ਵਿੱਚ ਗਰਭਵਤੀ ਔਰਤਾਂ ਨੂੰ ₹5000 ਦੀ ਸਹਾਇਤਾ ਸਿੱਧੀ ਬੈਂਕ ਵਿੱਚ ਮਿਲਦੀ ਹੈ। ਕੀ ਇਹ ਤੁਹਾਡਾ ਪਹਿਲਾ ਜਾਂ ਦੂਜਾ ਬੱਚਾ ਹੈ?',
    or: 'ଭଉଣୀ, ପ୍ରଧାନମନ୍ତ୍ରୀ ମାତୃ ବନ୍ଦନା ଯୋଜନାରେ ଗର୍ଭବତୀ ମାଆମାନଙ୍କୁ ୫୦୦୦ ଟଙ୍କା ସିଧା ବ୍ୟାଙ୍କ ଖାତାରେ ମିଳେ। ଏହା ଆପଣଙ୍କର ପ୍ରଥମ ବା ଦ୍ୱିତୀୟ ସନ୍ତାନ କି?',
    as: 'বাইদেউ, প্ৰধানমন্ত্ৰী মাতৃ বন্দনা যোজনাত গৰ্ভৱতী মহিলাক ৫০০০ টকা পোনে পোনে বেংক একাউণ্টত দিয়া হয়। এইটো আপোনাৰ প্ৰথম নে দ্বিতীয় সন্তান?',
    ur: 'باجی، پردھان منتری ماترو وندنا یوجنا میں حاملہ خواتین کو 5000 روپے سیدھے بینک اکاؤنٹ میں ملتے ہیں۔ کیا یہ آپ کا پہلا یا دوسرا بچہ ہے؟',
    en: 'Sister, PM Matru Vandana Yojana provides ₹5,000 cash assistance directly to bank accounts for pregnant mothers. Is this your first or second child?',
    'hi-Latn': 'Didi, PM Matru Vandana Yojana mein pregnant mothers ko 5000 rupaye seedhe bank account mein milte hain. Kya ye aapka pehla ya doosra bachha hai?',
    'ta-Latn': 'Akka, PM Matru Vandana thittathula 5000 rupees direct-aa bank account-ku varum. Idhu unga mudhal illa randaavathu kozhandhaiya?'
  },
  'safety': {
    hi: 'दीदी, महिला सुरक्षा हेल्पलाइन 181 पर चौबीसों घंटे मुफ्त पुलिस और सुरक्षा सहायता मिलती है। आप कभी भी सीधे 181 पर कॉल कर सकती हैं।',
    bn: 'দিদি, মহিলা হেল্পলাইন ১৮১ নম্বরে ২৪ ঘণ্টা বিনামূল্যে পুলিশ ও নিরাপত্তা সহায়তা পাওয়া যায়। আপনি সরাসরি ১৮১ নম্বরে ফোন করতে পারেন।',
    ta: 'அம்மா, பெண்கள் உதவி எண் 181-ல் 24 மணி நேரமும் இலவச போலீஸ் மற்றும் அவசர உதவி கிடைக்கும். நீங்கள் உடனடியாக 181 எண்ணை அழைக்கலாம்.',
    te: 'అక్కా, మహిళా హెల్ప్‌లైన్ 181 ద్వారా 24 గంటలూ ఉచిత పోలీస్ మరియు అత్యవసర భద్రతా సహాయం అందుబాటులో ఉంది. మీరు నేరుగా 181 కు కాల్ చేయవచ్చు.',
    mr: 'ताई, महिला हेल्पलाइन १८१ वर २४ तास मोफत पोलीस आणि सुरक्षा मदत उपलब्ध आहे. तुम्ही त्वरित १८१ वर फोन करू शकता.',
    kn: 'ಅಕ್ಕಾ, ಮಹಿಳಾ ಸಹಾಯವಾಣಿ 181 ರಲ್ಲಿ 24 ಗಂಟೆಯೂ ಉಚಿತ ಪೊಲೀಸ್ ಮತ್ತು ರಕ್ಷಣಾ ಸಹಾಯ ಸಿಗುತ್ತದೆ. ನೀವು ನೇರವಾಗಿ 181 ಗೆ ಕರೆ ಮಾಡಬಹುದು.',
    gu: 'બહેન, મહિલા હેલ્પલાઇન 181 પર 24 કલાક મફત પોલીસ અને સુરક્ષા સહાય મળે છે. તમે સીધા 181 પર ફોન કરી શકો છો.',
    ml: 'ചേച്ചീ, വനിതാ ഹെൽപ്പ്‌ലൈൻ 181 ൽ 24 മണിക്കൂറും സൗജന്യ പോലീസും സുരക്ഷാ സഹായവും ലഭിക്കും. നിങ്ങൾക്ക് നേരിട്ട് 181 ലേക്ക് വിളിക്കാം.',
    pa: 'ਭੈਣ ਜੀ, ਮਹਿਲਾ ਹੈਲਪਲਾਈਨ 181 ਉੱਤੇ 24 ਘੰਟੇ ਮੁਫ਼ਤ ਪੁਲਿਸ ਅਤੇ ਸੁਰੱਖਿਆ ਸਹਾਇਤਾ ਮਿਲਦੀ ਹੈ। ਤੁਸੀਂ ਸਿੱਧਾ 181 ਡਾਇਲ ਕਰ ਸਕਦੇ ਹੋ।',
    or: 'ଭଉଣୀ, ମହିଳା ହେଲ୍ପଲାଇନ ୧୮୧ ରେ ୨୪ ଘଣ୍ଟା ମାଗଣା ପୋଲିସ ଓ ସୁରକ୍ଷା ସହାୟତା ମିଳେ। ଆପଣ ସିଧାସଳଖ ୧୮୧ କୁ କଲ୍ କରିପାରିବେ।',
    as: 'বাইদেউ, মহিলা হেল্পলাইন ১৮১ নম্বৰত ২৪ ঘণ্টাই বিনামূলীয়া আৰক্ষী আৰু সুৰক্ষা সাহায্য পোৱা যায়। আপুনি পোনে পোনে ১৮১ নম্বৰত ফোন কৰিব পাৰে।',
    ur: 'باجی، خواتین ہیلپ لائن 181 پر 24 گھنٹے مفت پولیس اور سیکیورٹی امداد دستیاب ہے۔ آپ فوری طور پر 181 پر کال کر سکتی ہیں۔',
    en: 'Sister, Women Helpline 181 provides 24x7 free emergency and police protection. You can dial 181 anytime without internet.',
    'hi-Latn': 'Didi, Women Helpline 181 par 24 ghante free safety aur police help milti hai. Aap abhi seedhe 181 dial kar sakti hain.',
    'ta-Latn': 'Akka, Women Helpline 181-la 24x7 free safety and police help kedaikkum. Neenga direct-aa 181 call pannalaam.'
  }
};

const GAS_KEYWORDS = [
  'गैस', 'सिलेंडर', 'चूल्हा', 'उज्ज्वला', 'कनेक्शन', 'एलपीजी',
  'gas', 'cylinder', 'stove', 'ujjwala', 'pmuy', 'lpg', 'chulha',
  'கேஸ்', 'சிலிண்டர்', 'அடுப்பு', 'உஜ்வலா', 'இணைப்பு',
  'గ్యాస్', 'సిలిండర్', 'పొయ్యి', 'ఉజ్జ్వల', 'కనెక్షన్',
  'গ্যাস', 'সিলিন্ডার', 'উনুন', 'উজ্জ্বলা', 'সংযোগ',
  'गॅस', 'सिलेंडर', 'शेगडी', 'उज्ज्वला',
  'ಗ್ಯಾಸ್', 'ಸಿಲಿಂಡರ್', 'ಒಲೆ', 'ಉಜ್ವಲ',
  'ગેસ', 'સિલિન્ડર', 'ચૂલો', 'ઉજ્જ્વલા',
  'ഗ്യാസ്', 'സിലിണ്ടർ', 'അടുപ്പ്', 'ഉജ്ജ്വല',
  'ਗੈਸ', 'ਸਿਲੰਡਰ', 'ਚੁੱਲ੍ਹਾ', 'ਉੱਜਵਲਾ',
  'ଗ୍ୟାସ', 'ସିଲିଣ୍ଡର', 'ଚୁଲି', 'ଉଜ୍ଜ୍ୱଳା',
  'গেছ', 'চিলিণ্ডাৰ', 'চৌকা',
  'گیس', 'سلنڈر', 'چولہا', 'اجولا'
];

const SKILL_KEYWORDS = [
  'सिलाई', 'कढ़ाई', 'हुनर', 'काम', 'ट्रेनिंग', 'कौशल', 'मशीन', 'दर्जी', 'रोजगार', 'सिलाई मशीन',
  'skill', 'tailor', 'tailoring', 'sewing', 'machine', 'craft', 'training', 'job', 'work', 'hunar', 'kam', 'silai',
  'தையல்', 'பயிற்சி', 'திறன்', 'மெஷின்', 'தையற்கலை', 'வேலை',
  'కుట్టు', 'పని', 'శిక్షణ', 'నైపుణ్యం', 'మిషన్', 'టైలరింగ్',
  'সেলাই', 'কাজ', 'প্রশিক্ষণ', 'দক্ষতা', 'মেশিন', 'দর্জি',
  'शिलाई', 'काम', 'प्रशिक्षण', 'कौशल्य', 'शिवणकाम',
  'ಹೊಲಿಗೆ', 'ಕೆಲಸ', 'ತರಬೇತಿ', 'ಕೌಶಲ್ಯ',
  'સીવણ', 'કામ', 'તાલીમ', 'કૌશલ્ય',
  'തയ്യൽ', 'ജോലി', 'പരിശീലനം',
  'ਸਿਲਾਈ', 'ਕੰਮ', 'ਸਿਖਲਾਈ', 'ਹੁਨਰ',
  'ਸିଲେଇ', 'କାମ', 'ପ୍ରଶିକ୍ଷଣ', 'ଦକ୍ଷତା',
  'চিলাই', 'কাম', 'প্ৰশিক্ষণ',
  'سلائی', 'کام', 'تربیت', 'ہنر'
];

const MATERNITY_KEYWORDS = [
  'गर्भवती', 'मातृत्व', 'बच्चा', 'शिशु', 'पोषण', 'जच्चा', 'प्रसव', '5000', 'मातृ वंदना', 'मातृ',
  'pregnant', 'pregnancy', 'maternity', 'baby', 'child', 'nutrition', 'pmmvy', '5000', 'delivery',
  'கர்ப்பிணி', 'பிரசவம்', 'குழந்தை', 'தாய்மை', 'சத்துணவு',
  'గర్భిణి', 'ప్రసవం', 'బిడ్డ', 'పోషణ', 'తల్లి',
  'গর্ভবতী', 'প্রসব', 'সন্তান', 'শিশু', 'পুষ্টি', 'মা',
  'गरोदर', 'मातृत्व', 'बाळ', 'पोषण', 'प्रसूती',
  'ಗರ್ಭಿಣಿ', 'ಹೆರಿಗೆ', 'ಮಗು', 'ಪೋಷಣೆ', 'ತಾಯಿ',
  'સગર્ભા', 'પ્રસુતિ', 'બાળક', 'પોષણ', 'માતા',
  'ഗർഭിണി', 'പ്രസവം', 'കുഞ്ഞ്', 'മാതൃത്വം',
  'ਗਰਭਵਤੀ', 'ਜਣੇਪਾ', 'ਬੱਚਾ', 'ਪੋਸ਼ਣ', 'ਮਾਂ',
  'ଗର୍ଭବତୀ', 'ପ୍ରସବ', 'ଶିଶୁ', 'ପୋଷଣ',
  'গৰ্ভৱতী', 'প্ৰসৱ', 'শিশু',
  'حاملہ', 'زچگی', 'بچہ', 'ماں'
];

const SAFETY_KEYWORDS = [
  'सुरक्षा', 'मदद', 'पुलिस', '181', 'हिंसा', 'परेशानी', 'हेल्पलाइन', 'डर', 'खतरा',
  'safety', 'help', 'emergency', 'police', '181', 'danger', 'helpline',
  'பாதுகாப்பு', 'உதவி', 'போலீஸ்',
  'భద్రత', 'సహాయం', 'పోలీస్',
  'নিরাপত্তা', 'সাহায্য', 'পুলিশ',
  'सुरक्षा', 'मदत', 'पोलीस',
  'ರಕ್ಷಣೆ', 'ಭದ್ರತೆ', 'ಸಹಾಯ',
  'સુરક્ષા', 'મદદ', 'પોલીસ',
  'സുരക്ഷ', 'സഹായം',
  'ਸੁਰੱਖਿਆ', 'ਮਦਦ', 'ਪੁਲਿਸ',
  'ସୁରକ୍ଷା', 'ସାହାଯ୍ୟ', 'ପୋଲିସ',
  'নিৰাপত্তা', 'সহায়',
  'حفاظت', 'مدد', 'پولیس'
];

const RATION_KEYWORDS = [
  'राशन', 'अनाज', 'गेहूं', 'चावल', 'कोटा', 'खाद्य', 'खाद्य सुरक्षा',
  'ration', 'food', 'grain', 'rice', 'wheat', 'nfsa',
  'ரேஷன்', 'அரிசி', 'உணவு',
  'రేషన్', 'బియ్యం', 'ఆహారం',
  'রেশন', 'চাল', 'গম', 'খাদ্য',
  'रेशन', 'धान्य', 'अन्न',
  'ರೇಷನ್', 'ಅಕ್ಕಿ', 'ಆಹಾರ',
  'રાશન', 'અનાજ', 'ઘઉં',
  'റേഷൻ', 'അരി', 'ഭക്ഷ്യം',
  'ਰਾਸ਼ਨ', 'ਕਣਕ', 'ਚੌਲ',
  'ରାସନ', 'ଚାଉଳ', 'ଗହମ',
  'ৰেচন', 'চাউল',
  'راشن', 'اناج', 'گندم'
];

const BANK_KEYWORDS = [
  'बैंक', 'खाता', 'जन धन', 'पैसा', 'बचत', 'पासबुक',
  'bank', 'account', 'money', 'jan dhan', 'savings', 'passbook',
  'வங்கி', 'கணக்கு', 'பணம்',
  'బ్యాంక్', 'ఖాతా', 'డబ్బులు',
  'ব্যাংক', 'একাউন্ট', 'টাকা',
  'बँक', 'खाते', 'पैसे',
  'ಬ್ಯಾಂಕ್', 'ಖಾತೆ', 'ಹಣ',
  'બેંક', 'ખાતું', 'પૈસા',
  'ബാങ്ക്', 'അക്കൗണ്ട്', 'പണം',
  'ਬੈਂਕ', 'ਖਾਤਾ', 'ਪੈਸੇ',
  'ବ୍ୟାଙ୍କ', 'ଖାତା', 'ଟଙ୍କା',
  'বেংক', 'একাউণ্ট', 'টকা',
  'بینک', 'کھاتہ', 'پیسہ'
];

const copy = {
  hi: {
    code: 'HI',
    label: 'हिंदी',
    brand: 'सेवा दीदी',
    brandSub: 'सरकारी मदद, आपकी भाषा में',
    help: 'मदद',
    practice: 'सुरक्षित मार्गदर्शन · आवेदन आधिकारिक PMUY वेबसाइट पर होगा',
    today: 'आज की मदद',
    heroTitle: 'गैस कनेक्शन के लिए सही कदम समझें।',
    heroBody: 'आप हिंदी में बोल सकती हैं या लिख सकती हैं। मैं आपको धीरे-धीरे बताऊंगी।',
    scheme: 'प्रधानमंत्री उज्ज्वला योजना',
    schemeSub: 'घर में LPG कनेक्शन की जानकारी',
    tellMe: 'मुझे बताइए',
    speakAsk: 'बोलकर पूछें',
    listening: 'मैं सुन रही हूँ…',
    tapToSpeak: 'दबाकर बोलें',
    orWrite: 'या लिखिए',
    inputPlaceholder: 'जैसे: मुझे गैस कनेक्शन चाहिए',
    send: 'भेजें',
    heard: 'आपने कहा',
    clear: 'हटाएं',
    threeSteps: '3 छोटे कदम',
    threeStepsSub: 'सवाल  →  कागज़  →  अगला कदम',
    seeDemo: 'पक्का',
    startJourney: 'आगे',
    back: 'वापस',
    continue: 'आगे',
    greeting: 'नमस्ते।',
    welcomePrompt: 'बोलिए, दीदी।',
    step: 'कदम',
    of: 'में से',
    stepNames: ['घर की जानकारी', 'कागज़ तैयार रखें', 'अगला कदम'],
    questionTitle: 'क्या आपके घर में अभी गैस कनेक्शन है?',
    questionHint: 'एक जवाब चुनिए। इससे हम सही जानकारी दिखाएंगे।',
    no: 'नहीं',
    noSub: 'अभी गैस कनेक्शन नहीं है',
    yes: 'हाँ',
    yesSub: 'पहले से कनेक्शन है',
    goodTitle: 'बहुत अच्छा — हम आगे बढ़ सकते हैं।',
    goodBody: 'उज्ज्वला योजना उन परिवारों के लिए है जिनके घर में अभी LPG कनेक्शन नहीं है।',
    okayTitle: 'कोई बात नहीं।',
    okayBody: 'इस योजना के लिए नज़दीकी गैस एजेंसी से अपनी स्थिति पूछें।',
    hearQuestion: 'सवाल सुनें',
    documentsTitle: 'ये कागज़ साथ रखें।',
    documentsBody: 'असली आवेदन में ये चीज़ें मांगी जा सकती हैं। इस ऐप में कुछ अपलोड नहीं करना है।',
    doc1: 'आधार कार्ड',
    doc2: 'राशन कार्ड या परिवार की जानकारी',
    doc3: 'पता अलग हो तो पता प्रमाण',
    doc4: 'बैंक खाते की जानकारी',
    doc5: 'KYC फॉर्म और वंचना घोषणा',
    privateTitle: 'आपकी जानकारी यहीं रहती है',
    privateBody: 'यह ऐप कोई निजी जानकारी सेव नहीं करता।',
    nextTitle: 'अब आपको कहाँ जाना है?',
    nextBody: 'अपने गाँव या नज़दीकी LPG वितरक के पास जाकर यह बात कहें:',
    sayThis: '“मुझे प्रधानमंत्री उज्ज्वला योजना के बारे में जानकारी चाहिए।”',
    readAloud: 'बोलकर सुनें',
    bring: 'कागज़ साथ ले जाएं',
    askHelp: 'मदद मांगना ठीक है',
    finish: 'मैंने समझ लिया',
    doneTitle: 'अब अगला कदम साफ़ है।',
    doneBody: 'आप जानती हैं कि कहाँ जाना है और क्या पूछना है। यह स्क्रीन किसी भरोसेमंद व्यक्ति को भी दिखा सकती हैं।',
    restart: 'फिर से शुरू करें',
    safetyTitle: 'आपकी सुरक्षा पहले',
    safetyBody: 'सेवा दीदी आपसे OTP, PIN या बैंक पासवर्ड कभी नहीं पूछेगी।',
    close: 'बंद करें',
    guidanceReady: 'सेवा दीदी तैयार है',
    regionalGroup: 'भारतीय भाषाएँ',
    codeMixedGroup: 'मिश्रित भाषा में बोलें',
    onboardingLanguage: 'अपनी भाषा चुनिए',
    offlineReadyTitle: 'इंटरनेट के बिना भी शुरुआत कर सकती हैं',
    offlineReadyBody: 'ज़रूरी कदम और कागज़ों की जानकारी इसी फोन में उपलब्ध रहेगी। AI जवाब और सरकारी वेबसाइट के लिए इंटरनेट चाहिए।',
    offlineTitle: 'आप अभी ऑफलाइन हैं',
    offlineBody: 'ज़रूरी मार्गदर्शन जारी है। लाइव AI जवाब और आधिकारिक वेबसाइट के लिए इंटरनेट चालू करें।',
    offlineAction: 'इंटरनेट मदद',
    internetTitle: 'इंटरनेट चालू करें',
    internetBody: 'मोबाइल डेटा या Wi‑Fi चालू करें। आपका काम इस फोन में सुरक्षित रहेगा। फिर दोबारा कोशिश करें।',
    internetAction: 'दोबारा जाँचें',
    serviceUnavailable: 'सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर कोशिश करें।',
    official: 'आधिकारिक वेबसाइट खोलें',
    voiceUnavailable: 'इस ब्राउज़र में आवाज़ से पूछना उपलब्ध नहीं है। नीचे लिखकर पूछें।',
    backendUnavailable: 'सेवा से जुड़ने में समस्या है। आप थोड़ी देर बाद फिर कोशिश कर सकती हैं।',
    services: 'सभी सेवाएं',
    catalogTitle: 'महिलाओं के लिए सरकारी मदद',
    catalogBody: 'सुरक्षा, स्वास्थ्य, पैसे, काम और परिवार की ज़रूरी सेवाएं एक जगह खोजिए।',
    browseServices: 'सभी मदद देखें',
    searchServices: 'क्या चाहिए? जैसे नौकरी, इलाज, बैंक, सुरक्षा',
    allServices: 'सब',
    resourceCount: 'मदद के रास्ते',
    openOfficial: 'आधिकारिक वेबसाइट',
    callNow: 'कॉल करें',
    resourceWhatFor: 'यह किस काम आता है',
    resourceNextStep: 'अभी क्या करें',
    directoryOffline: 'यह सूची इस फोन में उपलब्ध है। असली आवेदन या कॉल के लिए इंटरनेट की जरूरत हो सकती है।',
    datasetMatches: 'और सरकारी योजनाएं',
    datasetMatch: 'योजना डेटाबेस',
    datasetSearching: 'और योजनाएं खोजी जा रही हैं…',
    datasetSource: 'यह जानकारी आधिकारिक पेज पर जांचें।',
    datasetState: 'राज्य',
    backHome: 'सेवा दीदी पर वापस जाएं',
    noMatches: 'इस शब्द से कोई मदद नहीं मिली। दूसरा आसान शब्द लिखिए।',
    guideWithSaheli: 'सेवा दीदी से समझें',
    helplineLabel: 'उज्ज्वला हेल्पलाइन',
    helplineNumber: '14428',
    oneMoment: 'थोड़ा रुकिए…',

    // Enhanced Onboarding
    onboardingStepCount: '4 में से',
    onboardingStep1Title: 'अपनी भाषा चुनिए',
    onboardingStep1Sub: 'जिस भाषा में आप आसानी से बात करती हैं, उसे दबाएं।',
    onboardingStep2Title: 'बोलना बहुत आसान है',
    onboardingStep2Sub: 'कोई फॉर्म नहीं भरना, कोई टाइपिंग नहीं। बस बड़ा बटन दबाएं और अपनी दीदी की तरह बात करें।',
    onboardingVoiceTip: 'जैसे अपनी दीदी या पड़ोसी से बात करती हैं, वैसे बोलिए।',
    onboardingTryVoice: 'बोलकर देखें',
    onboardingListenGuide: 'निर्देश सुनें',
    onboardingStep3Title: '100% ऑफ़लाइन व सुरक्षित',
    onboardingStep3Sub: 'बिना इंटरनेट के भी सरकारी योजनाओं की पूरी जानकारी आपके फोन में रहेगी।',
    onboardingOfflinePoint1: 'कागज़ात, पात्रता और क्या बोलना है — सब बिना इंटरनेट खुलेगा',
    onboardingOfflinePoint2: 'कभी OTP, पासवर्ड या बैंक डिटेल नहीं मांगा जाएगा',
    onboardingOfflinePoint3: 'सरकारी वेबसाइट के लिए जब इंटरनेट चाहिए होगा, हम आपसे पहले पूछेंगे',
    onboardingStep4Title: 'आज किस चीज़ में मदद चाहिए?',
    onboardingStep4Sub: 'एक ज़रूरी योजना चुनें या बोलकर शुरू करें:',
    onboardingCardGas: 'रसोई गैस कनेक्शन',
    onboardingCardGasSub: 'उज्ज्वला योजना — नया गैस सिलेंडर',
    onboardingCardSkill: 'सिलाई व हुनर सीखना',
    onboardingCardSkillSub: 'स्किल इंडिया — मुफ्त ट्रेनिंग व काम',
    onboardingCardMaternity: 'मातृत्व सहायता ₹5,000',
    onboardingCardMaternitySub: 'PMMVY — गर्भवती माताओं को मदद',
    onboardingCardSafety: 'महिला सुरक्षा हेल्पलाइन',
    onboardingCardSafetySub: '181 — 24 घंटे तुरंत सुरक्षा सहायता',
    onboardingStartMic: 'माइक दबाकर शुरू करें',

    // Quick suggestions on home
    quickSuggestions: 'जल्दी पूछने के लिए दबाएं:',
    quickPromptGas: 'गैस कनेक्शन चाहिए',
    quickPromptSkill: 'सिलाई या काम सीखना है',
    quickPromptMaternity: 'मातृत्व सहायता ₹5000',
    quickPromptRation: 'मुफ्त राशन की जानकारी',
    quickPromptSafety: 'महिला सुरक्षा 181',
    quickPromptBank: 'जन धन बैंक खाता',

    // Connection badge
    offlineBadge: 'ऑफ़लाइन (फोन में सुरक्षित)',
    onlineBadge: 'ऑनलाइन कनेक्टेड',

    // Enhanced Internet Modal
    internetModalTitle: 'सरकारी वेबसाइट के लिए इंटरनेट चाहिए',
    internetModalBody: 'इस आधिकारिक सरकारी पोर्टल को खोलने के लिए कृपया अपने फोन में मोबाइल डेटा या Wi-Fi चालू करें। आपका सारा रिकॉर्ड इस फोन में सुरक्षित रहेगा।',
    internetModalActionRetry: 'मैंने इंटरनेट चालू कर दिया (दोबारा जांचें)',
    internetModalActionCall: 'बिना इंटरनेट सीधे फोन कॉल करें',
    internetModalActionBack: 'वापस जाएं (ऑफ़लाइन रहें)',
    internetModalTipData: 'फोन की सेटिंग में मोबाइल डेटा चालू करें',
    internetModalTipWifi: 'या घर / पड़ोस का Wi-Fi जोड़ें',

    // Skills guided journey
    skillTitle: 'स्किल इंडिया — सिलाई व हुनर',
    skillSub: 'मुफ्त सिलाई, ब्यूटी व आजीविका ट्रेनिंग',
    skillQuestionTitle: 'क्या आप मुफ्त सिलाई, ब्यूटी या कोई काम सीखना चाहती हैं?',
    skillQuestionHint: 'एक जवाब चुनिए। इससे हम सही जानकारी दिखाएंगे।',
    skillYes: 'हाँ, सीखना है',
    skillYesSub: 'नया हुनर या सिलाई सीखनी है',
    skillNo: 'अभी नहीं',
    skillNoSub: 'अन्य योजनाएं देखना चाहती हूँ',
    skillGoodTitle: 'बहुत अच्छा — सरकार महिलाओं को मुफ्त ट्रेनिंग और प्रमाण-पत्र देती है।',
    skillGoodBody: 'स्किल इंडिया और आजीविका मिशन के तहत ग्रामीण व शहरी महिलाओं को मुफ्त हुनर सिखाया जाता है।',
    skillOkayTitle: 'कोई बात नहीं।',
    skillOkayBody: 'आप स्वयं सहायता समूह या अन्य सरकारी योजनाओं की जानकारी देख सकती हैं।',
    skillDoc1: 'आधार कार्ड',
    skillDoc2: 'बैंक खाता पासबुक',
    skillDoc3: '2 पासपोर्ट साइज फोटो',
    skillDoc4: 'निवास प्रमाण (आधार काफी है)',
    skillNextTitle: 'कौशल केंद्र या पंचायत में क्या कहें?',
    skillNextBody: 'अपने नज़दीकी PM कौशल विकास केंद्र या ग्राम पंचायत जाकर यह कहें:',
    skillSayThis: '“नमस्ते, मुझे सरकारी कौशल केंद्र या स्वयं सहायता समूह से मुफ्त सिलाई या हुनर सीखने की जानकारी चाहिए।”',

    // Maternity guided journey
    maternityTitle: 'प्रधानमंत्री मातृ वंदना योजना',
    maternitySub: 'गर्भवती और स्तनपान कराने वाली माताओं के लिए ₹5,000',
    maternityQuestionTitle: 'क्या आप गर्भवती हैं या हाल ही में बच्चे को जन्म दिया है?',
    maternityQuestionHint: 'एक जवाब चुनिए। इससे हम सही जानकारी दिखाएंगे।',
    maternityYes: 'हाँ, गर्भवती या नई माँ',
    maternityYesSub: 'मातृत्व सहायता की जानकारी चाहिए',
    maternityNo: 'नहीं',
    maternityNoSub: 'परिवार या अन्य के लिए जानना है',
    maternityGoodTitle: 'बहुत अच्छा — पात्र माताओं को पोषण और स्वास्थ्य के लिए ₹5,000 की सहायता मिलती है।',
    maternityGoodBody: 'यह राशि सीधे बैंक खाते में DBT के माध्यम से आती है।',
    maternityOkayTitle: 'कोई बात नहीं।',
    maternityOkayBody: 'आप अपने परिवार या सहेली के लिए यह जानकारी समझ सकती हैं।',
    maternityDoc1: 'माँ और पति का आधार कार्ड',
    maternityDoc2: 'माँ-बच्चा सुरक्षा कार्ड (MCP कार्ड / जच्चा-बच्चा कार्ड)',
    maternityDoc3: 'माँ के नाम बैंक खाता पासबुक',
    maternityDoc4: 'बच्चे का जन्म प्रमाण (दूसरी किस्त के लिए)',
    maternityNextTitle: 'आंगनवाड़ी या अस्पताल में क्या कहें?',
    maternityNextBody: 'अपनी नज़दीकी आंगनवाड़ी कार्यकर्ता या सरकारी अस्पताल में जाकर यह कहें:',
    maternitySayThis: '“नमस्ते, मुझे प्रधानमंत्री मातृ वंदना योजना (PMMVY) के तहत ₹5,000 मातृत्व सहायता का फॉर्म भरना है।”',
  },
  en: {
    code: 'EN',
    label: 'English',
    brand: 'Seva Didi',
    brandSub: 'Government help, in your language',
    help: 'Help',
    practice: 'Safe guidance · applications continue on the official PMUY site',
    today: "TODAY'S HELP",
    heroTitle: 'Understand the right steps for a gas connection.',
    heroBody: 'You can speak or type in English. I will guide you one small step at a time.',
    scheme: 'Pradhan Mantri Ujjwala Yojana',
    schemeSub: 'Information about an LPG connection at home',
    tellMe: 'Tell me what you need',
    speakAsk: 'Ask by voice',
    listening: 'I am listening…',
    tapToSpeak: 'Tap and speak',
    orWrite: 'OR TYPE',
    inputPlaceholder: 'For example: I need a gas connection',
    send: 'Send',
    heard: 'You said',
    clear: 'Clear',
    threeSteps: '3 small steps',
    threeStepsSub: 'Question  →  Documents  →  Next step',
    seeDemo: 'Confirm',
    startJourney: 'Forward',
    back: 'Back',
    continue: 'Forward',
    greeting: 'Namaste.',
    welcomePrompt: 'Tell me, sister.',
    step: 'Step',
    of: 'of',
    stepNames: ['Household details', 'Keep documents ready', 'Next step'],
    questionTitle: 'Does your home already have a gas connection?',
    questionHint: 'Choose one answer. This helps me show the right information.',
    no: 'No',
    noSub: 'No gas connection yet',
    yes: 'Yes',
    yesSub: 'There is already a connection',
    goodTitle: 'Good — we can continue.',
    goodBody: 'Ujjwala is for families who do not already have an LPG connection at home.',
    okayTitle: 'That is okay.',
    okayBody: 'Ask your nearest gas agency what support is available for this scheme.',
    hearQuestion: 'Hear the question',
    continue: 'Forward',
    documentsTitle: 'Keep these papers with you.',
    documentsBody: 'These may be requested during a real application. You do not upload anything here.',
    doc1: 'Aadhaar card',
    doc2: 'Ration card or family proof',
    doc3: 'Address proof, if the address is different',
    doc4: 'Bank account details',
    doc5: 'KYC form and deprivation declaration',
    privateTitle: 'Your information stays here',
    privateBody: 'This app does not save personal information.',
    nextTitle: 'Where do you go next?',
    nextBody: 'Go to a nearby LPG distributor and say:',
    sayThis: '“I want information about the Pradhan Mantri Ujjwala Yojana.”',
    readAloud: 'Read this aloud',
    bring: 'Carry the papers',
    askHelp: 'It is okay to ask for help',
    finish: 'I understand',
    doneTitle: 'Your next step is clear.',
    doneBody: 'You know where to go and what to ask. You can show this screen to someone you trust.',
    restart: 'Start again',
    safetyTitle: 'Your safety comes first',
    safetyBody: 'Seva Didi will never ask for your OTP, PIN, or bank password.',
    close: 'Close',
    guidanceReady: 'Seva Didi is ready',
    regionalGroup: 'Indian languages',
    codeMixedGroup: 'Code-mixed speech',
    onboardingLanguage: 'Choose your language',
    offlineReadyTitle: 'You can start without internet',
    offlineReadyBody: 'Essential steps and document guidance stay on this phone. Internet is needed for live AI guidance and the official website.',
    offlineTitle: 'You are offline',
    offlineBody: 'Essential guidance still works. Turn on internet for live AI guidance and the official website.',
    offlineAction: 'Internet help',
    internetTitle: 'Turn on internet',
    internetBody: 'Turn on mobile data or Wi‑Fi. Your progress stays on this phone. Then try again.',
    internetAction: 'Check again',
    serviceUnavailable: 'Guidance is temporarily unavailable. Please try again shortly.',
    official: 'Open official website',
    voiceUnavailable: 'Voice input is not available in this browser. Type your question below.',
    backendUnavailable: 'We could not connect to the service. Please try again shortly.',
    services: 'All services',
    catalogTitle: 'Government help for women',
    catalogBody: 'Find essential safety, health, money, work, family, and business services in one place.',
    browseServices: 'See all help',
    searchServices: 'What do you need? For example: job, doctor, bank, safety',
    allServices: 'All',
    resourceCount: 'ways to get help',
    openOfficial: 'Open official website',
    callNow: 'Call now',
    resourceWhatFor: 'What this helps with',
    resourceNextStep: 'What to do now',
    directoryOffline: 'This list stays on the phone. The real application or call may need internet or a phone signal.',
    datasetMatches: 'More government schemes',
    datasetMatch: 'Scheme database',
    datasetSearching: 'Looking for more schemes…',
    datasetSource: 'Check this information on the official page before acting.',
    datasetState: 'State',
    backHome: 'Back to Seva Didi',
    noMatches: 'No help matched that word. Try a simpler word.',
    guideWithSaheli: 'Understand with Seva Didi',
    helplineLabel: 'Ujjwala helpline',
    helplineNumber: '14428',
    oneMoment: 'One moment…',

    // Enhanced Onboarding
    onboardingStepCount: 'of 4',
    onboardingStep1Title: 'Choose your language',
    onboardingStep1Sub: 'Tap the language you speak comfortably.',
    onboardingStep2Title: 'Speaking is very simple',
    onboardingStep2Sub: 'No forms to fill, no typing needed. Just tap the mic and speak like talking to an elder sister.',
    onboardingVoiceTip: 'Speak just like you would to a sister or neighbor.',
    onboardingTryVoice: 'Try asking by voice',
    onboardingListenGuide: 'Listen to instructions',
    onboardingStep3Title: '100% Offline & Safe',
    onboardingStep3Sub: 'Government scheme guidance stays safely on your phone without internet.',
    onboardingOfflinePoint1: 'Eligibility, documents, and what to say work without internet',
    onboardingOfflinePoint2: 'We never ask for OTPs, passwords, or bank credentials',
    onboardingOfflinePoint3: 'We will politely ask for internet only when opening an official website',
    onboardingStep4Title: 'What help do you need today?',
    onboardingStep4Sub: 'Pick an essential service or start by speaking:',
    onboardingCardGas: 'Cooking Gas Connection',
    onboardingCardGasSub: 'PM Ujjwala — New gas cylinder at home',
    onboardingCardSkill: 'Learn Tailoring & Skills',
    onboardingCardSkillSub: 'Skill India — Free training and courses',
    onboardingCardMaternity: 'Maternity Aid ₹5,000',
    onboardingCardMaternitySub: 'PMMVY — Cash aid for pregnant mothers',
    onboardingCardSafety: 'Women Safety Helpline',
    onboardingCardSafetySub: '181 — 24x7 immediate safety assistance',
    onboardingStartMic: 'Press mic and speak',

    // Quick suggestions on home
    quickSuggestions: 'Tap to ask quickly:',
    quickPromptGas: 'I need a gas connection',
    quickPromptSkill: 'Want to learn tailoring / skill',
    quickPromptMaternity: 'Maternity aid ₹5000',
    quickPromptRation: 'Free ration card info',
    quickPromptSafety: 'Women Helpline 181',
    quickPromptBank: 'Jan Dhan Bank Account',

    // Connection badge
    offlineBadge: 'Offline (Safe on phone)',
    onlineBadge: 'Online connected',

    // Enhanced Internet Modal
    internetModalTitle: 'Internet needed for official website',
    internetModalBody: 'To open this official government portal, please turn on Mobile Data or Wi-Fi. All your journey progress stays safe on this phone.',
    internetModalActionRetry: 'I turned on internet (Check again)',
    internetModalActionCall: 'Call helpline without internet',
    internetModalActionBack: 'Continue offline',
    internetModalTipData: 'Turn on Mobile Data in phone settings',
    internetModalTipWifi: 'Or connect to Wi-Fi',

    // Skills guided journey
    skillTitle: 'Skill India — Tailoring & Skills',
    skillSub: 'Free tailoring, crafts and livelihood training',
    skillQuestionTitle: 'Do you want to learn free tailoring, beauty or a trade?',
    skillQuestionHint: 'Choose one answer. This helps me show the right information.',
    skillYes: 'Yes, I want to learn',
    skillYesSub: 'Want to learn tailoring or a trade',
    skillNo: 'Not right now',
    skillNoSub: 'Want to explore other schemes',
    skillGoodTitle: 'Very good — government provides free training and certificates for women.',
    skillGoodBody: 'Free courses and livelihood support are available under Skill India and NRLM.',
    skillOkayTitle: 'That is okay.',
    skillOkayBody: 'You can explore self-help groups or other government schemes.',
    skillDoc1: 'Aadhaar card',
    skillDoc2: 'Bank account passbook',
    skillDoc3: '2 passport-size photographs',
    skillDoc4: 'Address proof (Aadhaar is sufficient)',
    skillNextTitle: 'What to say at the skill center or panchayat?',
    skillNextBody: 'Visit your nearest PM Kaushal Kendra or Gram Panchayat and say:',
    skillSayThis: '“Namaste, I want information about free tailoring or skill courses under Skill India.”',

    // Maternity guided journey
    maternityTitle: 'Pradhan Mantri Matru Vandana Yojana',
    maternitySub: '₹5,000 for pregnant and lactating mothers',
    maternityQuestionTitle: 'Are you pregnant or have recently given birth?',
    maternityQuestionHint: 'Choose one answer. This helps me show the right information.',
    maternityYes: 'Yes, pregnant or new mother',
    maternityYesSub: 'Need maternity assistance info',
    maternityNo: 'No',
    maternityNoSub: 'Learning for family or friend',
    maternityGoodTitle: 'Good — eligible mothers receive ₹5,000 cash assistance for nutrition and healthcare.',
    maternityGoodBody: 'This amount is transferred directly to your bank account via DBT.',
    maternityOkayTitle: 'That is okay.',
    maternityOkayBody: 'You can understand this information for a family member or friend.',
    maternityDoc1: 'Mother and father Aadhaar cards',
    maternityDoc2: 'Mother and Child Protection Card (MCP card)',
    maternityDoc3: 'Bank account passbook in mother’s name',
    maternityDoc4: 'Child birth certificate (for subsequent installment)',
    maternityNextTitle: 'What to say at the Anganwadi or hospital?',
    maternityNextBody: 'Go to your nearest Anganwadi worker or government health center and say:',
    maternitySayThis: '“Namaste, I want to submit the form for ₹5,000 maternity assistance under PMMVY.”',
  },
};

function languagePack(overrides) {
  return { ...copy.en, ...overrides };
}

Object.assign(copy, {
  bn: languagePack({
    code: 'BN', label: 'বাংলা', brandSub: 'আপনার ভাষায় সরকারি সাহায্য', help: 'সাহায্য', practice: 'নিরাপদ নির্দেশনা · আবেদন সরকারি PMUY ওয়েবসাইটে হবে', today: 'আজকের সাহায্য',
    heroTitle: 'গ্যাস সংযোগের জন্য সঠিক ধাপ জানুন।', heroBody: 'বাংলায় বলুন বা লিখুন। আমি আপনাকে এক ধাপ করে পথ দেখাব।', speakAsk: 'ভয়েসে জিজ্ঞেস করুন', listening: 'আমি শুনছি…', tapToSpeak: 'চাপ দিয়ে বলুন', orWrite: 'অথবা লিখুন', inputPlaceholder: 'যেমন: আমার গ্যাস সংযোগ দরকার', send: 'পাঠান', heard: 'আপনি বলেছেন', clear: 'মুছুন',
    threeSteps: '৩টি ছোট ধাপ', threeStepsSub: 'প্রশ্ন  →  কাগজপত্র  →  পরের ধাপ', seeDemo: 'শুরু করুন', back: 'ফিরে যান', step: 'ধাপ', of: 'এর মধ্যে', stepNames: ['পরিবারের তথ্য', 'কাগজপত্র প্রস্তুত', 'পরের ধাপ'],
    questionTitle: 'আপনার বাড়িতে কি আগে থেকেই গ্যাস সংযোগ আছে?', questionHint: 'একটি উত্তর বেছে নিন।', no: 'না', noSub: 'এখনও গ্যাস সংযোগ নেই', yes: 'হ্যাঁ', yesSub: 'আগেই সংযোগ আছে', goodTitle: 'ভালো — আমরা এগোতে পারি।', okayTitle: 'ঠিক আছে।',
    documentsTitle: 'এই কাগজগুলি সঙ্গে রাখুন।', documentsBody: 'আসল আবেদনে এগুলি চাইতে পারে। এখানে কিছু আপলোড করতে হবে না।', nextTitle: 'এরপর কোথায় যাবেন?', nextBody: 'কাছের LPG ডিস্ট্রিবিউটরের কাছে গিয়ে বলুন:', sayThis: '“আমি প্রধানমন্ত্রী উজ্জ্বলা যোজনা সম্পর্কে জানতে চাই।”', readAloud: 'শুনুন', continue: 'এগিয়ে যান', finish: 'আমি বুঝেছি', doneTitle: 'পরের ধাপ পরিষ্কার।', restart: 'আবার শুরু করুন',
    safetyTitle: 'আপনার নিরাপত্তা আগে', safetyBody: 'সাহেলি কখনও আপনার OTP, PIN বা ব্যাংক পাসওয়ার্ড চাইবে না।', official: 'সরকারি ওয়েবসাইট খুলুন', voiceUnavailable: 'এই ব্রাউজারে ভয়েস ইনপুট নেই। নিচে লিখে প্রশ্ন করুন।', backendUnavailable: 'সেবার সঙ্গে যোগাযোগ করা যায়নি। একটু পরে আবার চেষ্টা করুন।', close: 'বন্ধ করুন',
  }),
  ta: languagePack({
    code: 'TA', label: 'தமிழ்', brandSub: 'அரசு உதவி, உங்கள் மொழியில்', help: 'உதவி', practice: 'பாதுகாப்பான வழிகாட்டுதல் · விண்ணப்பம் அதிகாரப்பூர்வ PMUY இணையதளத்தில் தொடரும்', today: 'இன்றைய உதவி',
    heroTitle: 'எரிவாயு இணைப்புக்கான சரியான படிகளை அறியுங்கள்.', heroBody: 'தமிழில் பேசலாம் அல்லது எழுதலாம். ஒவ்வொரு படியாக வழிகாட்டுகிறேன்.', speakAsk: 'குரலில் கேளுங்கள்', listening: 'நான் கேட்கிறேன்…', tapToSpeak: 'அழுத்திப் பேசுங்கள்', orWrite: 'அல்லது எழுதுங்கள்', inputPlaceholder: 'உதாரணம்: எனக்கு எரிவாயு இணைப்பு வேண்டும்', send: 'அனுப்புங்கள்', heard: 'நீங்கள் சொன்னது', clear: 'அழிக்கவும்',
    threeSteps: '3 சிறிய படிகள்', threeStepsSub: 'கேள்வி  →  ஆவணங்கள்  →  அடுத்த படி', seeDemo: 'தொடங்குங்கள்', back: 'பின்னால்', step: 'படி', of: 'இல்', stepNames: ['வீட்டு தகவல்', 'ஆவணங்களைத் தயார் செய்யுங்கள்', 'அடுத்த படி'],
    questionTitle: 'உங்கள் வீட்டில் ஏற்கனவே எரிவாயு இணைப்பு உள்ளதா?', questionHint: 'ஒரு பதிலைத் தேர்ந்தெடுக்கவும்.', no: 'இல்லை', noSub: 'இன்னும் எரிவாயு இணைப்பு இல்லை', yes: 'ஆம்', yesSub: 'ஏற்கனவே இணைப்பு உள்ளது', goodTitle: 'நல்லது — தொடரலாம்.', okayTitle: 'பரவாயில்லை.',
    documentsTitle: 'இந்த ஆவணங்களை உடன் வைத்திருங்கள்.', documentsBody: 'உண்மையான விண்ணப்பத்தில் இவை கேட்கப்படலாம். இங்கே எதையும் பதிவேற்ற வேண்டாம்.', nextTitle: 'அடுத்து எங்கு செல்ல வேண்டும்?', nextBody: 'அருகிலுள்ள LPG விநியோகஸ்தரிடம் சென்று சொல்லுங்கள்:', sayThis: '“பிரதம மந்திரி உஜ்வலா யோஜனை பற்றி தகவல் வேண்டும்.”', readAloud: 'சத்தமாகப் படியுங்கள்', continue: 'தொடருங்கள்', finish: 'புரிந்துகொண்டேன்', doneTitle: 'அடுத்த படி தெளிவாக உள்ளது.', restart: 'மீண்டும் தொடங்குங்கள்',
    safetyTitle: 'உங்கள் பாதுகாப்பு முதலில்', safetyBody: 'சஹேலி உங்கள் OTP, PIN அல்லது வங்கி கடவுச்சொல்லை ஒருபோதும் கேட்காது.', official: 'அதிகாரப்பூர்வ இணையதளத்தைத் திறக்கவும்', voiceUnavailable: 'இந்த உலாவியில் குரல் உள்ளீடு இல்லை. கீழே எழுதிக் கேளுங்கள்.', backendUnavailable: 'சேவையுடன் இணைக்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.', close: 'மூடவும்',
  }),
  te: languagePack({
    code: 'TE', label: 'తెలుగు', brandSub: 'మీ భాషలో ప్రభుత్వ సహాయం', help: 'సహాయం', practice: 'సురక్షిత మార్గదర్శనం · దరఖాస్తు అధికారిక PMUY వెబ్‌సైట్‌లో కొనసాగుతుంది', today: 'ఈ రోజు సహాయం',
    heroTitle: 'గ్యాస్ కనెక్షన్ కోసం సరైన దశలను తెలుసుకోండి.', heroBody: 'తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి. ఒక్కో దశగా నేను మార్గనిర్దేశం చేస్తాను.', speakAsk: 'వాయిస్‌లో అడగండి', listening: 'నేను వింటున్నాను…', tapToSpeak: 'నొక్కి మాట్లాడండి', orWrite: 'లేదా టైప్ చేయండి', inputPlaceholder: 'ఉదాహరణ: నాకు గ్యాస్ కనెక్షన్ కావాలి', send: 'పంపండి', heard: 'మీరు చెప్పింది', clear: 'తొలగించండి',
    threeSteps: '3 చిన్న దశలు', threeStepsSub: 'ప్రశ్న  →  పత్రాలు  →  తదుపరి దశ', seeDemo: 'ప్రారంభించండి', back: 'వెనక్కి', step: 'దశ', of: 'లో', stepNames: ['ఇంటి సమాచారం', 'పత్రాలు సిద్ధంగా ఉంచండి', 'తదుపరి దశ'],
    questionTitle: 'మీ ఇంట్లో ఇప్పటికే గ్యాస్ కనెక్షన్ ఉందా?', questionHint: 'ఒక సమాధానం ఎంచుకోండి.', no: 'లేదు', noSub: 'ఇంకా గ్యాస్ కనెక్షన్ లేదు', yes: 'అవును', yesSub: 'ఇప్పటికే కనెక్షన్ ఉంది', goodTitle: 'మంచిది — ముందుకు వెళ్లవచ్చు.', okayTitle: 'పర్వాలేదు.',
    documentsTitle: 'ఈ పత్రాలను వెంట తీసుకెళ్లండి.', documentsBody: 'నిజమైన దరఖాస్తులో ఇవి అడగవచ్చు. ఇక్కడ ఏదీ అప్‌లోడ్ చేయాల్సిన అవసరం లేదు.', nextTitle: 'తర్వాత ఎక్కడికి వెళ్లాలి?', nextBody: 'దగ్గరలోని LPG పంపిణీదారుని కలిసి ఇలా చెప్పండి:', sayThis: '“ప్రధాన మంత్రి ఉజ్జ్వల యోజన గురించి సమాచారం కావాలి.”', readAloud: 'వినండి', continue: 'కొనసాగండి', finish: 'నాకు అర్థమైంది', doneTitle: 'తదుపరి దశ స్పష్టంగా ఉంది.', restart: 'మళ్లీ ప్రారంభించండి',
    safetyTitle: 'మీ భద్రత ముందుగా', safetyBody: 'సహేలీ మీ OTP, PIN లేదా బ్యాంక్ పాస్‌వర్డ్‌ను ఎప్పుడూ అడగదు.', official: 'అధికారిక వెబ్‌సైట్ తెరవండి', voiceUnavailable: 'ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ లేదు. కింద టైప్ చేసి అడగండి.', backendUnavailable: 'సేవకు కనెక్ట్ కాలేకపోయాం. కొద్దిసేపటి తర్వాత ప్రయత్నించండి.', close: 'మూసివేయండి',
  }),
  mr: languagePack({
    code: 'MR', label: 'मराठी', brandSub: 'सरकारी मदत, तुमच्या भाषेत', help: 'मदत', practice: 'सुरक्षित मार्गदर्शन · अर्ज अधिकृत PMUY वेबसाइटवर होईल', today: 'आजची मदत',
    heroTitle: 'गॅस कनेक्शनसाठी योग्य पायऱ्या समजून घ्या.', heroBody: 'मराठीत बोला किंवा लिहा. मी तुम्हाला प्रत्येक पायरी समजावून सांगेन.', speakAsk: 'आवाजाने विचारा', listening: 'मी ऐकत आहे…', tapToSpeak: 'दाबून बोला', orWrite: 'किंवा लिहा', inputPlaceholder: 'उदाहरण: मला गॅस कनेक्शन हवे आहे', send: 'पाठवा', heard: 'तुम्ही म्हणालात', clear: 'पुसा',
    threeSteps: '३ सोप्या पायऱ्या', threeStepsSub: 'प्रश्न  →  कागदपत्रे  →  पुढची पायरी', seeDemo: 'सुरू करा', back: 'मागे', step: 'पायरी', of: 'पैकी', stepNames: ['घराची माहिती', 'कागदपत्रे तयार ठेवा', 'पुढची पायरी'],
    questionTitle: 'तुमच्या घरात आधीपासून गॅस कनेक्शन आहे का?', questionHint: 'एक उत्तर निवडा.', no: 'नाही', noSub: 'अजून गॅस कनेक्शन नाही', yes: 'होय', yesSub: 'आधीपासून कनेक्शन आहे', goodTitle: 'छान — आपण पुढे जाऊ शकतो.', okayTitle: 'काही हरकत नाही.',
    documentsTitle: 'ही कागदपत्रे सोबत ठेवा.', documentsBody: 'खऱ्या अर्जात ही कागदपत्रे मागितली जाऊ शकतात. येथे काहीही अपलोड करायचे नाही.', nextTitle: 'पुढे कुठे जायचे?', nextBody: 'जवळच्या LPG वितरकाकडे जाऊन असे सांगा:', sayThis: '“मला प्रधानमंत्री उज्ज्वला योजनेबद्दल माहिती हवी आहे.”', readAloud: 'मोठ्याने ऐका', continue: 'पुढे जा', finish: 'मला समजले', doneTitle: 'पुढची पायरी स्पष्ट आहे.', restart: 'पुन्हा सुरू करा',
    safetyTitle: 'तुमची सुरक्षितता प्रथम', safetyBody: 'सहेली तुमचा OTP, PIN किंवा बँकेचा पासवर्ड कधीही विचारणार नाही.', official: 'अधिकृत वेबसाइट उघडा', voiceUnavailable: 'या ब्राउझरमध्ये आवाजाने विचारणे उपलब्ध नाही. खाली लिहा.', backendUnavailable: 'सेवेशी जोडता आले नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.', close: 'बंद करा',
  }),
  kn: languagePack({
    code: 'KN', label: 'ಕನ್ನಡ', brandSub: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರ್ಕಾರಿ ಸಹಾಯ', help: 'ಸಹಾಯ', practice: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗದರ್ಶನ · ಅರ್ಜಿ ಅಧಿಕೃತ PMUY ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಮುಂದುವರಿಯುತ್ತದೆ', today: 'ಇಂದಿನ ಸಹಾಯ',
    heroTitle: 'ಗ್ಯಾಸ್ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಸರಿಯಾದ ಹಂತಗಳನ್ನು ತಿಳಿಯಿರಿ.', heroBody: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ. ನಾನು ನಿಮಗೆ ಒಂದೊಂದೇ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.', speakAsk: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ', listening: 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ…', tapToSpeak: 'ಒತ್ತಿ ಮಾತನಾಡಿ', orWrite: 'ಅಥವಾ ಟೈಪ್ ಮಾಡಿ', inputPlaceholder: 'ಉದಾಹರಣೆ: ನನಗೆ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಬೇಕು', send: 'ಕಳುಹಿಸಿ', heard: 'ನೀವು ಹೇಳಿದ್ದು', clear: 'ಅಳಿಸಿ',
    threeSteps: '3 ಸರಳ ಹಂತಗಳು', threeStepsSub: 'ಪ್ರಶ್ನೆ  →  ದಾಖಲೆಗಳು  →  ಮುಂದಿನ ಹಂತ', seeDemo: 'ಪ್ರಾರಂಭಿಸಿ', back: 'ಹಿಂದೆ', step: 'ಹಂತ', of: 'ರಲ್ಲಿ', stepNames: ['ಮನೆಯ ಮಾಹಿತಿ', 'ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ', 'ಮುಂದಿನ ಹಂತ'],
    questionTitle: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಇದೆಯೇ?', questionHint: 'ಒಂದು ಉತ್ತರ ಆಯ್ಕೆ ಮಾಡಿ.', no: 'ಇಲ್ಲ', noSub: 'ಇನ್ನೂ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಇಲ್ಲ', yes: 'ಹೌದು', yesSub: 'ಈಗಾಗಲೇ ಸಂಪರ್ಕ ಇದೆ', goodTitle: 'ಒಳ್ಳೆಯದು — ಮುಂದುವರಿಯಬಹುದು.', okayTitle: 'ಪರವಾಗಿಲ್ಲ.',
    documentsTitle: 'ಈ ದಾಖಲೆಗಳನ್ನು ಜೊತೆಗೆ ಇಟ್ಟುಕೊಳ್ಳಿ.', documentsBody: 'ನಿಜವಾದ ಅರ್ಜಿಯಲ್ಲಿ ಇವುಗಳನ್ನು ಕೇಳಬಹುದು. ಇಲ್ಲಿ ಏನನ್ನೂ ಅಪ್‌ಲೋಡ್ ಮಾಡಬೇಕಾಗಿಲ್ಲ.', nextTitle: 'ಮುಂದೆ ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?', nextBody: 'ಹತ್ತಿರದ LPG ವಿತರಕರ ಬಳಿ ಹೋಗಿ ಹೀಗೆ ಹೇಳಿ:', sayThis: '“ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು.”', readAloud: 'ಓದಿ ಕೇಳಿ', continue: 'ಮುಂದುವರಿಸಿ', finish: 'ನನಗೆ ಅರ್ಥವಾಯಿತು', doneTitle: 'ಮುಂದಿನ ಹಂತ ಸ್ಪಷ್ಟವಾಗಿದೆ.', restart: 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ',
    safetyTitle: 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ ಮೊದಲು', safetyBody: 'ಸಹೇಲಿ ನಿಮ್ಮ OTP, PIN ಅಥವಾ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.', official: 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ', voiceUnavailable: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಇಲ್ಲ. ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.', backendUnavailable: 'ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.', close: 'ಮುಚ್ಚಿ',
  }),
  gu: languagePack({
    code: 'GU', label: 'ગુજરાતી', brandSub: 'તમારી ભાષામાં સરકારી મદદ', help: 'મદદ', practice: 'સલામત માર્ગદર્શન · અરજી અધિકૃત PMUY વેબસાઇટ પર થશે', today: 'આજની મદદ',
    heroTitle: 'ગેસ કનેક્શન માટેના યોગ્ય પગલાં સમજો.', heroBody: 'ગુજરાતીમાં બોલો અથવા લખો. હું તમને એક પછી એક પગલું સમજાવીશ.', speakAsk: 'અવાજથી પૂછો', listening: 'હું સાંભળી રહી છું…', tapToSpeak: 'દબાવીને બોલો', orWrite: 'અથવા લખો', inputPlaceholder: 'ઉદાહરણ: મારે ગેસ કનેક્શન જોઈએ છે', send: 'મોકલો', heard: 'તમે કહ્યું', clear: 'દૂર કરો',
    threeSteps: '3 સરળ પગલાં', threeStepsSub: 'સવાલ  →  કાગળો  →  આગળનું પગલું', seeDemo: 'શરૂ કરો', back: 'પાછળ', step: 'પગલું', of: 'માંથી', stepNames: ['ઘરની માહિતી', 'કાગળો તૈયાર રાખો', 'આગળનું પગલું'],
    questionTitle: 'શું તમારા ઘરમાં પહેલેથી ગેસ કનેક્શન છે?', questionHint: 'એક જવાબ પસંદ કરો.', no: 'ના', noSub: 'હજી ગેસ કનેક્શન નથી', yes: 'હા', yesSub: 'પહેલેથી કનેક્શન છે', goodTitle: 'સારું — આપણે આગળ વધી શકીએ.', okayTitle: 'કોઈ વાંધો નથી.',
    documentsTitle: 'આ કાગળો સાથે રાખો.', documentsBody: 'સાચી અરજીમાં આ કાગળો માંગી શકાય છે. અહીં કંઈ અપલોડ કરવાનું નથી.', nextTitle: 'આગળ ક્યાં જવું?', nextBody: 'નજીકના LPG વિતરક પાસે જઈને કહો:', sayThis: '“મારે પ્રધાનમંત્રી ઉજ્જ્વલા યોજના વિશે માહિતી જોઈએ છે.”', readAloud: 'વાંચીને સાંભળો', continue: 'આગળ વધો', finish: 'મને સમજાયું', doneTitle: 'આગળનું પગલું સ્પષ્ટ છે.', restart: 'ફરીથી શરૂ કરો',
    safetyTitle: 'તમારી સલામતી પહેલા', safetyBody: 'સહેલી ક્યારેય તમારો OTP, PIN અથવા બેંક પાસવર્ડ પૂછશે નહીં.', official: 'અધિકૃત વેબસાઇટ ખોલો', voiceUnavailable: 'આ બ્રાઉઝરમાં અવાજથી પૂછવું ઉપલબ્ધ નથી. નીચે લખીને પૂછો.', backendUnavailable: 'સેવા સાથે જોડાઈ શક્યા નથી. થોડી વાર પછી ફરી પ્રયાસ કરો.', close: 'બંધ કરો',
  }),
  ml: languagePack({
    code: 'ML', label: 'മലയാളം', brandSub: 'നിങ്ങളുടെ ഭാഷയിൽ സർക്കാർ സഹായം', help: 'സഹായം', practice: 'സുരക്ഷിത മാർഗനിർദേശം · അപേക്ഷ ഔദ്യോഗിക PMUY വെബ്സൈറ്റിൽ തുടരും', today: 'ഇന്നത്തെ സഹായം',
    heroTitle: 'ഗ്യാസ് കണക്ഷനുള്ള ശരിയായ ഘട്ടങ്ങൾ മനസ്സിലാക്കൂ.', heroBody: 'മലയാളത്തിൽ സംസാരിക്കുകയോ എഴുതുകയോ ചെയ്യാം. ഓരോ ഘട്ടമായും ഞാൻ നിങ്ങളെ നയിക്കും.', speakAsk: 'ശബ്ദത്തിൽ ചോദിക്കൂ', listening: 'ഞാൻ കേൾക്കുന്നു…', tapToSpeak: 'അമർത്തി സംസാരിക്കൂ', orWrite: 'അല്ലെങ്കിൽ എഴുതൂ', inputPlaceholder: 'ഉദാഹരണം: എനിക്ക് ഗ്യാസ് കണക്ഷൻ വേണം', send: 'അയയ്ക്കൂ', heard: 'നിങ്ങൾ പറഞ്ഞത്', clear: 'മായ്ക്കൂ',
    threeSteps: '3 ചെറിയ ഘട്ടങ്ങൾ', threeStepsSub: 'ചോദ്യം  →  രേഖകൾ  →  അടുത്ത ഘട്ടം', seeDemo: 'തുടങ്ങൂ', back: 'തിരികെ', step: 'ഘട്ടം', of: 'ൽ', stepNames: ['വീട്ടിലെ വിവരം', 'രേഖകൾ തയ്യാറാക്കൂ', 'അടുത്ത ഘട്ടം'],
    questionTitle: 'നിങ്ങളുടെ വീട്ടിൽ ഇതിനകം ഗ്യാസ് കണക്ഷൻ ഉണ്ടോ?', questionHint: 'ഒരു ഉത്തരം തിരഞ്ഞെടുക്കൂ.', no: 'ഇല്ല', noSub: 'ഇതുവരെ ഗ്യാസ് കണക്ഷൻ ഇല്ല', yes: 'ഉണ്ട്', yesSub: 'ഇതിനകം കണക്ഷൻ ഉണ്ട്', goodTitle: 'നല്ലത് — നമുക്ക് തുടരാം.', okayTitle: 'സാരമില്ല.',
    documentsTitle: 'ഈ രേഖകൾ കൂടെ കരുതൂ.', documentsBody: 'യഥാർത്ഥ അപേക്ഷയിൽ ഇവ ആവശ്യപ്പെട്ടേക്കാം. ഇവിടെ ഒന്നും അപ്‌ലോഡ് ചെയ്യേണ്ടതില്ല.', nextTitle: 'അടുത്തതായി എവിടെ പോകണം?', nextBody: 'അടുത്തുള്ള LPG വിതരണക്കാരനോട് ഇങ്ങനെ പറയൂ:', sayThis: '“പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജനയെക്കുറിച്ച് വിവരം വേണം.”', readAloud: 'വായിച്ചു കേൾക്കൂ', continue: 'തുടരൂ', finish: 'എനിക്ക് മനസ്സിലായി', doneTitle: 'അടുത്ത ഘട്ടം വ്യക്തമാണ്.', restart: 'വീണ്ടും തുടങ്ങൂ',
    safetyTitle: 'നിങ്ങളുടെ സുരക്ഷ ആദ്യം', safetyBody: 'സഹേലി ഒരിക്കലും നിങ്ങളുടെ OTP, PIN, ബാങ്ക് പാസ്‌വേഡ് എന്നിവ ചോദിക്കില്ല.', official: 'ഔദ്യോഗിക വെബ്സൈറ്റ് തുറക്കൂ', voiceUnavailable: 'ഈ ബ്രൗസറിൽ ശബ്ദ ഇൻപുട്ട് ലഭ്യമല്ല. താഴെ ടൈപ്പ് ചെയ്ത് ചോദിക്കൂ.', backendUnavailable: 'സേവനവുമായി ബന്ധപ്പെടാനായില്ല. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.', close: 'അടയ്ക്കൂ',
  }),
  pa: languagePack({
    code: 'PA', label: 'ਪੰਜਾਬੀ', brandSub: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਰਕਾਰੀ ਮਦਦ', help: 'ਮਦਦ', practice: 'ਸੁਰੱਖਿਅਤ ਮਾਰਗਦਰਸ਼ਨ · ਅਰਜ਼ੀ ਅਧਿਕਾਰਤ PMUY ਵੈੱਬਸਾਈਟ ਉੱਤੇ ਹੋਵੇਗੀ', today: 'ਅੱਜ ਦੀ ਮਦਦ',
    heroTitle: 'ਗੈਸ ਕਨੈਕਸ਼ਨ ਲਈ ਸਹੀ ਕਦਮ ਸਮਝੋ।', heroBody: 'ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਲਿਖੋ। ਮੈਂ ਤੁਹਾਨੂੰ ਇੱਕ-ਇੱਕ ਕਦਮ ਦੱਸਾਂਗੀ।', speakAsk: 'ਆਵਾਜ਼ ਨਾਲ ਪੁੱਛੋ', listening: 'ਮੈਂ ਸੁਣ ਰਹੀ ਹਾਂ…', tapToSpeak: 'ਦਬਾ ਕੇ ਬੋਲੋ', orWrite: 'ਜਾਂ ਲਿਖੋ', inputPlaceholder: 'ਉਦਾਹਰਨ: ਮੈਨੂੰ ਗੈਸ ਕਨੈਕਸ਼ਨ ਚਾਹੀਦਾ ਹੈ', send: 'ਭੇਜੋ', heard: 'ਤੁਸੀਂ ਕਿਹਾ', clear: 'ਮਿਟਾਓ',
    threeSteps: '3 ਛੋਟੇ ਕਦਮ', threeStepsSub: 'ਸਵਾਲ  →  ਕਾਗਜ਼  →  ਅਗਲਾ ਕਦਮ', seeDemo: 'ਸ਼ੁਰੂ ਕਰੋ', back: 'ਵਾਪਸ', step: 'ਕਦਮ', of: 'ਵਿੱਚੋਂ', stepNames: ['ਘਰ ਦੀ ਜਾਣਕਾਰੀ', 'ਕਾਗਜ਼ ਤਿਆਰ ਰੱਖੋ', 'ਅਗਲਾ ਕਦਮ'],
    questionTitle: 'ਕੀ ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਗੈਸ ਕਨੈਕਸ਼ਨ ਹੈ?', questionHint: 'ਇੱਕ ਜਵਾਬ ਚੁਣੋ।', no: 'ਨਹੀਂ', noSub: 'ਹਾਲੇ ਗੈਸ ਕਨੈਕਸ਼ਨ ਨਹੀਂ', yes: 'ਹਾਂ', yesSub: 'ਪਹਿਲਾਂ ਹੀ ਕਨੈਕਸ਼ਨ ਹੈ', goodTitle: 'ਚੰਗਾ — ਅਸੀਂ ਅੱਗੇ ਵਧ ਸਕਦੇ ਹਾਂ।', okayTitle: 'ਕੋਈ ਗੱਲ ਨਹੀਂ।',
    documentsTitle: 'ਇਹ ਕਾਗਜ਼ ਨਾਲ ਰੱਖੋ।', documentsBody: 'ਅਸਲ ਅਰਜ਼ੀ ਵਿੱਚ ਇਹ ਮੰਗੇ ਜਾ ਸਕਦੇ ਹਨ। ਇੱਥੇ ਕੁਝ ਅਪਲੋਡ ਨਹੀਂ ਕਰਨਾ।', nextTitle: 'ਅੱਗੇ ਕਿੱਥੇ ਜਾਣਾ ਹੈ?', nextBody: 'ਨੇੜੇ ਦੇ LPG ਡਿਸਟ੍ਰੀਬਿਊਟਰ ਕੋਲ ਜਾ ਕੇ ਕਹੋ:', sayThis: '“ਮੈਨੂੰ ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਉੱਜਵਲਾ ਯੋਜਨਾ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ।”', readAloud: 'ਉੱਚੀ ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ', continue: 'ਅੱਗੇ ਵਧੋ', finish: 'ਮੈਨੂੰ ਸਮਝ ਆ ਗਈ', doneTitle: 'ਅਗਲਾ ਕਦਮ ਸਾਫ਼ ਹੈ।', restart: 'ਫਿਰ ਸ਼ੁਰੂ ਕਰੋ',
    safetyTitle: 'ਤੁਹਾਡੀ ਸੁਰੱਖਿਆ ਪਹਿਲਾਂ', safetyBody: 'ਸਹੇਲੀ ਕਦੇ ਵੀ ਤੁਹਾਡਾ OTP, PIN ਜਾਂ ਬੈਂਕ ਪਾਸਵਰਡ ਨਹੀਂ ਮੰਗੇਗੀ।', official: 'ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ ਖੋਲ੍ਹੋ', voiceUnavailable: 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਆਵਾਜ਼ ਨਾਲ ਪੁੱਛਣਾ ਉਪਲਬਧ ਨਹੀਂ। ਹੇਠਾਂ ਲਿਖੋ।', backendUnavailable: 'ਸੇਵਾ ਨਾਲ ਜੁੜ ਨਹੀਂ ਸਕੇ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', close: 'ਬੰਦ ਕਰੋ',
  }),
  or: languagePack({
    code: 'OR', label: 'ଓଡ଼ିଆ', brandSub: 'ଆପଣଙ୍କ ଭାଷାରେ ସରକାରୀ ସହାୟତା', help: 'ସହାୟତା', practice: 'ସୁରକ୍ଷିତ ମାର୍ଗଦର୍ଶନ · ଆବେଦନ ଅଧିକୃତ PMUY ୱେବସାଇଟରେ ହେବ', today: 'ଆଜିର ସହାୟତା',
    heroTitle: 'ଗ୍ୟାସ ସଂଯୋଗ ପାଇଁ ସଠିକ ପଦକ୍ଷେପ ବୁଝନ୍ତୁ।', heroBody: 'ଓଡ଼ିଆରେ କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ। ମୁଁ ଗୋଟିଏ ଗୋଟିଏ ପଦକ୍ଷେପରେ ବୁଝାଇବି।', speakAsk: 'କଥାରେ ପଚାରନ୍ତୁ', listening: 'ମୁଁ ଶୁଣୁଛି…', tapToSpeak: 'ଦବାଇ କୁହନ୍ତୁ', orWrite: 'କିମ୍ବା ଲେଖନ୍ତୁ', inputPlaceholder: 'ଉଦାହରଣ: ମୋତେ ଗ୍ୟାସ ସଂଯୋଗ ଦରକାର', send: 'ପଠାନ୍ତୁ', heard: 'ଆପଣ କହିଲେ', clear: 'ହଟାନ୍ତୁ',
    threeSteps: '3ଟି ସହଜ ପଦକ୍ଷେପ', threeStepsSub: 'ପ୍ରଶ୍ନ  →  କାଗଜପତ୍ର  →  ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ', seeDemo: 'ଆରମ୍ଭ କରନ୍ତୁ', back: 'ପଛକୁ', step: 'ପଦକ୍ଷେପ', of: 'ମଧ୍ୟରୁ', stepNames: ['ଘରର ସୂଚନା', 'କାଗଜପତ୍ର ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ', 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ'],
    questionTitle: 'ଆପଣଙ୍କ ଘରେ ପୂର୍ବରୁ ଗ୍ୟାସ ସଂଯୋଗ ଅଛି କି?', questionHint: 'ଗୋଟିଏ ଉତ୍ତର ବାଛନ୍ତୁ।', no: 'ନାହିଁ', noSub: 'ଏପର୍ଯ୍ୟନ୍ତ ଗ୍ୟାସ ସଂଯୋଗ ନାହିଁ', yes: 'ହଁ', yesSub: 'ପୂର୍ବରୁ ସଂଯୋଗ ଅଛି', goodTitle: 'ଭଲ — ଆମେ ଆଗକୁ ବଢ଼ିପାରିବା।', okayTitle: 'କିଛି ଅସୁବିଧା ନାହିଁ।',
    documentsTitle: 'ଏହି କାଗଜପତ୍ର ସାଙ୍ଗରେ ରଖନ୍ତୁ।', documentsBody: 'ପ୍ରକୃତ ଆବେଦନରେ ଏଗୁଡ଼ିକ ମଗାଯାଇପାରେ। ଏଠାରେ କିଛି ଅପଲୋଡ୍ କରିବା ଦରକାର ନାହିଁ।', nextTitle: 'ପରେ କେଉଁଠି ଯିବେ?', nextBody: 'ନିକଟ LPG ବିତରକଙ୍କୁ ଯାଇ କୁହନ୍ତୁ:', sayThis: '“ମୋତେ ପ୍ରଧାନମନ୍ତ୍ରୀ ଉଜ୍ଜ୍ୱଳା ଯୋଜନା ବିଷୟରେ ସୂଚନା ଦରକାର।”', readAloud: 'ଶୁଣନ୍ତୁ', continue: 'ଆଗକୁ ବଢ଼ନ୍ତୁ', finish: 'ମୁଁ ବୁଝିଗଲି', doneTitle: 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ ସ୍ପଷ୍ଟ।', restart: 'ପୁଣି ଆରମ୍ଭ କରନ୍ତୁ',
    safetyTitle: 'ଆପଣଙ୍କ ସୁରକ୍ଷା ପ୍ରଥମେ', safetyBody: 'ସହେଲୀ କେବେ ମଧ୍ୟ ଆପଣଙ୍କ OTP, PIN କିମ୍ବା ବ୍ୟାଙ୍କ ପାସୱାର୍ଡ ମାଗିବ ନାହିଁ।', official: 'ଅଧିକୃତ ୱେବସାଇଟ ଖୋଲନ୍ତୁ', voiceUnavailable: 'ଏହି ବ୍ରାଉଜରରେ ଭଏସ୍ ଇନପୁଟ ନାହିଁ। ତଳେ ଲେଖି ପଚାରନ୍ତୁ।', backendUnavailable: 'ସେବା ସହିତ ଯୋଡ଼ିହେଲା ନାହିଁ। କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।', close: 'ବନ୍ଦ କରନ୍ତୁ',
  }),
  as: languagePack({
    code: 'AS', label: 'অসমীয়া', brandSub: 'আপোনাৰ ভাষাত চৰকাৰী সহায়', help: 'সহায়', practice: 'নিৰাপদ নিৰ্দেশনা · আবেদন চৰকাৰী PMUY ৱেবছাইটত হ’ব', today: 'আজিৰ সহায়',
    heroTitle: 'গেছ সংযোগৰ বাবে সঠিক পদক্ষেপ বুজি লওক।', heroBody: 'অসমীয়াত কওক বা লিখক। মই আপোনাক এটাকৈ পদক্ষেপ বুজাই দিম।', speakAsk: 'কথাৰে সোধক', listening: 'মই শুনি আছোঁ…', tapToSpeak: 'হেঁচি কওক', orWrite: 'বা লিখক', inputPlaceholder: 'উদাহৰণ: মোক গেছ সংযোগ লাগে', send: 'পঠাওক', heard: 'আপুনি ক’লে', clear: 'আঁতৰাওক',
    threeSteps: '৩টা সহজ পদক্ষেপ', threeStepsSub: 'প্ৰশ্ন  →  কাগজ-পত্ৰ  →  পৰৱৰ্তী পদক্ষেপ', seeDemo: 'আৰম্ভ কৰক', back: 'উভতি যাওক', step: 'পদক্ষেপ', of: 'ৰ ভিতৰত', stepNames: ['ঘৰৰ তথ্য', 'কাগজ-পত্ৰ সাজু ৰাখক', 'পৰৱৰ্তী পদক্ষেপ'],
    questionTitle: 'আপোনাৰ ঘৰত ইতিমধ্যে গেছ সংযোগ আছে নেকি?', questionHint: 'এটা উত্তৰ বাছক।', no: 'নাই', noSub: 'এতিয়াও গেছ সংযোগ নাই', yes: 'হয়', yesSub: 'আগৰ পৰাই সংযোগ আছে', goodTitle: 'ভাল — আমি আগবাঢ়িব পাৰোঁ।', okayTitle: 'ঠিক আছে।',
    documentsTitle: 'এই কাগজ-পত্ৰবোৰ লগত ৰাখক।', documentsBody: 'প্ৰকৃত আবেদনৰ সময়ত এইবোৰ বিচৰা হ’ব পাৰে। ইয়াত একো আপলোড কৰিব নালাগে।', nextTitle: 'ইয়াৰ পিছত ক’লৈ যাব?', nextBody: 'ওচৰৰ LPG বিতৰকৰ ওচৰলৈ গৈ কওক:', sayThis: '“মোক প্ৰধানমন্ত্ৰী উজ্জ্বলা যোজনাৰ বিষয়ে তথ্য লাগে।”', readAloud: 'শুনি লওক', continue: 'আগবাঢ়ক', finish: 'মই বুজিলোঁ', doneTitle: 'পৰৱৰ্তী পদক্ষেপ স্পষ্ট।', restart: 'আকৌ আৰম্ভ কৰক',
    safetyTitle: 'আপোনাৰ সুৰক্ষা প্ৰথম', safetyBody: 'সহেলীয়ে কেতিয়াও আপোনাৰ OTP, PIN বা বেংকৰ পাছৱৰ্ড নোসোধে।', official: 'চৰকাৰী ৱেবছাইট খোলক', voiceUnavailable: 'এই ব্ৰাউজাৰত কণ্ঠ ইনপুট নাই। তলত লিখি সোধক।', backendUnavailable: 'সেৱাৰ সৈতে সংযোগ নহ’ল। অলপ পিছত আকৌ চেষ্টা কৰক।', close: 'বন্ধ কৰক',
  }),
  ur: languagePack({
    code: 'UR', label: 'اردو', brandSub: 'آپ کی زبان میں سرکاری مدد', help: 'مدد', practice: 'محفوظ رہنمائی · درخواست سرکاری PMUY ویب سائٹ پر جاری رہے گی', today: 'آج کی مدد',
    heroTitle: 'گیس کنکشن کے لیے صحیح مراحل سمجھیں۔', heroBody: 'اردو میں بولیں یا لکھیں۔ میں آپ کو ایک ایک قدم سمجھاؤں گی۔', speakAsk: 'آواز سے پوچھیں', listening: 'میں سن رہی ہوں…', tapToSpeak: 'دبا کر بولیں', orWrite: 'یا لکھیں', inputPlaceholder: 'مثال: مجھے گیس کنکشن چاہیے', send: 'بھیجیں', heard: 'آپ نے کہا', clear: 'مٹائیں',
    threeSteps: '۳ آسان مراحل', threeStepsSub: 'سوال  →  کاغذات  →  اگلا قدم', seeDemo: 'شروع کریں', back: 'واپس', step: 'مرحلہ', of: 'میں سے', stepNames: ['گھر کی معلومات', 'کاغذات تیار رکھیں', 'اگلا قدم'],
    questionTitle: 'کیا آپ کے گھر میں پہلے سے گیس کنکشن ہے؟', questionHint: 'ایک جواب منتخب کریں۔', no: 'نہیں', noSub: 'ابھی گیس کنکشن نہیں ہے', yes: 'ہاں', yesSub: 'پہلے سے کنکشن ہے', goodTitle: 'اچھا — ہم آگے بڑھ سکتے ہیں۔', okayTitle: 'کوئی بات نہیں۔',
    documentsTitle: 'یہ کاغذات ساتھ رکھیں۔', documentsBody: 'اصل درخواست میں یہ چیزیں مانگی جا سکتی ہیں۔ یہاں کچھ اپ لوڈ نہیں کرنا ہے۔', nextTitle: 'اگلا قدم کہاں ہے؟', nextBody: 'قریب کے LPG ڈسٹری بیوٹر کے پاس جا کر کہیں:', sayThis: '“مجھے پردھان منتری اجولا یوجنا کے بارے میں معلومات چاہیے۔”', readAloud: 'سنیں', continue: 'آگے بڑھیں', finish: 'میں سمجھ گئی', doneTitle: 'اگلا قدم واضح ہے۔', restart: 'دوبارہ شروع کریں',
    safetyTitle: 'آپ کی حفاظت پہلے', safetyBody: 'سہیلی کبھی آپ سے OTP، PIN یا بینک پاس ورڈ نہیں مانگے گی۔', official: 'سرکاری ویب سائٹ کھولیں', voiceUnavailable: 'اس براؤزر میں آواز سے پوچھنا دستیاب نہیں۔ نیچے لکھ کر پوچھیں۔', backendUnavailable: 'سروس سے رابطہ نہیں ہو سکا۔ کچھ دیر بعد دوبارہ کوشش کریں۔', close: 'بند کریں',
  }),
  'hi-Latn': languagePack({
    code: 'HI-L', label: 'Hinglish', brandSub: 'Sarkari madad, aapki bhasha mein', help: 'Help', practice: 'Safe guidance · application official PMUY website par hogi', today: 'AAJ KI MADAD',
    heroTitle: 'Gas connection ke liye sahi steps samjhein.', heroBody: 'Aap Hinglish mein bol sakti hain ya type kar sakti hain. Main aapko ek-ek step samjhaungi.', speakAsk: 'Voice se poochhein', listening: 'Main sun rahi hoon…', tapToSpeak: 'Dabakar boliye', orWrite: 'YA TYPE KAREIN', inputPlaceholder: 'Jaise: mujhe gas connection chahiye', send: 'Bhejein', heard: 'Aapne kaha', clear: 'Saaf karein',
    threeSteps: '3 chhote steps', threeStepsSub: 'Sawaal  →  Kaagaz  →  Agla step', seeDemo: 'Shuru karein', back: 'Wapas', step: 'Step', of: 'mein se', stepNames: ['Ghar ki jaankari', 'Kaagaz ready rakhein', 'Agla step'],
    questionTitle: 'Kya aapke ghar mein pehle se gas connection hai?', questionHint: 'Ek jawab chuniye.', no: 'Nahi', noSub: 'Abhi gas connection nahi hai', yes: 'Haan', yesSub: 'Pehle se connection hai', goodTitle: 'Achha — hum aage badh sakte hain.', okayTitle: 'Koi baat nahi.',
    documentsTitle: 'Ye kaagaz saath rakhein.', documentsBody: 'Real application mein ye maange ja sakte hain. Yahan kuch upload nahi karna hai.', nextTitle: 'Ab kahan jaana hai?', nextBody: 'Apne paas ke LPG distributor ke paas jaakar boliye:', sayThis: '“Mujhe Pradhan Mantri Ujjwala Yojana ke baare mein jaankari chahiye.”', readAloud: 'Sunkar dekhein', continue: 'Aage badhein', finish: 'Mujhe samajh aa gaya', doneTitle: 'Agla step clear hai.', restart: 'Phir se shuru karein',
    safetyTitle: 'Aapki safety sabse pehle', safetyBody: 'Saheli kabhi bhi aapse OTP, PIN ya bank password nahi maangegi.', official: 'Official website kholein', voiceUnavailable: 'Is browser mein voice input nahi hai. Neeche type karke poochhein.', backendUnavailable: 'Service se connect nahi ho paaya. Thodi der baad phir try karein.', close: 'Band karein',
  }),
  'ta-Latn': languagePack({
    code: 'TA-L', label: 'Tanglish', brandSub: 'Arasu udhavi, unga mozhi-la', help: 'Help', practice: 'Safe guidance · application official PMUY website-la continue aagum', today: 'INDRAIYA UDHAVI',
    heroTitle: 'Gas connection-ku sariyana steps purinjukonga.', heroBody: 'Neenga Tanglish-la pesalaam illa type pannalaam. Naan ovvoru step-aa guide panren.', speakAsk: 'Voice-la kelunga', listening: 'Naan kekkaren…', tapToSpeak: 'Press panni pesunga', orWrite: 'ILLA TYPE PANNA', inputPlaceholder: 'Example: enakku gas connection venum', send: 'Anuppunga', heard: 'Neenga sonnathu', clear: 'Clear',
    threeSteps: '3 easy steps', threeStepsSub: 'Kelvi  →  Documents  →  Next step', seeDemo: 'Start pannunga', back: 'Back', step: 'Step', of: 'la', stepNames: ['Veedu information', 'Documents ready pannunga', 'Next step'],
    questionTitle: 'Unga veetla already gas connection irukka?', questionHint: 'Oru answer select pannunga.', no: 'Illa', noSub: 'Innum gas connection illa', yes: 'Aama', yesSub: 'Already connection irukku', goodTitle: 'Nalla irukku — continue pannalaam.', okayTitle: 'Parava illa.',
    documentsTitle: 'Indha papers-a kooda kondu ponga.', documentsBody: 'Real application-la idha kekkalaam. Inga edhuvum upload panna vendam.', nextTitle: 'Next enga poganum?', nextBody: 'Pakkathula irukkura LPG distributor-kitta poi sollunga:', sayThis: '“Pradhan Mantri Ujjwala Yojana pathi information venum.”', readAloud: 'Read aloud', continue: 'Continue', finish: 'Enakku purinjiduchu', doneTitle: 'Next step clear-aa irukku.', restart: 'Again start pannunga',
    safetyTitle: 'Unga safety first', safetyBody: 'Saheli unga OTP, PIN illa bank password-a kekkaadhu.', official: 'Official website open pannunga', voiceUnavailable: 'Indha browser-la voice input illa. Keela type panni kelunga.', backendUnavailable: 'Service-kku connect aagala. Konjam neram kazhichu try pannunga.', close: 'Close',
  }),
});

const languageDetails = {
  bn: { scheme: 'প্রধানমন্ত্রী উজ্জ্বলা যোজনা', schemeSub: 'বাড়ির LPG সংযোগের তথ্য', goodBody: 'উজ্জ্বলা সেই পরিবারগুলির জন্য যাদের বাড়িতে এখনও LPG সংযোগ নেই।', okayBody: 'এই যোজনার জন্য কাছের গ্যাস এজেন্সিতে আপনার পরিস্থিতি জিজ্ঞেস করুন।', doc1: 'আধার কার্ড', doc2: 'রেশন কার্ড বা পরিবারের প্রমাণ', doc3: 'ঠিকানার প্রমাণ', doc4: 'ব্যাংক অ্যাকাউন্টের তথ্য', doc5: 'KYC ফর্ম ও বঞ্চনা ঘোষণা', privateTitle: 'আপনার তথ্য এখানে থাকে', privateBody: 'এই অ্যাপ ব্যক্তিগত তথ্য সেভ করে না।', bring: 'কাগজপত্র সঙ্গে নিন', askHelp: 'সাহায্য চাওয়া ঠিক আছে', doneBody: 'আপনি জানেন কোথায় যেতে হবে এবং কী জিজ্ঞেস করতে হবে। এই স্ক্রিনটি বিশ্বাসের কাউকে দেখাতে পারেন।', guidanceReady: 'সাহেলি প্রস্তুত', serviceUnavailable: 'নির্দেশনা এখন পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।' },
  ta: { scheme: 'பிரதம மந்திரி உஜ்வலா யோஜனை', schemeSub: 'வீட்டு LPG இணைப்பு தகவல்', goodBody: 'வீட்டில் இன்னும் LPG இணைப்பு இல்லாத குடும்பங்களுக்கு உஜ்வலா திட்டம்.', okayBody: 'இந்த திட்டத்திற்கு அருகிலுள்ள எரிவாயு முகவரியிடம் உங்கள் நிலை பற்றி கேளுங்கள்.', doc1: 'ஆதார் அட்டை', doc2: 'ரேஷன் அட்டை அல்லது குடும்பச் சான்று', doc3: 'முகவரி சான்று', doc4: 'வங்கி கணக்கு தகவல்', doc5: 'KYC படிவம் மற்றும் வறுமை அறிவிப்பு', privateTitle: 'உங்கள் தகவல் இங்கே பாதுகாப்பாக உள்ளது', privateBody: 'இந்த செயலி தனிப்பட்ட தகவலை சேமிக்காது.', bring: 'ஆவணங்களை எடுத்துச் செல்லுங்கள்', askHelp: 'உதவி கேட்பது சரியே', doneBody: 'எங்கு செல்ல வேண்டும், என்ன கேட்க வேண்டும் என்பது இப்போது தெரியும். இந்தத் திரையை நம்பிக்கை உள்ளவரிடம் காட்டலாம்.', guidanceReady: 'சஹேலி தயாராக உள்ளது', serviceUnavailable: 'வழிகாட்டுதல் இப்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.' },
  te: { scheme: 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన', schemeSub: 'ఇంటి LPG కనెక్షన్ సమాచారం', goodBody: 'ఇంట్లో ఇంకా LPG కనెక్షన్ లేని కుటుంబాల కోసం ఉజ్జ్వల పథకం.', okayBody: 'ఈ పథకం కోసం దగ్గరలోని గ్యాస్ ఏజెన్సీలో మీ పరిస్థితి గురించి అడగండి.', doc1: 'ఆధార్ కార్డు', doc2: 'రేషన్ కార్డు లేదా కుటుంబ ఆధారం', doc3: 'చిరునామా ఆధారం', doc4: 'బ్యాంక్ ఖాతా వివరాలు', doc5: 'KYC ఫారం మరియు వంచన ప్రకటన', privateTitle: 'మీ సమాచారం ఇక్కడే ఉంటుంది', privateBody: 'ఈ యాప్ వ్యక్తిగత సమాచారాన్ని సేవ్ చేయదు.', bring: 'పత్రాలు వెంట తీసుకెళ్లండి', askHelp: 'సహాయం అడగడం మంచిదే', doneBody: 'ఎక్కడికి వెళ్లాలో, ఏమి అడగాలో మీకు తెలుసు. ఈ స్క్రీన్‌ను నమ్మకమైన వ్యక్తికి చూపవచ్చు.', guidanceReady: 'సహేలీ సిద్ధంగా ఉంది', serviceUnavailable: 'మార్గదర్శనం ప్రస్తుతం అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత ప్రయత్నించండి.' },
  mr: { scheme: 'प्रधानमंत्री उज्ज्वला योजना', schemeSub: 'घरगुती LPG कनेक्शनची माहिती', goodBody: 'ज्या कुटुंबांच्या घरी अजून LPG कनेक्शन नाही त्यांच्यासाठी उज्ज्वला योजना आहे.', okayBody: 'या योजनेसाठी जवळच्या गॅस एजन्सीकडे तुमची परिस्थिती विचारा.', doc1: 'आधार कार्ड', doc2: 'रेशन कार्ड किंवा कुटुंबाचा पुरावा', doc3: 'पत्त्याचा पुरावा', doc4: 'बँक खात्याची माहिती', doc5: 'KYC फॉर्म आणि वंचना घोषणा', privateTitle: 'तुमची माहिती येथेच राहते', privateBody: 'हा ॲप वैयक्तिक माहिती सेव्ह करत नाही.', bring: 'कागदपत्रे सोबत न्या', askHelp: 'मदत मागणे योग्य आहे', doneBody: 'कुठे जायचे आणि काय विचारायचे हे तुम्हाला माहीत आहे. ही स्क्रीन विश्वासू व्यक्तीला दाखवू शकता.', guidanceReady: 'सहेली तयार आहे', serviceUnavailable: 'मार्गदर्शन सध्या उपलब्ध नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.' },
  kn: { scheme: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆ', schemeSub: 'ಮನೆಯ LPG ಸಂಪರ್ಕದ ಮಾಹಿತಿ', goodBody: 'ಮನೆಯಲ್ಲಿ ಇನ್ನೂ LPG ಸಂಪರ್ಕ ಇಲ್ಲದ ಕುಟುಂಬಗಳಿಗಾಗಿ ಉಜ್ವಲ ಯೋಜನೆ.', okayBody: 'ಈ ಯೋಜನೆಗಾಗಿ ಹತ್ತಿರದ ಗ್ಯಾಸ್ ಏಜೆನ್ಸಿಯಲ್ಲಿ ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಕೇಳಿ.', doc1: 'ಆಧಾರ್ ಕಾರ್ಡ್', doc2: 'ರೇಷನ್ ಕಾರ್ಡ್ ಅಥವಾ ಕುಟುಂಬದ ದಾಖಲೆ', doc3: 'ವಿಳಾಸದ ದಾಖಲೆ', doc4: 'ಬ್ಯಾಂಕ್ ಖಾತೆಯ ಮಾಹಿತಿ', doc5: 'KYC ಫಾರ್ಮ್ ಮತ್ತು ವಂಚನೆ ಘೋಷಣೆ', privateTitle: 'ನಿಮ್ಮ ಮಾಹಿತಿ ಇಲ್ಲಿಯೇ ಇರುತ್ತದೆ', privateBody: 'ಈ ಆಪ್ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಉಳಿಸುವುದಿಲ್ಲ.', bring: 'ದಾಖಲೆಗಳನ್ನು ಜೊತೆಗೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ', askHelp: 'ಸಹಾಯ ಕೇಳುವುದು ಸರಿಯೇ', doneBody: 'ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು ಮತ್ತು ಏನು ಕೇಳಬೇಕು ಎಂದು ನಿಮಗೆ ತಿಳಿದಿದೆ. ಈ ಪರದೆಯನ್ನು ನಂಬಿಕೆಯ ವ್ಯಕ್ತಿಗೆ ತೋರಿಸಬಹುದು.', guidanceReady: 'ಸಹೇಲಿ ಸಿದ್ಧವಾಗಿದೆ', serviceUnavailable: 'ಮಾರ್ಗದರ್ಶನ ಈಗ ಲಭ್ಯವಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.' },
  gu: { scheme: 'પ્રધાનમંત્રી ઉજ્જ્વલા યોજના', schemeSub: 'ઘરના LPG કનેક્શનની માહિતી', goodBody: 'જે પરિવારોના ઘરમાં હજુ LPG કનેક્શન નથી તેમના માટે ઉજ્જ્વલા યોજના છે.', okayBody: 'આ યોજના માટે નજીકની ગેસ એજન્સીમાં તમારી સ્થિતિ વિશે પૂછો.', doc1: 'આધાર કાર્ડ', doc2: 'રેશન કાર્ડ અથવા પરિવારનો પુરાવો', doc3: 'સરનામાનો પુરાવો', doc4: 'બેંક ખાતાની માહિતી', doc5: 'KYC ફોર્મ અને વંચિતતા ઘોષણા', privateTitle: 'તમારી માહિતી અહીં જ રહે છે', privateBody: 'આ એપ વ્યક્તિગત માહિતી સાચવતી નથી.', bring: 'કાગળો સાથે લઈ જાઓ', askHelp: 'મદદ માંગવી બરાબર છે', doneBody: 'તમને ખબર છે કે ક્યાં જવું અને શું પૂછવું. આ સ્ક્રીન વિશ્વાસુ વ્યક્તિને બતાવી શકો છો.', guidanceReady: 'સહેલી તૈયાર છે', serviceUnavailable: 'માર્ગદર્શન હાલમાં ઉપલબ્ધ નથી. થોડી વાર પછી ફરી પ્રયાસ કરો.' },
  ml: { scheme: 'പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന', schemeSub: 'വീട്ടിലെ LPG കണക്ഷൻ വിവരം', goodBody: 'വീട്ടിൽ ഇതുവരെ LPG കണക്ഷൻ ഇല്ലാത്ത കുടുംബങ്ങൾക്കുള്ളതാണ് ഉജ്ജ്വല പദ്ധതി.', okayBody: 'ഈ പദ്ധതിക്കായി അടുത്തുള്ള ഗ്യാസ് ഏജൻസിയോട് നിങ്ങളുടെ സ്ഥിതി ചോദിക്കൂ.', doc1: 'ആധാർ കാർഡ്', doc2: 'റേഷൻ കാർഡ് അല്ലെങ്കിൽ കുടുംബ രേഖ', doc3: 'വിലാസ രേഖ', doc4: 'ബാങ്ക് അക്കൗണ്ട് വിവരം', doc5: 'KYC ഫോമും വഞ്ചനാ പ്രഖ്യാപനവും', privateTitle: 'നിങ്ങളുടെ വിവരം ഇവിടെ തന്നെ തുടരും', privateBody: 'ഈ ആപ്പ് വ്യക്തിഗത വിവരങ്ങൾ സൂക്ഷിക്കില്ല.', bring: 'രേഖകൾ കൂടെ കൊണ്ടുപോകൂ', askHelp: 'സഹായം ചോദിക്കുന്നത് ശരിയാണ്', doneBody: 'എവിടെ പോകണം, എന്ത് ചോദിക്കണം എന്ന് നിങ്ങൾക്കറിയാം. ഈ സ്ക്രീൻ വിശ്വസിക്കുന്ന ഒരാൾക്ക് കാണിക്കാം.', guidanceReady: 'സഹേലി തയ്യാറാണ്', serviceUnavailable: 'മാർഗനിർദേശം ഇപ്പോൾ ലഭ്യമല്ല. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.' },
  pa: { scheme: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਉੱਜਵਲਾ ਯੋਜਨਾ', schemeSub: 'ਘਰ ਦੇ LPG ਕਨੈਕਸ਼ਨ ਦੀ ਜਾਣਕਾਰੀ', goodBody: 'ਉੱਜਵਲਾ ਉਨ੍ਹਾਂ ਪਰਿਵਾਰਾਂ ਲਈ ਹੈ ਜਿਨ੍ਹਾਂ ਦੇ ਘਰ ਵਿੱਚ ਹਾਲੇ LPG ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਹੈ।', okayBody: 'ਇਸ ਯੋਜਨਾ ਲਈ ਨੇੜਲੀ ਗੈਸ ਏਜੰਸੀ ਤੋਂ ਆਪਣੀ ਸਥਿਤੀ ਬਾਰੇ ਪੁੱਛੋ।', doc1: 'ਆਧਾਰ ਕਾਰਡ', doc2: 'ਰਾਸ਼ਨ ਕਾਰਡ ਜਾਂ ਪਰਿਵਾਰ ਦਾ ਸਬੂਤ', doc3: 'ਪਤੇ ਦਾ ਸਬੂਤ', doc4: 'ਬੈਂਕ ਖਾਤੇ ਦੀ ਜਾਣਕਾਰੀ', doc5: 'KYC ਫਾਰਮ ਅਤੇ ਵੰਚਨਾ ਘੋਸ਼ਣਾ', privateTitle: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਇੱਥੇ ਹੀ ਰਹਿੰਦੀ ਹੈ', privateBody: 'ਇਹ ਐਪ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਸੇਵ ਨਹੀਂ ਕਰਦੀ।', bring: 'ਕਾਗਜ਼ ਨਾਲ ਲੈ ਜਾਓ', askHelp: 'ਮਦਦ ਮੰਗਣਾ ਠੀਕ ਹੈ', doneBody: 'ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ ਕਿੱਥੇ ਜਾਣਾ ਅਤੇ ਕੀ ਪੁੱਛਣਾ ਹੈ। ਇਹ ਸਕ੍ਰੀਨ ਭਰੋਸੇਯੋਗ ਵਿਅਕਤੀ ਨੂੰ ਦਿਖਾ ਸਕਦੇ ਹੋ।', guidanceReady: 'ਸਹੇਲੀ ਤਿਆਰ ਹੈ', serviceUnavailable: 'ਮਾਰਗਦਰਸ਼ਨ ਹੁਣ ਉਪਲਬਧ ਨਹੀਂ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' },
  or: { scheme: 'ପ୍ରଧାନମନ୍ତ୍ରୀ ଉଜ୍ଜ୍ୱଳା ଯୋଜନା', schemeSub: 'ଘରର LPG ସଂଯୋଗ ସୂଚନା', goodBody: 'ଯେଉଁ ପରିବାରଙ୍କ ଘରେ ଏପର୍ଯ୍ୟନ୍ତ LPG ସଂଯୋଗ ନାହିଁ ସେମାନଙ୍କ ପାଇଁ ଉଜ୍ଜ୍ୱଳା ଯୋଜନା।', okayBody: 'ଏହି ଯୋଜନା ପାଇଁ ନିକଟ ଗ୍ୟାସ ଏଜେନ୍ସିରେ ଆପଣଙ୍କ ସ୍ଥିତି ପଚାରନ୍ତୁ।', doc1: 'ଆଧାର କାର୍ଡ', doc2: 'ରାସନ କାର୍ଡ କିମ୍ବା ପରିବାର ପ୍ରମାଣ', doc3: 'ଠିକଣା ପ୍ରମାଣ', doc4: 'ବ୍ୟାଙ୍କ ଖାତା ସୂଚନା', doc5: 'KYC ଫର୍ମ ଓ ବଞ୍ଚନା ଘୋଷଣା', privateTitle: 'ଆପଣଙ୍କ ସୂଚନା ଏଠାରେ ରହେ', privateBody: 'ଏହି ଆପ୍ ବ୍ୟକ୍ତିଗତ ସୂଚନା ସେଭ୍ କରେ ନାହିଁ।', bring: 'କାଗଜପତ୍ର ସାଙ୍ଗରେ ନିଅନ୍ତୁ', askHelp: 'ସାହାଯ୍ୟ ମାଗିବା ଠିକ୍', doneBody: 'କେଉଁଠି ଯିବା ଓ କଣ ପଚାରିବା ଆପଣ ଜାଣିଛନ୍ତି। ଏହି ସ୍କ୍ରିନଟି ଭରସାଯୋଗ୍ୟ ଲୋକଙ୍କୁ ଦେଖାଇପାରିବେ।', guidanceReady: 'ସହେଲୀ ପ୍ରସ୍ତୁତ', serviceUnavailable: 'ମାର୍ଗଦର୍ଶନ ବର୍ତ୍ତମାନ ମିଳୁନାହିଁ। କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' },
  as: { scheme: 'প্ৰধানমন্ত্ৰী উজ্জ্বলা যোজনা', schemeSub: 'ঘৰৰ LPG সংযোগৰ তথ্য', goodBody: 'যিবোৰ পৰিয়ালৰ ঘৰত এতিয়াও LPG সংযোগ নাই, তেওঁলোকৰ বাবে উজ্জ্বলা যোজনা।', okayBody: 'এই যোজনাৰ বাবে ওচৰৰ গেছ এজেন্সীত আপোনাৰ পৰিস্থিতিৰ বিষয়ে সোধক।', doc1: 'আধাৰ কাৰ্ড', doc2: 'ৰেচন কাৰ্ড বা পৰিয়ালৰ প্ৰমাণ', doc3: 'ঠিকনাৰ প্ৰমাণ', doc4: 'বেংক একাউণ্টৰ তথ্য', doc5: 'KYC ফৰ্ম আৰু বঞ্চনা ঘোষণা', privateTitle: 'আপোনাৰ তথ্য ইয়াতেই থাকে', privateBody: 'এই এপে ব্যক্তিগত তথ্য সংৰক্ষণ নকৰে।', bring: 'কাগজ-পত্ৰ লগত লৈ যাওক', askHelp: 'সহায় বিচৰা ঠিকেই আছে', doneBody: 'ক’লৈ যাব আৰু কি সুধিব লাগে আপুনি জানে। এই স্ক্ৰীনখন বিশ্বাসৰ মানুহক দেখুৱাব পাৰে।', guidanceReady: 'সহেলী সাজু', serviceUnavailable: 'নিৰ্দেশনা এতিয়া উপলব্ধ নহয়। অলপ পিছত চেষ্টা কৰক।' },
  ur: { scheme: 'پردھان منتری اجولا یوجنا', schemeSub: 'گھر کے LPG کنکشن کی معلومات', goodBody: 'اجولا ان خاندانوں کے لیے ہے جن کے گھر میں ابھی LPG کنکشن نہیں ہے۔', okayBody: 'اس اسکیم کے لیے قریبی گیس ایجنسی سے اپنی صورتحال پوچھیں۔', doc1: 'آدھار کارڈ', doc2: 'راشن کارڈ یا خاندان کا ثبوت', doc3: 'پتے کا ثبوت', doc4: 'بینک اکاؤنٹ کی معلومات', doc5: 'KYC فارم اور محرومی کا اعلان', privateTitle: 'آپ کی معلومات یہیں رہتی ہے', privateBody: 'یہ ایپ ذاتی معلومات محفوظ نہیں کرتی۔', bring: 'کاغذات ساتھ لے جائیں', askHelp: 'مدد مانگنا ٹھیک ہے', doneBody: 'آپ جانتی ہیں کہ کہاں جانا ہے اور کیا پوچھنا ہے۔ یہ اسکرین کسی قابل اعتماد شخص کو دکھا سکتی ہیں۔', guidanceReady: 'سہیلی تیار ہے', serviceUnavailable: 'رہنمائی ابھی دستیاب نہیں۔ کچھ دیر بعد دوبارہ کوشش کریں۔' },
  'hi-Latn': { goodBody: 'Ujjwala un families ke liye hai jinke ghar mein abhi LPG connection nahi hai.', okayBody: 'Is scheme ke liye paas ki gas agency se apni situation poochhein.', doc1: 'Aadhaar card', doc2: 'Ration card ya family proof', doc3: 'Address proof', doc4: 'Bank account details', doc5: 'KYC form aur deprivation declaration', privateTitle: 'Aapki information yahin rehti hai', privateBody: 'Yeh app personal information save nahi karta.', bring: 'Kaagaz saath le jaayein', askHelp: 'Help maangna bilkul theek hai', doneBody: 'Aapko pata hai kahan jaana hai aur kya poochhna hai. Yeh screen kisi trusted person ko dikha sakti hain.', guidanceReady: 'Saheli ready hai', serviceUnavailable: 'Guidance abhi available nahi hai. Thodi der baad phir try karein.' },
  'ta-Latn': { goodBody: 'Veetla innum LPG connection illaadha families-kku Ujjwala scheme.', okayBody: 'Indha scheme-ku pakkathula irukkura gas agency-kitta unga situation kelunga.', doc1: 'Aadhaar card', doc2: 'Ration card illa family proof', doc3: 'Address proof', doc4: 'Bank account details', doc5: 'KYC form matrum deprivation declaration', privateTitle: 'Unga information inga safe-aa irukkum', privateBody: 'Indha app personal information save pannaadhu.', bring: 'Documents-a kooda eduthuttu ponga', askHelp: 'Help kekkaradhu okay', doneBody: 'Enga poganum, enna kekkanum-nu ungalukku theriyum. Indha screen-a nambikkai irukkura orutharukku kaattalaam.', guidanceReady: 'Saheli ready-aa irukku', serviceUnavailable: 'Guidance ippo available illa. Konjam neram kazhichu try pannunga.' },
};

const localizedLabels = {
  bn: { brand: 'সেবা দিদি', tellMe: 'আপনার কী প্রয়োজন বলুন', hearQuestion: 'প্রশ্নটি শুনুন', regionalGroup: 'ভারতীয় ভাষা', codeMixedGroup: 'মিশ্র ভাষায় কথা বলুন' },
  ta: { brand: 'சேவை திடி', tellMe: 'உங்களுக்கு என்ன வேண்டும் என்று சொல்லுங்கள்', hearQuestion: 'கேள்வியைக் கேளுங்கள்', regionalGroup: 'இந்திய மொழிகள்', codeMixedGroup: 'கலப்பு மொழியில் பேசுங்கள்' },
  te: { brand: 'సేవా దీదీ', tellMe: 'మీకు ఏమి కావాలో చెప్పండి', hearQuestion: 'ప్రశ్న వినండి', regionalGroup: 'భారతీయ భాషలు', codeMixedGroup: 'మిశ్రమ భాషలో మాట్లాడండి' },
  mr: { brand: 'सेवा दीदी', tellMe: 'तुम्हाला काय हवे ते सांगा', hearQuestion: 'प्रश्न ऐका', regionalGroup: 'भारतीय भाषा', codeMixedGroup: 'मिश्र भाषेत बोला' },
  kn: { brand: 'ಸೇವಾ ದೀದಿ', tellMe: 'ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ಹೇಳಿ', hearQuestion: 'ಪ್ರಶ್ನೆ ಕೇಳಿ', regionalGroup: 'ಭಾರತೀಯ ಭಾಷೆಗಳು', codeMixedGroup: 'ಮಿಶ್ರ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ' },
  gu: { brand: 'સેવા દીદી', tellMe: 'તમને શું જોઈએ તે કહો', hearQuestion: 'સવાલ સાંભળો', regionalGroup: 'ભારતીય ભાષાઓ', codeMixedGroup: 'મિશ્ર ભાષામાં બોલો' },
  ml: { brand: 'സേവാ ദീദി', tellMe: 'നിങ്ങൾക്ക് എന്താണ് വേണ്ടത് എന്ന് പറയൂ', hearQuestion: 'ചോദ്യം കേൾക്കൂ', regionalGroup: 'ഇന്ത്യൻ ഭാഷകൾ', codeMixedGroup: 'മിശ്ര ഭാഷയിൽ സംസാരിക്കൂ' },
  pa: { brand: 'ਸੇਵਾ ਦੀਦੀ', tellMe: 'ਤੁਹਾਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ ਦੱਸੋ', hearQuestion: 'ਸਵਾਲ ਸੁਣੋ', regionalGroup: 'ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ', codeMixedGroup: 'ਮਿਸ਼ਰਤ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ' },
  or: { brand: 'ସେବା ଦିଦି', tellMe: 'ଆପଣଙ୍କୁ କଣ ଦରକାର କୁହନ୍ତୁ', hearQuestion: 'ପ୍ରଶ୍ନ ଶୁଣନ୍ତୁ', regionalGroup: 'ଭାରତୀୟ ଭାଷା', codeMixedGroup: 'ମିଶ୍ର ଭାଷାରେ କୁହନ୍ତୁ' },
  as: { brand: 'সেৱা দিদি', tellMe: 'আপোনাক কি লাগে কওক', hearQuestion: 'প্ৰশ্নটো শুনক', regionalGroup: 'ভাৰতীয় ভাষা', codeMixedGroup: 'মিশ্ৰ ভাষাত কওক' },
  ur: { brand: 'سیوا دیدی', tellMe: 'آپ کو کیا چاہیے بتائیں', hearQuestion: 'سوال سنیں', regionalGroup: 'ہندوستانی زبانیں', codeMixedGroup: 'ملی جلی زبان میں بولیں' },
  'hi-Latn': { brand: 'Seva Didi', tellMe: 'Aapko kya chahiye batayein', hearQuestion: 'Sawaal suniye', regionalGroup: 'Indian languages', codeMixedGroup: 'Mixed language mein boliye' },
  'ta-Latn': { brand: 'Seva Didi', tellMe: 'Ungalukku enna venum-nu sollunga', hearQuestion: 'Kelviya kelunga', regionalGroup: 'Indian languages', codeMixedGroup: 'Mixed language-la pesunga' },
};

Object.entries(languageDetails).forEach(([code, details]) => Object.assign(copy[code], details));
Object.entries(localizedLabels).forEach(([code, details]) => Object.assign(copy[code], details));

const localizedOfflineLabels = {
  bn: { onboardingLanguage: 'আপনার ভাষা বেছে নিন', offlineReadyTitle: 'ইন্টারনেট ছাড়াও শুরু করতে পারেন', offlineReadyBody: 'প্রয়োজনীয় ধাপ ও কাগজপত্রের তথ্য এই ফোনেই থাকবে। লাইভ AI উত্তর ও সরকারি ওয়েবসাইটের জন্য ইন্টারনেট দরকার।', offlineTitle: 'আপনি এখন অফলাইনে আছেন', offlineBody: 'প্রয়োজনীয় নির্দেশনা চলছে। লাইভ AI উত্তর ও সরকারি ওয়েবসাইটের জন্য ইন্টারনেট চালু করুন।', offlineAction: 'ইন্টারনেট সহায়তা', internetTitle: 'ইন্টারনেট চালু করুন', internetBody: 'মোবাইল ডেটা বা Wi‑Fi চালু করুন। আপনার অগ্রগতি এই ফোনে থাকবে। তারপর আবার চেষ্টা করুন।', internetAction: 'আবার দেখুন' },
  ta: { onboardingLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', offlineReadyTitle: 'இணையம் இல்லாமலும் தொடங்கலாம்', offlineReadyBody: 'முக்கிய படிகள் மற்றும் ஆவணத் தகவல் இந்த போனிலேயே இருக்கும். நேரடி AI பதிலுக்கும் அதிகாரப்பூர்வ இணையதளத்திற்கும் இணையம் தேவை.', offlineTitle: 'நீங்கள் இப்போது ஆஃப்லைனில் உள்ளீர்கள்', offlineBody: 'முக்கிய வழிகாட்டுதல் தொடர்ந்து கிடைக்கும். நேரடி AI பதிலுக்கும் அதிகாரப்பூர்வ இணையதளத்திற்கும் இணையத்தை இயக்குங்கள்.', offlineAction: 'இணைய உதவி', internetTitle: 'இணையத்தை இயக்குங்கள்', internetBody: 'மொபைல் டேட்டா அல்லது Wi‑Fi-ஐ இயக்குங்கள். உங்கள் முன்னேற்றம் இந்த போனில் இருக்கும். பிறகு முயற்சிக்கவும்.', internetAction: 'மீண்டும் பார்க்கவும்' },
  te: { onboardingLanguage: 'మీ భాషను ఎంచుకోండి', offlineReadyTitle: 'ఇంటర్నెట్ లేకుండానే ప్రారంభించవచ్చు', offlineReadyBody: 'ముఖ్యమైన దశలు, పత్రాల సమాచారం ఈ ఫోన్‌లోనే ఉంటుంది. లైవ్ AI సమాధానాలు, అధికారిక వెబ్‌సైట్‌కు ఇంటర్నెట్ అవసరం.', offlineTitle: 'మీరు ఇప్పుడు ఆఫ్‌లైన్‌లో ఉన్నారు', offlineBody: 'ముఖ్యమైన మార్గదర్శనం పనిచేస్తుంది. లైవ్ AI సమాధానాలు, అధికారిక వెబ్‌సైట్ కోసం ఇంటర్నెట్ ఆన్ చేయండి.', offlineAction: 'ఇంటర్నెట్ సహాయం', internetTitle: 'ఇంటర్నెట్ ఆన్ చేయండి', internetBody: 'మొబైల్ డేటా లేదా Wi‑Fi ఆన్ చేయండి. మీ పురోగతి ఈ ఫోన్‌లో ఉంటుంది. తర్వాత మళ్లీ ప్రయత్నించండి.', internetAction: 'మళ్లీ తనిఖీ చేయండి' },
  mr: { onboardingLanguage: 'तुमची भाषा निवडा', offlineReadyTitle: 'इंटरनेटशिवायही सुरुवात करू शकता', offlineReadyBody: 'महत्त्वाच्या पायऱ्या आणि कागदपत्रांची माहिती या फोनमध्येच राहील. थेट AI मदत आणि अधिकृत वेबसाइटसाठी इंटरनेट लागेल.', offlineTitle: 'तुम्ही सध्या ऑफलाइन आहात', offlineBody: 'महत्त्वाचे मार्गदर्शन सुरू आहे. थेट AI मदत आणि अधिकृत वेबसाइटसाठी इंटरनेट सुरू करा.', offlineAction: 'इंटरनेट मदत', internetTitle: 'इंटरनेट सुरू करा', internetBody: 'मोबाइल डेटा किंवा Wi‑Fi सुरू करा. तुमची प्रगती या फोनमध्ये राहील. मग पुन्हा प्रयत्न करा.', internetAction: 'पुन्हा तपासा' },
  kn: { onboardingLanguage: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ', offlineReadyTitle: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಪ್ರಾರಂಭಿಸಬಹುದು', offlineReadyBody: 'ಮುಖ್ಯ ಹಂತಗಳು ಮತ್ತು ದಾಖಲೆಗಳ ಮಾಹಿತಿ ಈ ಫೋನ್‌ನಲ್ಲೇ ಇರುತ್ತದೆ. ಲೈವ್ AI ಉತ್ತರಗಳು ಮತ್ತು ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಇಂಟರ್ನೆಟ್ ಬೇಕು.', offlineTitle: 'ನೀವು ಈಗ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ', offlineBody: 'ಮುಖ್ಯ ಮಾರ್ಗದರ್ಶನ ಮುಂದುವರಿಯುತ್ತದೆ. ಲೈವ್ AI ಉತ್ತರಗಳು ಮತ್ತು ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗಾಗಿ ಇಂಟರ್ನೆಟ್ ಆನ್ ಮಾಡಿ.', offlineAction: 'ಇಂಟರ್ನೆಟ್ ಸಹಾಯ', internetTitle: 'ಇಂಟರ್ನೆಟ್ ಆನ್ ಮಾಡಿ', internetBody: 'ಮೊಬೈಲ್ ಡೇಟಾ ಅಥವಾ Wi‑Fi ಆನ್ ಮಾಡಿ. ನಿಮ್ಮ ಪ್ರಗತಿ ಈ ಫೋನ್‌ನಲ್ಲೇ ಇರುತ್ತದೆ. ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', internetAction: 'ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ' },
  gu: { onboardingLanguage: 'તમારી ભાષા પસંદ કરો', offlineReadyTitle: 'ઇન્ટરનેટ વગર પણ શરૂઆત કરી શકો છો', offlineReadyBody: 'મહત્વના પગલાં અને કાગળોની માહિતી આ ફોનમાં જ રહેશે. લાઇવ AI જવાબો અને અધિકૃત વેબસાઇટ માટે ઇન્ટરનેટ જોઈએ.', offlineTitle: 'તમે હાલમાં ઑફલાઇન છો', offlineBody: 'મહત્વપૂર્ણ માર્ગદર્શન ચાલુ છે. લાઇવ AI જવાબો અને અધિકૃત વેબસાઇટ માટે ઇન્ટરનેટ ચાલુ કરો.', offlineAction: 'ઇન્ટરનેટ મદદ', internetTitle: 'ઇન્ટરનેટ ચાલુ કરો', internetBody: 'મોબાઇલ ડેટા અથવા Wi‑Fi ચાલુ કરો. તમારી પ્રગતિ આ ફોનમાં રહેશે. પછી ફરી પ્રયાસ કરો.', internetAction: 'ફરી તપાસો' },
  ml: { onboardingLanguage: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കൂ', offlineReadyTitle: 'ഇന്റർനെറ്റ് ഇല്ലാതെയും തുടങ്ങാം', offlineReadyBody: 'പ്രധാന ഘട്ടങ്ങളും രേഖാ വിവരങ്ങളും ഈ ഫോണിൽ തന്നെ ലഭിക്കും. ലൈവ് AI മറുപടികൾക്കും ഔദ്യോഗിക വെബ്സൈറ്റിനും ഇന്റർനെറ്റ് വേണം.', offlineTitle: 'നിങ്ങൾ ഇപ്പോൾ ഓഫ്‌ലൈനിലാണ്', offlineBody: 'പ്രധാന മാർഗനിർദേശം തുടരും. ലൈവ് AI മറുപടികൾക്കും ഔദ്യോഗിക വെബ്സൈറ്റിനും ഇന്റർനെറ്റ് ഓൺ ചെയ്യൂ.', offlineAction: 'ഇന്റർനെറ്റ് സഹായം', internetTitle: 'ഇന്റർനെറ്റ് ഓൺ ചെയ്യൂ', internetBody: 'മൊബൈൽ ഡാറ്റയോ Wi‑Fi-യോ ഓൺ ചെയ്യൂ. നിങ്ങളുടെ പുരോഗതി ഈ ഫോണിൽ തുടരും. ശേഷം വീണ്ടും ശ്രമിക്കൂ.', internetAction: 'വീണ്ടും പരിശോധിക്കൂ' },
  pa: { onboardingLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', offlineReadyTitle: 'ਇੰਟਰਨੈੱਟ ਤੋਂ ਬਿਨਾਂ ਵੀ ਸ਼ੁਰੂ ਕਰ ਸਕਦੇ ਹੋ', offlineReadyBody: 'ਜ਼ਰੂਰੀ ਕਦਮ ਅਤੇ ਕਾਗਜ਼ਾਂ ਦੀ ਜਾਣਕਾਰੀ ਇਸ ਫੋਨ ਵਿੱਚ ਰਹੇਗੀ। ਲਾਈਵ AI ਜਵਾਬਾਂ ਅਤੇ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ ਲਈ ਇੰਟਰਨੈੱਟ ਚਾਹੀਦਾ ਹੈ।', offlineTitle: 'ਤੁਸੀਂ ਇਸ ਵੇਲੇ ਆਫਲਾਈਨ ਹੋ', offlineBody: 'ਜ਼ਰੂਰੀ ਮਾਰਗਦਰਸ਼ਨ ਚੱਲ ਰਿਹਾ ਹੈ। ਲਾਈਵ AI ਜਵਾਬਾਂ ਅਤੇ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ ਲਈ ਇੰਟਰਨੈੱਟ ਚਾਲੂ ਕਰੋ।', offlineAction: 'ਇੰਟਰਨੈੱਟ ਮਦਦ', internetTitle: 'ਇੰਟਰਨੈੱਟ ਚਾਲੂ ਕਰੋ', internetBody: 'ਮੋਬਾਈਲ ਡਾਟਾ ਜਾਂ Wi‑Fi ਚਾਲੂ ਕਰੋ। ਤੁਹਾਡੀ ਤਰੱਕੀ ਇਸ ਫੋਨ ਵਿੱਚ ਰਹੇਗੀ। ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', internetAction: 'ਫਿਰ ਜਾਂਚੋ' },
  or: { onboardingLanguage: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ', offlineReadyTitle: 'ଇଣ୍ଟରନେଟ ବିନା ମଧ୍ୟ ଆରମ୍ଭ କରିପାରିବେ', offlineReadyBody: 'ଜରୁରୀ ପଦକ୍ଷେପ ଓ କାଗଜପତ୍ରର ସୂଚନା ଏହି ଫୋନରେ ରହିବ। ଲାଇଭ AI ଉତ୍ତର ଓ ଅଧିକୃତ ୱେବସାଇଟ ପାଇଁ ଇଣ୍ଟରନେଟ ଦରକାର।', offlineTitle: 'ଆପଣ ବର୍ତ୍ତମାନ ଅଫଲାଇନରେ ଅଛନ୍ତି', offlineBody: 'ଜରୁରୀ ମାର୍ଗଦର୍ଶନ ଚାଲୁ ଅଛି। ଲାଇଭ AI ଉତ୍ତର ଓ ଅଧିକୃତ ୱେବସାଇଟ ପାଇଁ ଇଣ୍ଟରନେଟ ଚାଲୁ କରନ୍ତୁ।', offlineAction: 'ଇଣ୍ଟରନେଟ ସହାୟତା', internetTitle: 'ଇଣ୍ଟରନେଟ ଚାଲୁ କରନ୍ତୁ', internetBody: 'ମୋବାଇଲ ଡାଟା କିମ୍ବା Wi‑Fi ଚାଲୁ କରନ୍ତୁ। ଆପଣଙ୍କ ପ୍ରଗତି ଏହି ଫୋନରେ ରହିବ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।', internetAction: 'ପୁଣି ଯାଞ୍ଚ କରନ୍ତୁ' },
  as: { onboardingLanguage: 'আপোনাৰ ভাষা বাছক', offlineReadyTitle: 'ইণ্টাৰনেট নোহোৱাকৈও আৰম্ভ কৰিব পাৰে', offlineReadyBody: 'জৰুৰী পদক্ষেপ আৰু কাগজ-পত্ৰৰ তথ্য এই ফোনতে থাকিব। লাইভ AI উত্তৰ আৰু চৰকাৰী ৱেবছাইটৰ বাবে ইণ্টাৰনেট লাগে।', offlineTitle: 'আপুনি এতিয়া অফলাইনত আছে', offlineBody: 'জৰুৰী নিৰ্দেশনা চলি আছে। লাইভ AI উত্তৰ আৰু চৰকাৰী ৱেবছাইটৰ বাবে ইণ্টাৰনেট অন কৰক।', offlineAction: 'ইণ্টাৰনেট সহায়', internetTitle: 'ইণ্টাৰনেট অন কৰক', internetBody: 'মোবাইল ডেটা বা Wi‑Fi অন কৰক। আপোনাৰ অগ্ৰগতি এই ফোনতে থাকিব। তাৰ পিছত আকৌ চেষ্টা কৰক।', internetAction: 'আকৌ পৰীক্ষা কৰক' },
  ur: { onboardingLanguage: 'اپنی زبان منتخب کریں', offlineReadyTitle: 'انٹرنیٹ کے بغیر بھی شروع کر سکتی ہیں', offlineReadyBody: 'ضروری مراحل اور کاغذات کی معلومات اسی فون میں رہے گی۔ براہ راست AI جواب اور سرکاری ویب سائٹ کے لیے انٹرنیٹ چاہیے۔', offlineTitle: 'آپ اس وقت آف لائن ہیں', offlineBody: 'ضروری رہنمائی جاری ہے۔ براہ راست AI جواب اور سرکاری ویب سائٹ کے لیے انٹرنیٹ آن کریں۔', offlineAction: 'انٹرنیٹ مدد', internetTitle: 'انٹرنیٹ آن کریں', internetBody: 'موبائل ڈیٹا یا Wi‑Fi آن کریں۔ آپ کی پیش رفت اسی فون میں رہے گی۔ پھر دوبارہ کوشش کریں۔', internetAction: 'دوبارہ چیک کریں' },
  'hi-Latn': { onboardingLanguage: 'Apni bhasha chuniye', offlineReadyTitle: 'Internet ke bina bhi shuru kar sakti hain', offlineReadyBody: 'Zaroori steps aur documents ki jaankari isi phone mein rahegi. Live AI jawab aur official website ke liye internet chahiye.', offlineTitle: 'Aap abhi offline hain', offlineBody: 'Zaroori guidance chalti rahegi. Live AI jawab aur official website ke liye internet on kijiye.', offlineAction: 'Internet help', internetTitle: 'Internet on kijiye', internetBody: 'Mobile data ya Wi‑Fi on kijiye. Aapki progress isi phone mein rahegi. Phir try kijiye.', internetAction: 'Dobara check karein' },
  'ta-Latn': { onboardingLanguage: 'Unga mozhiya select pannunga', offlineReadyTitle: 'Internet illaamalum start pannalaam', offlineReadyBody: 'Mukkiya steps matrum documents information indha phone-la irukkum. Live AI answers matrum official website-ku internet venum.', offlineTitle: 'Neenga ippo offline-la irukkeenga', offlineBody: 'Mukkiya guidance continue aagum. Live AI answers matrum official website-ku internet on pannunga.', offlineAction: 'Internet help', internetTitle: 'Internet on pannunga', internetBody: 'Mobile data illa Wi‑Fi on pannunga. Unga progress indha phone-la irukkum. Appuram try pannunga.', internetAction: 'Marubadi check pannunga' },
};

Object.entries(localizedOfflineLabels).forEach(([code, details]) => Object.assign(copy[code], details));

const quickTopicsTranslations = {
  hi: {
    title: 'सीधे एक बार छूकर पूछें:',
    gas: 'गैस कनेक्शन',
    skill: 'सिलाई व हुनर केंद्र',
    maternity: 'मातृत्व सहायता ₹5,000',
    ration: 'मुफ्त राशन योजना',
    safety: 'महिला सुरक्षा 181',
    janDhan: 'जन धन खाता',
  },
  en: {
    title: 'Popular topics to ask or tap:',
    gas: 'LPG Gas Connection',
    skill: 'Tailoring & Skills',
    maternity: 'Maternity Benefit ₹5,000',
    ration: 'Ration & Food Security',
    safety: 'Women Helpline 181',
    janDhan: 'Jan Dhan Account',
  },
  bn: {
    title: 'সরাসরি স্পর্শ করে জানুন:',
    gas: 'গ্যাস সংযোগ',
    skill: 'সেলাই ও প্রশিক্ষণ',
    maternity: 'মাতৃত্ব সহায়তা ₹৫,০০০',
    ration: 'বিনামূল্যে রেশন',
    safety: 'মহিলা হেল্পলাইন ১৮১',
    janDhan: 'জন ধন অ্যাকাউন্ট',
  },
  ta: {
    title: 'தொட்டு தெரிந்துகொள்ளுங்கள்:',
    gas: 'கேஸ் இணைப்பு',
    skill: 'தையல் & பயிற்சி',
    maternity: 'மகப்பேறு உதவி ₹5,000',
    ration: 'இலவச ரேஷன்',
    safety: 'மகளிர் உதவி 181',
    janDhan: 'ஜன் தன் கணக்கு',
  },
  te: {
    title: 'తాకి తెలుసుకోండి:',
    gas: 'గ్యాస్ కనెక్షన్',
    skill: 'కుట్టు శిక్షణ & నైపుణ్యాలు',
    maternity: 'మాతృత్వ సహాయం ₹5,000',
    ration: 'ఉచిత రేషన్',
    safety: 'మహిళా హెల్ప్‌లైన్ 181',
    janDhan: 'జన్ ధన్ ఖాతా',
  },
  mr: {
    title: 'स्पर्श करून माहिती घ्या:',
    gas: 'गॅस कनेक्शन',
    skill: 'शिलाई व कौशल्य केंद्र',
    maternity: 'मातृत्व सहाय्य ₹५,०००',
    ration: 'मोफत रेशन',
    safety: 'महिला सुरक्षा १८१',
    janDhan: 'जन धन खाते',
  },
  kn: {
    title: 'ಒಮ್ಮೆ ಸ್ಪರ್ಶಿಸಿ ಕೇಳಿ:',
    gas: 'ಗ್ಯಾಸ್ ಸಂಪರ್ಕ',
    skill: 'ಹೊಲಿಗೆ ಮತ್ತು ಕೌಶಲ್ಯ',
    maternity: 'ಮಾತೃತ್ವ ನೆರವು ₹5,000',
    ration: 'ಉಚಿತ ರೇಷನ್',
    safety: 'ಮಹಿಳಾ ಸಹಾಯವಾಣಿ 181',
    janDhan: 'ಜನ್ ಧನ್ ಖಾತೆ',
  },
  gu: {
    title: 'સ્પર્શ કરીને માહિતી મેળવો:',
    gas: 'ગેસ કનેક્શન',
    skill: 'સીવણ અને કૌશલ્ય',
    maternity: 'માતૃત્વ સહાય ₹5,000',
    ration: 'મફત રાશન',
    safety: 'મહિલા સુરક્ષા 181',
    janDhan: 'જન ધન ખાતું',
  },
  ml: {
    title: 'തൊട്ട് ചോദിക്കൂ:',
    gas: 'ഗ്യാസ് കണക്ഷൻ',
    skill: 'തയ്യൽ & നൈപുണ്യം',
    maternity: 'മാതൃത്വ സഹായം ₹5,000',
    ration: 'സൗജന്യ റേഷൻ',
    safety: 'വനിതാ ഹെൽപ്‌ലൈൻ 181',
    janDhan: 'ജൻ ധൻ അക്കൗണ്ട്',
  },
  pa: {
    title: 'ਸਿੱਧਾ ਛੂਹ ਕੇ ਪੁੱਛੋ:',
    gas: 'ਗੈਸ ਕਨੈਕਸ਼ਨ',
    skill: 'ਸਿਲਾਈ ਤੇ ਹੁਨਰ',
    maternity: 'ਮਾਤ੍ਰਤਵ ਸਹਾਇਤਾ ₹5,000',
    ration: 'ਮੁਫ਼ਤ ਰਾਸ਼ਨ',
    safety: 'ਮਹਿਲਾ ਹੈਲਪਲਾਈਨ 181',
    janDhan: 'ਜਨ ਧਨ ਖਾਤਾ',
  },
  or: {
    title: 'ଥରେ ଛୁଇଁ ପଚାରନ୍ତୁ:',
    gas: 'ଗ୍ୟାସ ସଂଯୋଗ',
    skill: 'ସିଲେଇ ଓ ପ୍ରଶିକ୍ଷଣ',
    maternity: 'ମାତୃତ୍ୱ ସହାୟତା ₹୫,୦୦୦',
    ration: 'ମାଗଣା ରାସନ',
    safety: 'ମହିଳା ହେଲ୍ପଲାଇନ ୧୮୧',
    janDhan: 'ଜନ ଧନ ଖାତା',
  },
  as: {
    title: 'স্পৰ্শ কৰি সোধক:',
    gas: 'গেছ সংযোগ',
    skill: 'চিলাই আৰু প্ৰশিক্ষণ',
    maternity: 'মাতৃত্ব সাহায্য ₹৫,০০০',
    ration: 'বিনামূলীয়া ৰেচন',
    safety: 'মহিলা হেল্পলাইন ১৮১',
    janDhan: 'জন ধন একাউণ্ট',
  },
  ur: {
    title: 'براہ راست چھو کر پوچھیں:',
    gas: 'گیس کنکشن',
    skill: 'سلائی و ہنر مرکز',
    maternity: 'مامتا امداد ۵،۰۰۰ روپے',
    ration: 'مفت راشن اسکیم',
    safety: 'خواتین ہیلپ لائن ۱৮۱',
    janDhan: 'جن دھن اکاؤنٹ',
  },
  'hi-Latn': {
    title: 'Touch karke poohein:',
    gas: 'Gas connection',
    skill: 'Silai & skill training',
    maternity: 'Maternity benefit ₹5,000',
    ration: 'Free ration scheme',
    safety: 'Women helpline 181',
    janDhan: 'Jan Dhan account',
  },
  'ta-Latn': {
    title: 'Touch panni kelunga:',
    gas: 'Gas connection',
    skill: 'Tailoring & skill training',
    maternity: 'Maternity aid ₹5,000',
    ration: 'Free ration scheme',
    safety: 'Women helpline 181',
    janDhan: 'Jan Dhan account',
  },
};

const steps = ['eligibility', 'documents', 'visit'];

function HandWheatSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 36V12" />
      <path d="M20 12C18 9 13 8 13 13C13 18 18 19 20 19" />
      <path d="M20 12C22 9 27 8 27 13C27 18 22 19 20 19" />
      <path d="M20 19C17 16 11 16 12 22C13 26 18 25 20 25" />
      <path d="M20 19C23 16 29 16 28 22C27 26 22 25 20 25" />
      <path d="M20 25C17 23 12 24 13 29C14 32 18 31 20 31" />
      <path d="M20 25C23 23 28 24 27 29C26 32 22 31 20 31" />
      <path d="M20 12V4" />
    </svg>
  );
}

function HandFlameSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4C20 4 14 11 14 19C14 26.5 17 33 20 35C23 33 26 26.5 26 19C26 14 23 9 20 4Z" />
      <path d="M20 35C14 34 8 28 8 21C8 16 11 12 13 10C12 14 13 18 16 21" />
      <path d="M20 35C26 34 32 28 32 21C32 16 29 12 27 10C28 14 27 18 24 21" />
      <path d="M20 23C19 25 18 27 18 29C18 31 19 33 20 34C21 33 22 31 22 29C22 27 21 25 20 23Z" />
    </svg>
  );
}

function HandLeafSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 34C11 26 19 14 32 6C32 19 26 27 18 30C14 31 10 32 8 34Z" />
      <path d="M8 34C14 26 22 17 30 9" />
      <path d="M16 23C20 23 23 21 25 18" />
      <path d="M12 28C15 28 18 26 20 23" />
    </svg>
  );
}

function HandAmuletSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 5L8 10V20C8 28 13.5 34 20 36C26.5 34 32 28 32 20V10L20 5Z" />
      <path d="M20 13V27" />
      <path d="M13 20H27" />
    </svg>
  );
}

function HandRupeeSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="20" cy="20" r="15" />
      <path d="M14 13H26" />
      <path d="M14 18H24" />
      <path d="M17 13V22C20 22 23 21 23 18C23 15 20 14 17 14" />
      <path d="M17 22L25 30" />
    </svg>
  );
}

function HandScissorsSvg({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="14" r="5" />
      <circle cx="12" cy="28" r="5" />
      <path d="M16 17L30 31" />
      <path d="M16 25L30 11" />
    </svg>
  );
}

function HandCheckSvg({ size = 64, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 36L26 50L54 14" />
    </svg>
  );
}

function speak(text, lang) {
  speakText(text, lang);
}



const RESOURCE_ICONS = {
  safety: ShieldAlert,
  rights: Scale,
  health: HeartPulse,
  family: Users,
  money: WalletCards,
  documents: FileText,
  work: Briefcase,
  skills: GraduationCap,
  business: Landmark,
  discover: BookOpen,
};

function resourceText(resource, lang) {
  const isHindi = lang === 'hi';
  return {
    title: isHindi && resource.titleHi ? resource.titleHi : resource.title,
    summary: isHindi && resource.summaryHi ? resource.summaryHi : resource.summary,
    nextStep: isHindi && resource.nextStepHi ? resource.nextStepHi : resource.nextStep,
  };
}

function ResourceHub({ lang, t, search, setSearch, selectedId, setSelectedId, onBack, onOfficialClick, onSpeak, isOnline, guidanceMode }) {
  const [category, setCategory] = useState('all');
  const [datasetResults, setDatasetResults] = useState([]);
  const [isDatasetSearching, setIsDatasetSearching] = useState(false);
  const [resourceGuidance, setResourceGuidance] = useState('');
  const [isGuiding, setIsGuiding] = useState(false);
  const filteredResources = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const queryTerms = query.split(/\s+/).filter((term) => term.length > 1);
    return RESOURCE_CATALOG.filter((resource) => {
      const matchesCategory = category === 'all' || resource.category === category;
      const searchable = [resource.title, resource.titleHi, resource.summary, resource.summaryHi, ...resource.keywords].filter(Boolean).join(' ').toLocaleLowerCase();
      const matchesSearch = !queryTerms.length || queryTerms.some((term) => searchable.includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);
  const datasetResources = useMemo(() => datasetResults.map((resource) => ({ ...resource, icon: 'discover' })), [datasetResults]);
  const visibleResources = useMemo(() => category === 'all' ? [...filteredResources, ...datasetResources] : filteredResources, [category, datasetResources, filteredResources]);
  const selectedResource = visibleResources.find((resource) => resource.id === selectedId) || null;

  useEffect(() => {
    const query = search.trim();
    if (!isOnline || query.length < 2) {
      setDatasetResults([]);
      setIsDatasetSearching(false);
      return undefined;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsDatasetSearching(true);
      try {
        const payload = await searchSchemeCatalog(query, { limit: 12 });
        if (active) setDatasetResults(Array.isArray(payload.results) ? payload.results : []);
      } catch {
        if (active) setDatasetResults([]);
      } finally {
        if (active) setIsDatasetSearching(false);
      }
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isOnline, search]);

  useEffect(() => {
    if (visibleResources.length > 0 && !selectedResource) setSelectedId(visibleResources[0].id);
  }, [selectedResource, setSelectedId, visibleResources]);

  useEffect(() => {
    setResourceGuidance('');
  }, [selectedId]);

  async function explainResource(resource) {
    const text = resourceText(resource, lang);
    setIsGuiding(true);
    if (!isOnline || guidanceMode !== 'live') {
      setResourceGuidance(text.nextStep);
      onSpeak(`${text.title}. ${text.nextStep}`, lang);
      setIsGuiding(false);
      return;
    }
    try {
      const guidance = await getGeminiGuidance({ language: lang, resourceId: resource.id });
      setResourceGuidance(`${guidance.answer} ${guidance.nextStep}`);
      onSpeak(guidance.speakText, lang);
    } catch {
      setResourceGuidance(text.nextStep);
      onSpeak(`${text.title}. ${text.nextStep}`, lang);
    } finally {
      setIsGuiding(false);
    }
  }

  const categoryLabel = (item) => lang === 'hi' ? item.labelHi : item.label;
  const resourceLabel = (resource) => resource.category === 'dataset' ? t.datasetMatch : categoryLabel(RESOURCE_CATEGORIES.find((item) => item.id === resource.category) || RESOURCE_CATEGORIES[0]);

  return (
    <section className="resource-hub page-enter">
      <button type="button" className="resource-back" onClick={onBack}><ArrowLeft size={16} /> {t.backHome}</button>
      <div className="resource-header">
        <div>
          <h1>{t.catalogTitle}</h1>
          <p>{t.catalogBody}</p>
        </div>
        <span className="resource-total"><strong>{RESOURCE_CATALOG.length}</strong> <small>{t.resourceCount}</small></span>
      </div>
      <div className="resource-search-row">
        <label className="resource-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchServices} aria-label={t.searchServices} /></label>
        <span className="directory-note"><ShieldCheck size={15} /> {t.directoryOffline}</span>
      </div>
      {isDatasetSearching && <p className="dataset-searching" role="status"><Search size={14} /> {t.datasetSearching}</p>}
      <div className="resource-filters" role="list" aria-label={t.catalogTitle}>
        {RESOURCE_CATEGORIES.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{categoryLabel(item)}</button>)}
      </div>
      <div className="resource-layout">
        <div className="resource-list" aria-live="polite">
          {filteredResources.map((resource) => {
            const Icon = RESOURCE_ICONS[resource.icon] || BookOpen;
            const text = resourceText(resource, lang);
            const isSelected = resource.id === selectedId;
            return <button type="button" key={resource.id} className={`resource-row ${isSelected ? 'active' : ''}`} onClick={() => setSelectedId(resource.id)} aria-pressed={isSelected}>
              <span className={`resource-row-icon ${resource.category}`}><Icon size={19} /></span>
              <span className="resource-row-copy"><small>{resourceLabel(resource)}</small><strong>{text.title}</strong><span>{text.summary}</span></span>
              <ArrowRight size={17} />
            </button>;
          })}
          {category === 'all' && datasetResources.length > 0 && <div className="dataset-matches">
            <p className="dataset-heading">{t.datasetMatches}</p>
            {datasetResources.map((resource) => {
              const isSelected = resource.id === selectedId;
              return <button type="button" key={resource.id} className={`resource-row dataset-row ${isSelected ? 'active' : ''}`} onClick={() => setSelectedId(resource.id)} aria-pressed={isSelected}>
                <span className="resource-row-icon dataset"><BookOpen size={19} /></span>
                <span className="resource-row-copy"><small>{resourceLabel(resource)}{resource.state ? ` · ${resource.state}` : ''}</small><strong>{resource.title}</strong><span>{resource.summary}</span></span>
                <ArrowRight size={17} />
              </button>;
            })}
          </div>}
          {!filteredResources.length && !datasetResources.length && <div className="resource-empty"><Search size={20} /><strong>{t.noMatches}</strong></div>}
        </div>
        {selectedResource && <aside className="resource-detail">
          {(() => {
            const Icon = RESOURCE_ICONS[selectedResource.icon] || BookOpen;
            const text = resourceText(selectedResource, lang);
            return <>
              <div className="resource-detail-icon"><Icon size={23} /></div>
              <p className="resource-detail-category">{resourceLabel(selectedResource)}</p>
              <h2>{text.title}</h2>
              <p className="resource-detail-summary">{text.summary}</p>
              {selectedResource.category === 'dataset' && <p className="resource-dataset-meta">{selectedResource.state}{selectedResource.ministry ? ` · ${selectedResource.ministry}` : ''}</p>}
              <div className="resource-fact"><small>{t.resourceWhatFor}</small><p>{selectedResource.whatFor}</p></div>
              <div className="resource-fact next"><small>{t.resourceNextStep}</small><p>{text.nextStep}</p></div>
              {resourceGuidance && resourceGuidance !== text.nextStep && <div className="resource-guidance" aria-live="polite"><Info size={16} /><p>{resourceGuidance}</p></div>}
              {selectedResource.category === 'dataset' && <p className="resource-source-note">{t.datasetSource}</p>}
              <div className="resource-detail-actions">
                {selectedResource.phone && <a className="listen-button" href={`tel:${selectedResource.phone}`}><Phone size={16} /> {t.callNow} · {selectedResource.phone}</a>}
                <a className="continue-button" href={selectedResource.officialUrl} onClick={(event) => onOfficialClick(event)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {t.openOfficial}</a>
              </div>
              <button type="button" className="resource-speak" onClick={() => explainResource(selectedResource)} disabled={isGuiding}><Volume2 size={16} /> {isGuiding ? t.oneMoment : t.guideWithSaheli}</button>
            </>;
          })()}
        </aside>}
      </div>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState('hi');
  const [screen, setScreen] = useState('home');
  const [activeJourney, setActiveJourney] = useState('pmuy-new-connection');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [message, setMessage] = useState('');
  const [inputText, setInputText] = useState('');
  const [assistantHint, setAssistantHint] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [serviceError, setServiceError] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [guidanceMode, setGuidanceMode] = useState(() => (navigator.onLine ? 'checking' : 'local'));
  const [showInternetPrompt, setShowInternetPrompt] = useState(false);
  const [showVoiceHelpModal, setShowVoiceHelpModal] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceSelection, setResourceSelection] = useState('pmuy-new-connection');
  const [detectedToast, setDetectedToast] = useState('');
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);

  // Advanced Voice Controller state
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'recording' | 'processing' | 'permission_denied' | 'error'
  const [voiceErrorMsg, setVoiceErrorMsg] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isMicSpeaking, setIsMicSpeaking] = useState(false);
  const [voiceDetectedLang, setVoiceDetectedLang] = useState('');

  const recognitionRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const sessionSeedRef = useRef('');
  const toastTimerRef = useRef(null);

  const t = useMemo(() => ({ ...copy.en, ...(copy[lang] || {}) }), [lang]);
  const quickT = useMemo(() => quickTopicsTranslations[lang] || quickTopicsTranslations.en, [lang]);
  const languageMeta = getLanguageMeta(lang);
  const currentStep = steps.indexOf(screen);
  const progress = screen === 'home' ? 0 : screen === 'done' ? 100 : ((currentStep + 1) / steps.length) * 100;

  const currentJourneyData = useMemo(() => {
    if (activeJourney === 'skill-india') {
      return {
        id: 'skill-india',
        title: t.journeySkillTitle || 'प्रधानमंत्री कौशल विकास योजना',
        sub: t.journeySkillSub || 'मुफ्त सिलाई, कढ़ाई व हुनर प्रशिक्षण',
        questionTitle: t.journeySkillQuestionTitle || 'क्या आप अपने नज़दीक मुफ्त हुनर सीखना चाहती हैं?',
        questionHint: t.journeySkillQuestionHint || 'सिलाई-कढ़ाई, हैंडीक्राफ्ट या कंप्यूटर जैसी ट्रेनिंग महिलाओं को बिल्कुल मुफ्त मिलती है।',
        no: t.journeySkillNo || 'हाँ, मैं सिलाई या नया काम सीखना चाहती हूँ',
        noSub: t.journeySkillNoSub || 'आपके ब्लॉक या ज़िले में ट्रेनिंग केंद्र उपलब्ध हैं।',
        yes: t.journeySkillYes || 'मैं केवल जानकारी लेना चाहती हूँ',
        yesSub: t.journeySkillYesSub || 'आप कभी भी ट्रेनिंग समय और कोर्स के बारे में पूछ सकती हैं।',
        goodTitle: t.journeySkillGoodTitle || 'शानदार! हुनर सीखकर आत्मनिर्भर बनें',
        goodBody: t.journeySkillGoodBody || 'सरकारी ट्रेनिंग के साथ सरकारी प्रमाणपत्र और आर्थिक मदद भी मिलती है।',
        okayTitle: t.journeySkillOkayTitle || 'जानकारी नोट करें',
        okayBody: t.journeySkillOkayBody || 'नज़दीकी प्रधानमंत्री कौशल केंद्र में जाकर विभिन्न कोर्स देख सकती हैं।',
        documentsTitle: t.journeySkillDocumentsTitle || 'हुनर केंद्र के लिए ज़रूरी कागज़ात',
        documentsBody: t.journeySkillDocumentsBody || 'प्रशिक्षण केंद्र में दाखिले के लिए बस यह कागज़ात चाहिए:',
        docs: [
          t.journeySkillDoc1 || 'आधार कार्ड',
          t.journeySkillDoc2 || 'बैंक पासबुक (ट्रेनिंग स्टाइपेंड के लिए)',
          t.journeySkillDoc3 || '2 पासपोर्ट साइज फोटो',
          t.journeySkillDoc4 || 'मोबाइल नंबर',
          t.journeySkillDoc5 || 'पिछली पढ़ाई का कोई प्रमाण (यदि हो, अनिवार्य नहीं)'
        ],
        nextTitle: t.journeySkillNextTitle || 'नज़दीकी कौशल केंद्र (PMKK) या ब्लॉक कार्यालय जाएं',
        nextBody: t.journeySkillNextBody || 'वहां जाकर केंद्र प्रभारी से सीधे यह कहें:',
        sayThis: t.journeySkillSayThis || 'नमस्ते, मुझे महिलाओं के लिए सिलाई या हुनर प्रशिक्षण बैच में अपना नाम लिखवाना है।',
        bring: t.journeySkillBring || 'आधार कार्ड और फोटो साथ रखें',
        askHelp: t.journeySkillAskHelp || 'कोर्स की अवधि और समय अपनी सुविधानुसार चुनें',
        doneTitle: t.journeySkillDoneTitle || 'सफलता की नई शुरुआत!',
        doneBody: t.journeySkillDoneBody || 'कोर्स पूरा होने पर सरकार द्वारा मान्यता प्राप्त प्रमाणपत्र मिलेगा जिससे आप अपना काम शुरू कर सकती हैं।',
        helplineLabel: t.journeySkillHelplineLabel || 'कौशल विकास टोल-फ्री हेल्पलाइन',
        helplineNumber: t.journeySkillHelplineNumber || '088000-55555 / 14428',
        officialUrl: 'https://www.skillindiadigital.gov.in',
        phone: '14428'
      };
    }
    if (activeJourney === 'pmmvy') {
      return {
        id: 'pmmvy',
        title: t.journeyPmmvyTitle || 'प्रधानमंत्री मातृ वंदना योजना',
        sub: t.journeyPmmvySub || 'गर्भवती माताओं को ₹5,000 की सीधी सहायता',
        questionTitle: t.journeyPmmvyQuestionTitle || 'क्या यह आपका पहला या दूसरा बच्चा (कन्या शिशु) है?',
        questionHint: t.journeyPmmvyQuestionHint || 'सरकार गर्भवती महिलाओं के स्वास्थ्य और पोषण के लिए सीधे बैंक खाते में ₹5,000 सहायता देती है।',
        no: t.journeyPmmvyNo || 'हाँ, पहला शिशु या दूसरी कन्या संतान है',
        noSub: t.journeyPmmvyNoSub || 'आप ₹5,000 की सरकारी पोषण सहायता पाने की पात्र हैं।',
        yes: t.journeyPmmvyYes || 'हाँ, मैं इस सहायता के बारे में जानना चाहती हूँ',
        yesSub: t.journeyPmmvyYesSub || 'आशा दीदी या आंगनवाड़ी कार्यकर्ता से तुरंत संपर्क करें।',
        goodTitle: t.journeyPmmvyGoodTitle || 'बधाई! आपको पोषण राशि मिलेगी',
        goodBody: t.journeyPmmvyGoodBody || 'पैसा किश्तों में सीधे आपके आधार से जुड़े बैंक खाते में आएगा।',
        okayTitle: t.journeyPmmvyOkayTitle || 'आंगनवाड़ी से संपर्क करें',
        okayBody: t.journeyPmmvyOkayBody || 'अपने गाँव या वार्ड की आंगनवाड़ी कार्यकर्ता तुरंत आपकी मदद करेंगी।',
        documentsTitle: t.journeyPmmvyDocumentsTitle || 'आंगनवाड़ी केंद्र ले जाने वाले कागज़ात',
        documentsBody: t.journeyPmmvyDocumentsBody || 'ये कागज़ात लेकर अपने गाँव की आंगनवाड़ी दीदी या एएनएम के पास जाएं:',
        docs: [
          t.journeyPmmvyDoc1 || 'गर्भवती महिला और पति का आधार कार्ड',
          t.journeyPmmvyDoc2 || 'ममता कार्ड (MCP कार्ड)',
          t.journeyPmmvyDoc3 || 'महिला का अपना बैंक पासबुक (आधार लिंक)',
          t.journeyPmmvyDoc4 || 'गर्भावस्था पंजीकरण पर्ची',
          t.journeyPmmvyDoc5 || 'मोबाइल नंबर'
        ],
        nextTitle: t.journeyPmmvyNextTitle || 'गाँव की आंगनवाड़ी केंद्र या आशा दीदी से मिलें',
        nextBody: t.journeyPmmvyNextBody || 'आंगनवाड़ी कार्यकर्ता के पास जाकर यह कहें:',
        sayThis: t.journeyPmmvySayThis || 'दीदी, मुझे मातृ वंदना योजना (PMMVY) का फॉर्म भरना है। मेरा ममता कार्ड और आधार कार्ड यह है।',
        bring: t.journeyPmmvyBring || 'ममता कार्ड और आधार कार्ड साथ लेकर जाएं',
        askHelp: t.journeyPmmvyAskHelp || 'आशा दीदी बिना किसी शुल्क के फॉर्म ऑनलाइन भर देंगी',
        doneTitle: t.journeyPmmvyDoneTitle || 'सहायता राशि सीधे आपके बैंक में आएगी',
        doneBody: t.journeyPmmvyDoneBody || 'टीकाकरण और जांच पूरी होते ही ₹5,000 की राशि सीधे आपके बैंक खाते में जमा हो जाएगी।',
        helplineLabel: t.journeyPmmvyHelplineLabel || 'मातृ वंदना / महिला हेल्पलाइन',
        helplineNumber: t.journeyPmmvyHelplineNumber || '181 / 14428',
        officialUrl: 'https://pmmvy.wcd.gov.in',
        phone: '181'
      };
    }
    return {
      id: 'pmuy-new-connection',
      title: t.journeyPmuyTitle || t.scheme,
      sub: t.journeyPmuySub || t.schemeSub,
      questionTitle: t.journeyPmuyQuestionTitle || t.questionTitle,
      questionHint: t.journeyPmuyQuestionHint || t.questionHint,
      no: t.journeyPmuyNo || t.no,
      noSub: t.journeyPmuyNoSub || t.noSub,
      yes: t.journeyPmuyYes || t.yes,
      yesSub: t.journeyPmuyYesSub || t.yesSub,
      goodTitle: t.journeyPmuyGoodTitle || t.goodTitle,
      goodBody: t.journeyPmuyGoodBody || t.goodBody,
      okayTitle: t.journeyPmuyOkayTitle || t.okayTitle,
      okayBody: t.journeyPmuyOkayBody || t.okayBody,
      documentsTitle: t.journeyPmuyDocumentsTitle || t.documentsTitle,
      documentsBody: t.journeyPmuyDocumentsBody || t.documentsBody,
      docs: [
        t.journeyPmuyDoc1 || t.doc1,
        t.journeyPmuyDoc2 || t.doc2,
        t.journeyPmuyDoc3 || t.doc3,
        t.journeyPmuyDoc4 || t.doc4,
        t.journeyPmuyDoc5 || t.doc5
      ],
      nextTitle: t.journeyPmuyNextTitle || t.nextTitle,
      nextBody: t.journeyPmuyNextBody || t.nextBody,
      sayThis: t.journeyPmuySayThis || t.sayThis,
      bring: t.journeyPmuyBring || t.bring,
      askHelp: t.journeyPmuyAskHelp || t.askHelp,
      doneTitle: t.journeyPmuyDoneTitle || t.doneTitle,
      doneBody: t.journeyPmuyDoneBody || t.doneBody,
      helplineLabel: t.journeyPmuyHelplineLabel || t.helplineLabel,
      helplineNumber: t.journeyPmuyHelplineNumber || t.helplineNumber,
      officialUrl: PMUY_URL,
      phone: '14428'
    };
  }, [activeJourney, t]);

  const questionToRead = useMemo(() => {
    if (screen === 'eligibility') return `${currentJourneyData.questionTitle}. ${currentJourneyData.questionHint}`;
    if (screen === 'documents') return `${currentJourneyData.documentsTitle}. ${currentJourneyData.documentsBody}. ${currentJourneyData.docs.join('. ')}`;
    if (screen === 'visit') return `${currentJourneyData.nextTitle}. ${currentJourneyData.nextBody} ${currentJourneyData.sayThis}`;
    if (screen === 'done') return `${currentJourneyData.doneTitle}. ${currentJourneyData.doneBody}`;
    return `${t.heroTitle}. ${t.heroBody}`;
  }, [screen, currentJourneyData, t]);

  function speakSafe(textToSpeak, targetLang = lang, forceNew = true) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeakingNow && !forceNew) {
      stopSpeaking();
      setIsSpeakingNow(false);
      return;
    }
    stopSpeaking();
    setIsSpeakingNow(true);
    speakText(textToSpeak, targetLang, {
      onStart: () => setIsSpeakingNow(true),
      onEnd: () => setIsSpeakingNow(false),
    });
  }

  function stopSpeakingNow() {
    stopSpeaking();
    setIsSpeakingNow(false);
  }


  function applyHealth(result) {
    const liveReady = Boolean(result.ok && result.gemini === 'configured');
    setGuidanceMode(liveReady ? 'live' : 'local');
  }

  // Trigger language toast with auto-fade
  function showLanguageToast(code, label) {
    setDetectedToast(`भाषा पहचानी गई: ${label} (Auto-switched)`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setDetectedToast(''), 4500);
  }

  // Real-time language auto-detection for typed or spoken input
  function checkAndAutoDetectLanguage(rawText) {
    if (!rawText || rawText.trim().length < 3) return;
    const detected = detectLanguage(rawText);
    if (detected.confidence >= 0.5 && detected.code !== lang) {
      const newMeta = getLanguageMeta(detected.code);
      setLang(detected.code);
      setVoiceDetectedLang(newMeta.label);
      showLanguageToast(detected.code, newMeta.label);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = newMeta.speechLocale || 'hi-IN';
        } catch {}
      }
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    try {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    } catch {}
    return undefined;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setGuidanceMode('checking');
      getHealth().then(applyHealth).catch(() => setGuidanceMode('local'));
      if (sessionSeedRef.current) openSession(sessionSeedRef.current, lang).then(() => setSessionId(sessionSeedRef.current)).catch(() => undefined);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setGuidanceMode('local');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang.replace('-Latn', '');
    document.documentElement.dir = languageMeta.dir || 'ltr';
  }, [lang, languageMeta.dir]);

  useEffect(() => {
    let active = true;
    let id = '';
    try {
      id = (typeof window !== 'undefined' && window.sessionStorage) ? window.sessionStorage.getItem('saheli-session-id') : '';
    } catch {}
    if (!id) {
      try {
        id = typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('saheli-session-id', id);
        }
      } catch {
        id = 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      }
    }
    sessionSeedRef.current = id;
    getHealth().then((result) => { if (active) applyHealth(result); }).catch(() => { if (active) setGuidanceMode('local'); });
    openSession(id, lang).then(() => { if (active) setSessionId(id); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!sessionId) return undefined;
    saveProgress(sessionId, { language: lang, currentScreen: screen, selectedAnswer }).catch(() => undefined);
    return undefined;
  }, [lang, screen, selectedAnswer, sessionId]);

  // Handle resilient voice transcription and routing
  function handleTranscriptReceived(transcript) {
    if (!transcript || !transcript.trim()) return;
    setMessage(transcript);
    setInputText(transcript);
    checkAndAutoDetectLanguage(transcript);
    routeQuery(transcript);
  }

  // Cross-Browser Multi-Mode Mic Controller
  async function toggleVoice() {
    setVoiceErrorMsg('');

    // If currently listening/recording, stop immediately
    if (voiceStatus === 'listening') {
      const pending = interimText;
      try { recognitionRef.current?.stop(); } catch {}
      setVoiceStatus('idle');
      setInterimText('');
      setIsMicSpeaking(false);
      if (pending && !message) {
        handleTranscriptReceived(pending);
      }
      return;
    }
    if (voiceStatus === 'recording') {
      setVoiceStatus('processing');
      try {
        const audioData = await voiceRecorderRef.current?.stop();
        if (audioData?.blob && isOnline && guidanceMode === 'live') {
          const result = await transcribeVoiceWithApi(audioData.blob, audioData.mimeType);
          if (result.ok && result.transcript) {
            if (result.detectedLanguage && result.detectedLanguage !== lang) {
              setLang(result.detectedLanguage);
              showLanguageToast(result.detectedLanguage, getLanguageMeta(result.detectedLanguage).label);
            }
            handleTranscriptReceived(result.transcript);
          } else {
            setVoiceStatus('idle');
            setVoiceErrorMsg(lang === 'hi' ? 'आवाज़ साफ नहीं आई, कृपया माइक दबाकर फिर बोलें।' : 'Could not hear clearly, please tap mic and speak again.');
          }
        } else {
          setVoiceStatus('idle');
        }
      } catch {
        setVoiceStatus('idle');
        setVoiceErrorMsg(lang === 'hi' ? 'कृपया माइक दबाकर दोबारा बोलें।' : 'Please tap mic and try speaking again.');
      }
      return;
    }

    // Check device capabilities
    const capabilities = checkVoiceCapabilities();

    // Mode 1: SpeechRecognition (Chrome, Edge, desktop & modern mobile)
    if (capabilities.hasSpeechRecognition) {
      try {
        const recognizer = createSpeechRecognizer({
          lang,
          onStart: () => {
            setVoiceStatus('listening');
            setInterimText('');
            setIsMicSpeaking(false);
          },
          onSpeechStart: () => {
            setIsMicSpeaking(true);
          },
          onSpeechEnd: () => {
            setIsMicSpeaking(false);
          },
          onInterimResult: (liveText) => {
            setInterimText(liveText);
            setInputText(liveText);
            setIsMicSpeaking(true);
            checkAndAutoDetectLanguage(liveText);
          },
          onResult: (transcript) => {
            setVoiceStatus('idle');
            setInterimText('');
            setIsMicSpeaking(false);
            handleTranscriptReceived(transcript);
          },
          onError: async (errorType) => {
            setInterimText('');
            setIsMicSpeaking(false);
            if (errorType === 'not-allowed') {
              setVoiceStatus('permission_denied');
              setVoiceErrorMsg('ब्राउज़र में माइक अनुमति (Mic Permission) बंद है। कृपया अनुमति दें।');
              setShowVoiceHelpModal(true);
            } else if (errorType === 'network') {
              // Web Speech API requires internet to Google servers. Fallback to MediaRecorder or prompt
              if (isOnline && capabilities.hasMediaRecorder) {
                startMediaRecorderMode();
              } else {
                setVoiceStatus('idle');
                setVoiceErrorMsg(lang === 'hi' ? 'इंटरनेट कनेक्शन धीमा है। कृपया दोबारा बोलें।' : 'Network connection slow. Please try speaking again.');
              }
            } else if (errorType === 'no-speech') {
              setVoiceStatus('idle');
            } else {
              setVoiceStatus('error');
              setVoiceErrorMsg(lang === 'hi' ? 'माइक से आवाज़ नहीं मिली। कृपया दोबारा बोलें।' : 'Could not detect voice. Please tap mic and speak again.');
            }
          },
          onEnd: (accumulated) => {
            setVoiceStatus((prev) => (prev === 'listening' ? 'idle' : prev));
            setInterimText('');
            setIsMicSpeaking(false);
            if (accumulated && !message) {
              handleTranscriptReceived(accumulated);
            }
          },
        });

        recognitionRef.current = recognizer;
        recognizer.start();
        return;
      } catch {
        // Fallback to MediaRecorder
      }
    }

    // Mode 2: MediaRecorder + Gemini Multimodal Voice AI
    if (capabilities.hasMediaRecorder) {
      startMediaRecorderMode();
      return;
    }

    // Mode 3: Hardware or browser without audio API
    setVoiceStatus('error');
    setVoiceErrorMsg(lang === 'hi' ? 'ब्राउज़र में माइक सक्षम नहीं है। कृपया अनुमति दें या लिखकर पूछें।' : 'Microphone not enabled in browser. Please allow or type.');
  }

  async function startMediaRecorderMode() {
    try {
      const recorder = new VoiceRecorder();
      voiceRecorderRef.current = recorder;
      await recorder.start();
      setVoiceStatus('recording');
    } catch (err) {
      if (err.message === 'PERMISSION_DENIED') {
        setVoiceStatus('permission_denied');
        setVoiceErrorMsg(lang === 'hi' ? 'माइक अनुमति बंद है। कृपया अनुमति दें।' : 'Microphone permission needed. Please allow.');
        setShowVoiceHelpModal(true);
      } else {
        setVoiceStatus('error');
        setVoiceErrorMsg(lang === 'hi' ? 'माइक शुरू नहीं हो सका। कृपया दोबारा प्रयास करें।' : 'Could not start microphone. Please try again.');
      }
    }
  }

  function handleSelectScheme(schemeId) {
    if (schemeId === 'safety') {
      setShowSafety(true);
      const safetySpeech = LANGUAGE_SCHEME_INTRO_SPEECH.safety[lang] || t.safetyTitle || 'महिला सुरक्षा हेल्पलाइन 181';
      speakSafe(safetySpeech, lang);
      return;
    }
    setActiveJourney(schemeId);
    setSelectedAnswer(null);
    setAssistantHint('');
    setScreen('eligibility');
    const spokenIntro = LANGUAGE_SCHEME_INTRO_SPEECH[schemeId]?.[lang]
      || `${schemeId === 'skill-india' ? (t.journeySkillTitle || 'प्रधानमंत्री कौशल विकास योजना') : schemeId === 'pmmvy' ? (t.journeyPmmvyTitle || 'प्रधानमंत्री मातृ वंदना योजना') : (t.journeyPmuyTitle || 'प्रधानमंत्री उज्ज्वला योजना')}. ${t.guidanceReady || 'हम आपकी सहायता के लिए तैयार हैं'}`;
    speakSafe(spokenIntro, lang);
  }

  function routeQuery(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) return;
    const normalized = rawQuery.trim().toLocaleLowerCase();

    // 1. Voice Answer while on eligibility question screen
    if (screen === 'eligibility') {
      const isAffirmative = ['हाँ', 'हा', 'haan', 'ha', 'yes', 'aama', 'avunu', 'hoy', 'ho', 'hã', 'হাঁ', 'হ্যাঁ', 'అవును', 'ஆம்', 'ಹೌದು', 'હા', 'ਹਾਂ', 'ହଁ'].some((w) => normalized.includes(w));
      const isNegative = ['नहीं', 'ना', 'nahi', 'na', 'no', 'illa', 'ledu', 'naahi', 'nako', 'இல்லை', 'లేదు', 'না', 'नाही', 'ಇಲ್ಲ', 'ના', 'ਨਹੀਂ', 'ନାହିଁ'].some((w) => normalized.includes(w));
      if (isNegative) {
        answer('no');
        return;
      }
      if (isAffirmative) {
        answer('yes');
        return;
      }
    }

    // 2. Navigation commands
    if (['आगे', 'अगला', 'next', 'continue', 'முன்னே', 'ಮುಂದೆ', 'पुढे', 'পরের'].some((w) => normalized.includes(w))) {
      goNext();
      return;
    }
    if (['वापस', 'पीछे', 'back', 'previous', 'பின்னே', 'ಹಿಂದೆ', 'मागे', 'ফিরে'].some((w) => normalized.includes(w))) {
      goBack();
      return;
    }
    if (['रुको', 'चुप', 'बंद', 'stop', 'quiet'].some((w) => normalized.includes(w))) {
      stopSpeakingNow();
      return;
    }

    // 3. Scheme triggers in all 15 Indian languages
    if (GAS_KEYWORDS.some((k) => normalized.includes(k))) {
      handleSelectScheme('pmuy-new-connection');
      return;
    }
    if (SKILL_KEYWORDS.some((k) => normalized.includes(k))) {
      handleSelectScheme('skill-india');
      return;
    }
    if (MATERNITY_KEYWORDS.some((k) => normalized.includes(k))) {
      handleSelectScheme('pmmvy');
      return;
    }
    if (SAFETY_KEYWORDS.some((k) => normalized.includes(k))) {
      handleSelectScheme('safety');
      return;
    }
    if (RATION_KEYWORDS.some((k) => normalized.includes(k))) {
      setResourceSearch(rawQuery.trim());
      setResourceSelection('ration-card');
      speakSafe(lang === 'hi' ? 'खाद्य सुरक्षा और राशन कार्ड की जानकारी यहां है।' : 'Ration card and food security guidance.', lang);
      setScreen('resources');
      return;
    }
    if (BANK_KEYWORDS.some((k) => normalized.includes(k))) {
      setResourceSearch(rawQuery.trim());
      setResourceSelection('jan-dhan');
      speakSafe(lang === 'hi' ? 'जन धन बैंक खाता और सरकारी सहायता की जानकारी यहां है।' : 'Jan Dhan bank account guidance.', lang);
      setScreen('resources');
      return;
    }

    // 4. Catalog search fallback
    const matchingResource = RESOURCE_CATALOG.find((resource) => resource.keywords.some((keyword) => normalized.includes(keyword.toLocaleLowerCase())));
    if (matchingResource?.id === 'pmuy-new-connection') {
      handleSelectScheme('pmuy-new-connection');
      return;
    }
    setResourceSearch(rawQuery.trim());
    setResourceSelection(matchingResource?.id || 'myscheme');
    speakSafe(t.services, lang);
    setScreen('resources');
  }

  function handleTextInputChange(event) {
    const val = event.target.value;
    setInputText(val);
    checkAndAutoDetectLanguage(val);
  }

  function submitRequest(event) {
    event?.preventDefault();
    if (!inputText.trim()) return;
    const request = inputText.trim();
    setMessage(request);
    setInputText('');
    checkAndAutoDetectLanguage(request);
    routeQuery(request);
  }

  async function answer(value) {
    setSelectedAnswer(value);
    setAssistantHint('');
    setServiceError(false);
    setIsResponding(true);
    if (!isOnline || guidanceMode !== 'live') {
      const guidance = getOfflineGuidance({ answer: value, language: lang, schemeId: activeJourney });
      setAssistantHint(`${guidance.answer} ${guidance.nextStep}`);
      speakSafe(`${guidance.speakText} ${lang === 'hi' ? 'चलिए, अब कागज़ात देखते हैं।' : 'Now let us see the required documents.'}`, lang);
      setIsResponding(false);
      return;
    }
    try {
      const guidance = await getGeminiGuidance({ answer: value, language: lang, userMessage: message });
      setAssistantHint(`${guidance.answer} ${guidance.nextStep}`);
      speakSafe(`${guidance.speakText} ${lang === 'hi' ? 'चलिए, अब कागज़ात देखते हैं।' : 'Now let us see the required documents.'}`, lang);
    } catch {
      const guidance = getOfflineGuidance({ answer: value, language: lang, schemeId: activeJourney });
      setAssistantHint(`${guidance.answer} ${guidance.nextStep}`);
      setGuidanceMode('local');
      setServiceError(false);
      speakSafe(`${guidance.speakText} ${lang === 'hi' ? 'चलिए, अब कागज़ात देखते हैं।' : 'Now let us see the required documents.'}`, lang);
    } finally {
      setIsResponding(false);
    }
  }

  function goNext() {
    if (screen === 'home') return setScreen('eligibility');
    if (screen === 'eligibility') return setScreen('documents');
    if (screen === 'documents') return setScreen('visit');
    if (screen === 'visit') return setScreen('done');
    setScreen('home');
  }

  function goBack() {
    if (screen === 'eligibility') return setScreen('home');
    if (screen === 'documents') return setScreen('eligibility');
    if (screen === 'visit') return setScreen('documents');
    if (screen === 'resources') return setScreen('home');
    setScreen('home');
  }

  function changeLanguage(nextLang) {
    setLang(nextLang);
    setShowLanguage(false);
    const greeting = LANGUAGE_SPOKEN_GREETINGS[nextLang] || copy[nextLang]?.heroTitle || 'नमस्ते';
    speakSafe(greeting, nextLang);
  }



  function handleOfficialClick(event) {
    if (isOnline) return;
    event.preventDefault();
    setShowInternetPrompt(true);
    speakSafe(t.internetTitle || 'इंटरनेट कनेक्शन चाहिए', lang);
  }

  function retryInternet() {
    if (!navigator.onLine) {
      setIsOnline(false);
      setGuidanceMode('local');
      speakSafe(t.offlineStatus || 'अभी भी इंटरनेट बंद है', lang);
      return;
    }
    setIsOnline(true);
    setShowInternetPrompt(false);
    setGuidanceMode('checking');
    getHealth().then(applyHealth).catch(() => setGuidanceMode('local'));
    speakSafe(t.onlineStatus || 'इंटरनेट चालू हो गया है', lang);
  }

  function restart() {
    setScreen('home');
    setSelectedAnswer(null);
    setAssistantHint('');
    setServiceError(false);
    setMessage('');
    setInputText('');
  }

  function openResourceHub() {
    setResourceSearch('');
    setResourceSelection('pmuy-new-connection');
    setScreen('resources');
  }

  return (
    <div className="app-shell" dir={languageMeta.dir || 'ltr'}>
      {detectedToast && (
        <div className="language-toast" role="status" aria-live="polite">
          <Sparkles size={16} />
          <span>{detectedToast}</span>
          <button type="button" onClick={() => setDetectedToast('')} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <header className="app-header">
        <button className="wordmark" onClick={restart} aria-label={t.brand}>
          <span className="wordmark-mark" aria-hidden="true"><i /></span>
          <span className="wordmark-copy"><strong>{t.brand}</strong><small>{t.brandSub}</small></span>
        </button>

        <div className="header-tools">
          <button
            type="button"
            className={`connection-pill ${isOnline ? 'online' : 'offline'}`}
            onClick={() => (!isOnline ? setShowInternetPrompt(true) : speakSafe(t.onlineStatus || 'इंटरनेट चालू है', lang))}
            title={isOnline ? t.onlineStatus : t.offlineStatus}
            aria-label={isOnline ? t.onlineStatus : t.offlineStatus}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? (t.onlineStatus || 'ऑनलाइन') : (t.offlineStatus || 'ऑफ़लाइन')}</span>
          </button>

          <span className={`ai-mode-pill ${guidanceMode === 'live' ? 'live' : 'local'}`}>
            <Sparkles size={12} />
            <span>{guidanceMode === 'live' ? 'Online Gemini AI' : 'Offline Device AI'}</span>
          </span>

          <button className="services-button" onClick={openResourceHub}><BookOpen size={17} /> <span>{t.services}</span></button>
          <button className="help-button" onClick={() => setShowSafety(true)}><CircleHelp size={18} /> <span>{t.help}</span></button>

          <div className="language-wrap">
            <button className="language-button" onClick={() => setShowLanguage((value) => !value)} aria-expanded={showLanguage} aria-label={`${t.label} language`}>
              <Globe2 size={16} /><span>{t.label}</span><ChevronDown size={14} />
            </button>
            {showLanguage && (
              <div className="language-menu" role="menu">
                <p>{t.regionalGroup}</p>
                {REGIONAL_LANGUAGE_CODES.map((code) => (
                  <button key={code} className={lang === code ? 'selected' : ''} onClick={() => changeLanguage(code)} role="menuitem">
                    <span>{LANGUAGE_META[code].label}</span>
                    <span>{LANGUAGE_META[code].code}</span>
                  </button>
                ))}
                <p>{t.codeMixedGroup}</p>
                {CODE_MIXED_LANGUAGE_CODES.map((code) => (
                  <button key={code} className={lang === code ? 'selected' : ''} onClick={() => changeLanguage(code)} role="menuitem">
                    <span>{LANGUAGE_META[code].label}</span>
                    <span>{LANGUAGE_META[code].code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="page-shell">
          <div className="page-rule" />
          {!isOnline && (
            <div className="offline-banner" role="status">
              <WifiOff size={17} />
              <span><strong>{t.offlineTitle}</strong><small>{t.offlineBody}</small></span>
              <button type="button" onClick={() => setShowInternetPrompt(true)}>{t.offlineAction}</button>
            </div>
          )}

          {screen !== 'home' && screen !== 'done' && screen !== 'resources' && (
            <nav className="journey-nav" aria-label="Journey progress">
              <button className="back-button" onClick={goBack}><ArrowLeft size={17} /> {t.back}</button>
              <div className="progress-area">
                <div className="progress-label">
                  <span>{t.step} {currentStep + 1} {t.of} {steps.length}</span>
                  <span>{t.stepNames[currentStep]}</span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label={`${t.step} ${currentStep + 1} ${t.of} ${steps.length}`}>
                  <div className="progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
              </div>
            </nav>
          )}

          {screen === 'home' && (
            <section className="home-view page-enter">
              {isSpeakingNow && (
                <div className="voice-speaking-bar" role="status">
                  <div className="speaking-wave-bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="speaking-wave-text">
                    {lang === 'hi' ? 'सेवा दीदी बोल रही हैं…' : 'Seva Didi is speaking…'}
                  </span>
                  <button
                    type="button"
                    className="stop-speech-btn"
                    onClick={stopSpeakingNow}
                    aria-label="Stop speaking"
                  >
                    <VolumeX size={15} />
                    <span>{lang === 'hi' ? 'रोकें' : 'Stop'}</span>
                  </button>
                </div>
              )}

              <div className="home-dynamic-layout">
                <div className="home-primary-col">
                  <div className="home-headline-row">
                    <div>
                      <h1 className="home-headline">{t.greeting || 'नमस्ते।'}</h1>
                      <p className="home-question">{t.tellMe || 'बताइए, क्या चाहिए?'}</p>
                    </div>
                    <button
                      type="button"
                      className={`listen-screen-pill ${isSpeakingNow ? 'active' : ''}`}
                      onClick={() => {
                        if (isSpeakingNow) {
                          stopSpeakingNow();
                        } else {
                          speakSafe(LANGUAGE_SPOKEN_GREETINGS[lang] || `${t.greeting}. ${t.tellMe}`, lang);
                        }
                      }}
                      aria-label="Listen aloud"
                    >
                      {isSpeakingNow ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      <span>{isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनिए' : 'Listen')}</span>
                    </button>
                  </div>

                  {/* Voice Language Switcher Bar with Auto-Detection Indicator */}
                  <div className="voice-lang-bar">
                    <div className="voice-lang-bar-header">
                      <span>{lang === 'hi' ? 'बोलने की भाषा (Voice Language):' : 'Voice Language:'}</span>
                      <span className="voice-lang-auto-tag">
                        <Sparkles size={11} />
                        {lang === 'hi' ? 'स्वतः पहचान सक्रिय' : 'Auto-Detect Active'}
                      </span>
                    </div>
                    <div className="voice-lang-chips">
                      {REGIONAL_LANGUAGE_CODES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className={`voice-lang-chip ${lang === code ? 'active' : ''}`}
                          onClick={() => {
                            setLang(code);
                            if (recognitionRef.current) {
                              try { recognitionRef.current.lang = LANGUAGE_META[code].speechLocale || 'hi-IN'; } catch {}
                            }
                          }}
                        >
                          {LANGUAGE_META[code].label}
                        </button>
                      ))}
                      {CODE_MIXED_LANGUAGE_CODES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className={`voice-lang-chip ${lang === code ? 'active' : ''}`}
                          onClick={() => {
                            setLang(code);
                            if (recognitionRef.current) {
                              try { recognitionRef.current.lang = LANGUAGE_META[code].speechLocale || 'hi-IN'; } catch {}
                            }
                          }}
                        >
                          {LANGUAGE_META[code].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screen 1: The 96px Hand-Drawn Rangoli Dot Mic Hero */}
                  <div className="hand-drawn-mic-box">
                    <button
                      type="button"
                      className={`hand-drawn-mic-button ${voiceStatus === 'listening' || voiceStatus === 'recording' ? 'recording' : ''}`}
                      onClick={toggleVoice}
                      aria-label={voiceStatus === 'listening' ? t.listening : t.speakAsk}
                    >
                      {voiceStatus === 'listening' || voiceStatus === 'recording' ? (
                        <MicOff size={44} color="#FAF8F5" aria-hidden="true" />
                      ) : (
                        <Mic size={44} color="#FAF8F5" aria-hidden="true" />
                      )}
                    </button>

                    <div className="mic-status-primary">
                      {voiceStatus === 'listening'
                        ? (lang === 'hi' ? 'सुन रहे हैं…' : 'Listening…')
                        : voiceStatus === 'recording'
                        ? (lang === 'hi' ? 'रिकॉर्ड हो रहा है (रोकने के लिए दबाएं)' : 'Recording (tap to finish)')
                        : voiceStatus === 'processing'
                        ? (lang === 'hi' ? 'समझ रहे हैं…' : 'Analyzing voice…')
                        : (lang === 'hi' ? 'बोलने के लिए दबाइए' : 'Tap to speak in your language')}
                    </div>
                    <div className="mic-status-secondary">
                      {voiceStatus === 'idle'
                        ? (lang === 'hi' ? 'दबाएं और अपनी भाषा में बोलें' : 'Speak naturally in your mother tongue')
                        : (lang === 'hi' ? 'बोलने के बाद दोबारा दबाएं या 2 सेकंड रुकें' : 'Tap again when finished or pause 2 seconds')}
                    </div>

                    {/* Real-Time Live Streaming Voice-to-Text Card */}
                    {(voiceStatus === 'listening' || voiceStatus === 'recording') && (
                      <div className="realtime-voice-card" role="status" aria-live="polite">
                        <div className="realtime-live-header">
                          <div className="realtime-rec-badge">
                            <span className="live-beacon" />
                            <span>{lang === 'hi' ? 'लाइव आवाज़ पहचान' : 'Live Voice Detection'}</span>
                          </div>
                          <span className="realtime-lang-badge">
                            <Globe2 size={13} />
                            <span>{LANGUAGE_META[lang]?.label || 'हिंदी'}</span>
                          </span>
                        </div>

                        <div className={`realtime-soundwave ${isMicSpeaking ? 'speaking' : ''}`} aria-hidden="true">
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                        </div>

                        <div className="realtime-speech-stream">
                          {interimText ? (
                            <span>
                              <strong>{interimText}</strong>
                              <span className="speech-live-cursor">|</span>
                            </span>
                          ) : (
                            <span className="realtime-speech-placeholder">
                              {lang === 'hi'
                                ? 'बोलिए, आपकी आवाज़ यहाँ तुरंत शब्द-दर-शब्द लिखी जाएगी…'
                                : 'Speak now, your words will stream here live in real-time…'}
                            </span>
                          )}
                        </div>

                        <div className="realtime-actions-row">
                          <button
                            type="button"
                            className="btn-done-speaking"
                            onClick={() => {
                              const spoken = interimText || inputText;
                              try { recognitionRef.current?.stop(); } catch {}
                              try { voiceRecorderRef.current?.stop(); } catch {}
                              setVoiceStatus('idle');
                              setInterimText('');
                              setIsMicSpeaking(false);
                              if (spoken) {
                                handleTranscriptReceived(spoken);
                              }
                            }}
                          >
                            <Check size={16} />
                            <span>{lang === 'hi' ? 'बोलना पूरा हुआ (सबमिट)' : 'Done Speaking (Submit)'}</span>
                          </button>

                          <button
                            type="button"
                            className="btn-cancel-speaking"
                            onClick={() => {
                              try { recognitionRef.current?.abort(); } catch {}
                              try { voiceRecorderRef.current?.cancel(); } catch {}
                              setVoiceStatus('idle');
                              setInterimText('');
                              setIsMicSpeaking(false);
                            }}
                          >
                            <X size={14} />
                            <span>{lang === 'hi' ? 'रद्द' : 'Cancel'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick 1-touch spoken option chips for women */}
                    <div className="quick-voice-chips-container">
                      <span className="quick-voice-chips-label">
                        {lang === 'hi' ? 'सीधे बोलकर या दबाकर पूछें:' : 'Or tap to speak in 1 touch:'}
                      </span>
                      <div className="quick-voice-chips-row">
                        <button
                          type="button"
                          className="quick-voice-chip"
                          onClick={() => handleSelectScheme('pmuy-new-connection')}
                        >
                          <HandFlameSvg size={16} color="var(--accent)" />
                          <span>{lang === 'hi' ? 'गैस कनेक्शन' : 'LPG Gas'}</span>
                        </button>

                        <button
                          type="button"
                          className="quick-voice-chip"
                          onClick={() => handleSelectScheme('skill-india')}
                        >
                          <HandScissorsSvg size={16} color="var(--accent)" />
                          <span>{lang === 'hi' ? 'सिलाई हुनर' : 'Tailoring'}</span>
                        </button>

                        <button
                          type="button"
                          className="quick-voice-chip"
                          onClick={() => handleSelectScheme('pmmvy')}
                        >
                          <HandLeafSvg size={16} color="var(--accent)" />
                          <span>{lang === 'hi' ? 'मातृत्व ₹5000' : 'Maternity'}</span>
                        </button>

                        <button
                          type="button"
                          className="quick-voice-chip"
                          onClick={() => handleSelectScheme('safety')}
                        >
                          <HandAmuletSvg size={16} color="var(--accent)" />
                          <span>{lang === 'hi' ? 'सुरक्षा 181' : 'Safety 181'}</span>
                        </button>
                      </div>
                    </div>
                  </div>


                  {voiceErrorMsg && (
                    <div className="voice-error-banner" role="status">
                      <AlertCircle size={16} />
                      <span>{voiceErrorMsg}</span>
                      <button type="button" onClick={() => setVoiceErrorMsg('')} className="voice-error-action" aria-label={t.close}>
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {message && (
                    <div className="transcript-card" aria-live="polite">
                      <Check size={16} color="var(--accent)" />
                      <span>
                        <small>{t.heard || 'आपने कहा'}:</small>
                        <strong>{message}</strong>
                      </span>
                      <button type="button" onClick={() => { setMessage(''); setInputText(''); }} aria-label={t.clear}>
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Full-width clean text entry row */}
                  <div className="text-entry-box">
                    <span className="text-entry-label">{t.orWrite || 'या लिखकर पूछिए'}</span>
                    <form className="text-entry-form" onSubmit={submitRequest}>
                      <input
                        value={inputText}
                        onChange={handleTextInputChange}
                        aria-label={t.inputPlaceholder}
                        placeholder={lang === 'hi' ? 'जैसे: मुझे गैस कनेक्शन चाहिए या राशन कार्ड' : t.inputPlaceholder}
                      />
                      <button type="submit" disabled={!inputText.trim()} aria-label={t.send}>
                        <Send size={18} />
                      </button>
                    </form>
                  </div>

                  <div className="aux-triggers" style={{ justifyContent: 'center' }}>
                    <span className="privacy-badge">
                      <LockKeyhole size={12} /> {lang === 'hi' ? 'सुरक्षित व निजी' : 'Safe & Private'}
                    </span>
                  </div>
                </div>

                <div className="home-secondary-col">
                  {/* Screen 3: Services Section (Full width rows on #F0EDE8) */}
                  <div className="service-section">
                    <h2 className="service-section-title">{lang === 'hi' ? 'सीधी सेवा चुनिए' : 'Or choose a service'}</h2>
                    <div className="service-rows-list">
                      <button
                        type="button"
                        className={`service-row-button ${activeJourney === 'pmuy-new-connection' ? 'active' : ''}`}
                        onClick={() => handleSelectScheme('pmuy-new-connection')}
                      >
                        <div className="service-row-icon">
                          <HandFlameSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'प्रधानमंत्री उज्ज्वला योजना' : 'PM Ujjwala Yojana'}</strong>
                          <small>{lang === 'hi' ? 'मुफ्त गैस कनेक्शन और पहला सिलेंडर' : 'Free LPG connection & first cylinder'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>

                      <button
                        type="button"
                        className="service-row-button"
                        onClick={() => {
                          const q = lang === 'hi' ? 'मुफ्त राशन योजना' : 'free ration food security';
                          setInputText(q);
                          routeQuery(q);
                        }}
                      >
                        <div className="service-row-icon">
                          <HandWheatSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'राशन कार्ड व खाद्य सुरक्षा' : 'Ration Card & Food Security'}</strong>
                          <small>{lang === 'hi' ? 'मुफ्त अनाज व राशन कार्ड में नाम जोड़ना' : 'Free food grains & NFSA registration'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>

                      <button
                        type="button"
                        className={`service-row-button ${activeJourney === 'pmmvy' ? 'active' : ''}`}
                        onClick={() => handleSelectScheme('pmmvy')}
                      >
                        <div className="service-row-icon">
                          <HandLeafSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'प्रधानमंत्री मातृ वंदना योजना' : 'PM Matru Vandana Yojana'}</strong>
                          <small>{lang === 'hi' ? 'गर्भवती महिलाओं को ₹5,000 की नकद मदद' : '₹5,000 maternity cash assistance'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>

                      <button
                        type="button"
                        className="service-row-button"
                        onClick={() => handleSelectScheme('safety')}
                      >
                        <div className="service-row-icon">
                          <HandAmuletSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'महिला हेल्पलाइन 181' : 'Women Helpline 181'}</strong>
                          <small>{lang === 'hi' ? '24 घंटे मुफ्त सुरक्षा और कानूनी सलाह' : '24x7 emergency & legal counseling'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>

                      <button
                        type="button"
                        className="service-row-button"
                        onClick={() => {
                          const q = lang === 'hi' ? 'जन धन बैंक खाता' : 'jan dhan bank account';
                          setInputText(q);
                          routeQuery(q);
                        }}
                      >
                        <div className="service-row-icon">
                          <HandRupeeSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'जन धन बैंक खाता' : 'Jan Dhan Bank Account'}</strong>
                          <small>{lang === 'hi' ? 'बिना पैसे बैंक खाता व ₹10,000 ओवरड्राफ्ट' : 'Zero balance savings & direct transfer'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>

                      <button
                        type="button"
                        className={`service-row-button ${activeJourney === 'skill-india' ? 'active' : ''}`}
                        onClick={() => handleSelectScheme('skill-india')}
                      >
                        <div className="service-row-icon">
                          <HandScissorsSvg size={26} color="var(--accent)" />
                        </div>
                        <div className="service-row-copy">
                          <strong>{lang === 'hi' ? 'हुनर सीखें — सिलाई व कौशल' : 'Skill India — Tailoring & Craft'}</strong>
                          <small>{lang === 'hi' ? 'मुफ्त प्रशिक्षण और सिलाई मशीन सहायता' : 'Free vocational training & sewing grants'}</small>
                        </div>
                        <ArrowRight size={18} className="service-row-arrow" />
                      </button>
                    </div>
                  </div>

                  {/* 48px Gap Pause before Primary Action Button per Section 2 */}
                  <div className="pause-gap-48">
                    <button
                      type="button"
                      className="primary-action-btn"
                      onClick={() => handleSelectScheme(activeJourney)}
                    >
                      <span>{t.continue || 'आगे'}</span>
                      <ArrowRight size={22} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button type="button" className="quiet-action-link" onClick={openResourceHub}>
                      {lang === 'hi' ? 'सभी सरकारी मदद और निर्देशिका देखें' : 'Browse all government services'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {screen === 'resources' && (
            <ResourceHub
              lang={lang}
              t={t}
              search={resourceSearch}
              setSearch={setResourceSearch}
              selectedId={resourceSelection}
              setSelectedId={setResourceSelection}
              onBack={goBack}
              onOfficialClick={handleOfficialClick}
              onSpeak={speakSafe}
              isOnline={isOnline}
              guidanceMode={guidanceMode}
            />
          )}

          {screen === 'eligibility' && (
            <section className="journey-view page-enter">
              <div className="step-question-header">
                <div style={{ flex: 1 }}>
                  <h1 className="step-question-text">{currentJourneyData.questionTitle}</h1>
                  <p className="step-question-sub">{currentJourneyData.questionHint}</p>
                </div>
                <button
                  type="button"
                  className={`listen-screen-pill ${isSpeakingNow ? 'active' : ''}`}
                  onClick={() => {
                    if (isSpeakingNow) {
                      stopSpeakingNow();
                    } else {
                      speakSafe(`${currentJourneyData.questionTitle}. ${currentJourneyData.questionHint}`, lang);
                    }
                  }}
                  aria-label="Listen to question"
                >
                  {isSpeakingNow ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सवाल सुनें' : 'Listen')}</span>
                </button>
              </div>

              {/* Dedicated Spoken Voice Answer row for non-reading women */}
              <div className="voice-answer-row">
                <button
                  type="button"
                  className={`voice-answer-button ${voiceStatus === 'listening' ? 'listening' : ''}`}
                  onClick={toggleVoice}
                  aria-label="Answer with voice"
                >
                  <Mic size={22} />
                  <span>
                    {voiceStatus === 'listening'
                      ? (lang === 'hi' ? 'सुन रहे हैं… हाँ या नहीं बोलें' : 'Listening… say Yes or No')
                      : (lang === 'hi' ? 'माइक दबाकर बोलें: हाँ या नहीं' : 'Tap mic and say Yes or No')}
                  </span>
                </button>
              </div>

              {/* Screen 5: Stacked 72px buttons without icons per Section 3 */}
              <div className="decision-button-stack">
                <button
                  type="button"
                  className="decision-button-yes"
                  onClick={() => answer('yes')}
                >
                  {currentJourneyData.yes}
                </button>
                <button
                  type="button"
                  className="decision-button-no"
                  onClick={() => answer('no')}
                >
                  {currentJourneyData.no}
                </button>
              </div>

              {selectedAnswer && (
                <div className={`decision-note-box ${serviceError ? 'error' : ''}`} aria-live="polite">
                  <strong>{serviceError ? t.serviceUnavailable : (selectedAnswer === 'no' ? currentJourneyData.goodTitle : currentJourneyData.okayTitle)}</strong>
                  <small>{isResponding ? (lang === 'hi' ? 'थोड़ा रुकिए…' : 'One moment…') : serviceError ? t.serviceUnavailable : assistantHint || (selectedAnswer === 'no' ? currentJourneyData.goodBody : currentJourneyData.okayBody)}</small>
                </div>
              )}

              <div className="pause-gap-48" style={{ marginTop: '24px' }}>
                {selectedAnswer ? (
                  <button type="button" className="primary-action-btn" onClick={goNext}>
                    <span>{t.continue || 'आगे'}</span>
                    <ArrowRight size={22} />
                  </button>
                ) : (
                  <button type="button" className="quiet-action-link" onClick={() => speakSafe(questionToRead, lang)}>
                    {isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : t.hearQuestion}
                  </button>
                )}
              </div>
            </section>
          )}

          {screen === 'documents' && (
            <section className="journey-view page-enter">
              <div className="documents-dynamic-layout">
                <div className="documents-primary-col">
                  {/* Screen 4: 72px Hero Benefit Amount with Listen Pill */}
                  <div className="hero-benefit-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="hero-benefit-label">{lang === 'hi' ? 'सीधा सरकारी लाभ' : 'Direct Government Benefit'}</span>
                      <button
                        type="button"
                        className={`listen-screen-pill ${isSpeakingNow ? 'active' : ''}`}
                        onClick={() => {
                          if (isSpeakingNow) {
                            stopSpeakingNow();
                          } else {
                            speakSafe(`${currentJourneyData.documentsTitle}. ${currentJourneyData.documentsBody}. ${currentJourneyData.docs.join('. ')}`, lang);
                          }
                        }}
                        aria-label="Listen to documents list"
                      >
                        {isSpeakingNow ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        <span>{isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'कागज़ात सुनें' : 'Listen')}</span>
                      </button>
                    </div>

                    <div className="hero-benefit-amount">
                      {activeJourney === 'pmuy-new-connection' ? (lang === 'hi' ? 'मुफ्त गैस' : 'Free LPG') : activeJourney === 'pmmvy' ? '₹5,000' : '₹300'}
                    </div>
                    <p className="hero-benefit-note">{currentJourneyData.documentsBody}</p>
                  </div>
                </div>

                <div className="documents-secondary-col">
                  {/* Real scanned-paper ticket thumbnails tilted */}
                  <ul className="ticket-doc-list">
                    {currentJourneyData.docs.map((item) => (
                      <li key={item} className="ticket-doc-item">
                        <span className="ticket-doc-thumb" aria-hidden="true"><FileText size={15} /></span>
                        <strong>{item}</strong>
                        <Check size={18} />
                      </li>
                    ))}
                  </ul>

                  <div className="pause-gap-48" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button type="button" className="primary-action-btn" onClick={goNext}>
                      <span>{t.continue || 'आगे'}</span>
                      <ArrowRight size={22} />
                    </button>
                    <button type="button" className="quiet-action-link" onClick={() => speakSafe(questionToRead, lang)}>
                      {isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : (t.readAloud || 'बोलकर सुनें')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {screen === 'visit' && (
            <section className="journey-view page-enter">
              <div className="step-question-header">
                <div style={{ flex: 1 }}>
                  <h1 className="step-question-text">{currentJourneyData.nextTitle}</h1>
                  <p className="step-question-sub">{currentJourneyData.nextBody}</p>
                </div>
                <button
                  type="button"
                  className={`listen-screen-pill ${isSpeakingNow ? 'active' : ''}`}
                  onClick={() => {
                    if (isSpeakingNow) {
                      stopSpeakingNow();
                    } else {
                      speakSafe(`${currentJourneyData.nextTitle}. ${currentJourneyData.nextBody}. ${currentJourneyData.sayThis}`, lang);
                    }
                  }}
                  aria-label="Listen to visit instructions"
                >
                  {isSpeakingNow ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{isSpeakingNow ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनिए' : 'Listen')}</span>
                </button>
              </div>

              <div style={{ margin: '24px 0', padding: '16px', background: 'var(--warm)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--accent)', lineHeight: '1.5' }}>{currentJourneyData.sayThis}</p>
                <button type="button" className="quiet-action-link" onClick={() => speakSafe(currentJourneyData.sayThis, lang)} style={{ marginTop: '8px' }}>
                  <Volume2 size={16} /> <span>{t.readAloud}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0', color: 'var(--muted)', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} color="var(--accent)" /> <span>{currentJourneyData.bring}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HeartHandshake size={16} color="var(--accent)" /> <span>{currentJourneyData.askHelp}</span></div>
              </div>

              <div className="pause-gap-48" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  className="listen-button full"
                  href={`tel:${currentJourneyData.phone || '14428'}`}
                  style={{ justifyContent: 'center', fontWeight: 'bold' }}
                >
                  <Phone size={18} /> {lang === 'hi' ? 'सीधे फोन कॉल करें' : 'Call toll-free'}: {currentJourneyData.phone || '14428'}
                </a>
                <button type="button" className="primary-action-btn" onClick={goNext}>
                  <span>{t.finish || 'आगे'}</span>
                  <Check size={22} />
                </button>
              </div>
            </section>
          )}

          {screen === 'done' && (
            <section className="done-view page-enter">
              {/* Screen 6: 64px Hand Checkmark */}
              <div className="done-check-wrapper">
                <HandCheckSvg size={64} color="var(--accent)" />
              </div>
              <h1 className="done-title">{lang === 'hi' ? 'हो गया।' : currentJourneyData.doneTitle}</h1>
              <p className="done-description">{currentJourneyData.doneBody}</p>

              {/* 32px Stamped Monospace Helpline */}
              <div className="stamped-helpline">
                <small>{currentJourneyData.helplineLabel || (lang === 'hi' ? 'सीधा सरकारी हेल्पलाइन नंबर' : 'Official Helpline')}</small>
                <div style={{ marginTop: '4px' }}>
                  <a href={`tel:${currentJourneyData.phone || '14480'}`} className="stamped-helpline-number">
                    {currentJourneyData.helplineNumber || '14480'}
                  </a>
                </div>
              </div>

              <div className="pause-gap-48" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="button" className="primary-action-btn" onClick={restart}>
                  <span>{lang === 'hi' ? 'पक्का' : (t.confirm || 'Confirmed')}</span>
                  <ArrowRight size={22} />
                </button>
                <a
                  className="secondary-action-btn"
                  href={currentJourneyData.officialUrl}
                  onClick={handleOfficialClick}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <ArrowRight size={17} /> {t.official}
                </a>
              </div>
            </section>
          )}
        </main>

      <footer className="app-footer"><span>{t.practice}</span><span>{t.brand} · 2026</span></footer>



      {/* Microphone Permission Diagnostic Modal */}
      {showVoiceHelpModal && (
        <div className="modal-backdrop" onClick={() => setShowVoiceHelpModal(false)}>
          <div className="safety-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mic-modal-title">
            <button className="modal-close" onClick={() => setShowVoiceHelpModal(false)} aria-label={t.close}><X size={18} /></button>
            <AlertCircle size={28} color="#C0392B" />
            <h2 id="mic-modal-title">{lang === 'hi' ? 'माइक अनुमति (Mic Permission) चाहिए' : 'Microphone Permission Needed'}</h2>
            <p>
              {lang === 'hi'
                ? 'आपकी आवाज़ सुनने के लिए ब्राउज़र को माइक की अनुमति चाहिए। एड्रेस बार में 🔒 या माइक आइकन पर दबाकर "Allow" चुनें।'
                : 'To hear your voice, please allow microphone access by tapping the lock/camera icon in your address bar.'}
            </p>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="continue-button full"
                onClick={async () => {
                  setShowVoiceHelpModal(false);
                  try {
                    await requestMicrophoneAccess();
                    toggleVoice();
                  } catch {
                    setVoiceErrorMsg(lang === 'hi' ? 'माइक अनुमति अभी भी बंद है।' : 'Microphone permission still denied.');
                  }
                }}
              >
                {lang === 'hi' ? 'दोबारा अनुमति मांगें' : 'Retry Permission'}
              </button>
              <button
                type="button"
                className="listen-button full"
                onClick={() => setShowVoiceHelpModal(false)}
              >
                {t.close || 'बंद करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSafety && (
        <div className="modal-backdrop" onClick={() => setShowSafety(false)}>
          <div className="safety-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button className="modal-close" onClick={() => setShowSafety(false)} aria-label={t.close}><X size={18} /></button>
            <ShieldAlert size={28} color="#C0392B" />
            <h2>{t.safetyTitle}</h2>
            <p>{t.safetyBody}</p>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a className="listen-button full" href="tel:181" style={{ fontWeight: 'bold' }}>
                <Phone size={17} /> महिला हेल्पलाइन 181 पर कॉल करें
              </a>
              <button className="continue-button full" onClick={() => setShowSafety(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {showInternetPrompt && (
        <div className="modal-backdrop" onClick={() => setShowInternetPrompt(false)}>
          <div className="safety-modal internet-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="internet-dialog-title">
            <button className="modal-close" onClick={() => setShowInternetPrompt(false)} aria-label={t.close}><X size={18} /></button>
            <div className="internet-icon-wrap" style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(192, 57, 43, 0.12)', color: '#C0392B', marginBottom: '12px' }}>
              <WifiOff size={28} />
            </div>
            <h2 id="internet-dialog-title">{t.internetTitle || 'इंटरनेट कनेक्शन चाहिए'}</h2>
            <p>{t.internetBody || 'सरकारी पोर्टल खोलने के लिए इंटरनेट चाहिए। बाकी सभी ज़रूरी जानकारी, कागज़ात और क्या बोलना है, यह सब आप बिना इंटरनेट भी देख सकती हैं।'}</p>

            <div className="internet-tips-box" style={{ background: '#FAF8F5', border: '1.5px solid #E4DDD3', borderRadius: '12px', padding: '12px 14px', margin: '14px 0', textAlign: 'left' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: '#2C2C2C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} color="#C0392B" /> <strong>{t.internetTip1 || 'मोबाइल का डेटा (इंटरनेट) या वाई-फाई चालू करें'}</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#148F77" /> <span>{t.internetTip2 || 'इंटरनेट न हो तो बिना इंटरनेट सीधे टोल-फ्री नंबर पर कॉल करें'}</span>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
              <a
                className="listen-button full"
                href={`tel:${currentJourneyData.phone || '14428'}`}
                style={{ justifyContent: 'center', fontWeight: 'bold' }}
              >
                <Phone size={17} /> {t.callHelplineOffline || 'बिना इंटरनेट टोल-फ्री कॉल करें'}: {currentJourneyData.phone || '14428'}
              </a>
              <button className="continue-button full" onClick={retryInternet}>
                {t.internetAction || 'मैंने इंटरनेट चालू कर दिया (दोबारा जांचें)'}
              </button>
              <button className="listen-button full" onClick={() => setShowInternetPrompt(false)} style={{ border: 'none', color: '#666' }}>
                {t.close || 'बंद करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App error caught by RootErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#faf8f5', fontFamily: 'system-ui, sans-serif', textAlign: 'center', color: '#2c2c2c' }}>
          <h1 style={{ fontSize: '28px', color: '#c0392b', marginBottom: '12px' }}>सेवा दीदी (Seva Didi)</h1>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>नमस्ते, ऐप लोड करने में समस्या आई।</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>कृपया नीचे दिए गए बटन को दबाकर दोबारा शुरू करें।</p>
          <button
            type="button"
            onClick={() => { window.location.reload(); }}
            style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            दोबारा शुरू करें (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}
