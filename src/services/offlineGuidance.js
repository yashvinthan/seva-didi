const guidance = {
  hi: {
    no: { answer: 'अगर आपके घर में LPG कनेक्शन नहीं है, तो आप उज्ज्वला योजना की जानकारी ले सकती हैं।', speakText: 'अगर आपके घर में एल पी जी कनेक्शन नहीं है, तो आप उज्ज्वला योजना की जानकारी ले सकती हैं।', nextStep: 'कागज़ साथ रखकर नज़दीकी LPG वितरक से पूछें।', sourceNote: 'इंटरनेट मिलने पर आधिकारिक PMUY वेबसाइट भी देखें।' },
    yes: { answer: 'अगर घर में पहले से LPG कनेक्शन है, तो उज्ज्वला योजना के नियम अलग हो सकते हैं।', speakText: 'अगर घर में पहले से एल पी जी कनेक्शन है, तो उज्ज्वला योजना के नियम अलग हो सकते हैं।', nextStep: 'नज़दीकी LPG वितरक से अपनी स्थिति पूछें।', sourceNote: 'इंटरनेट मिलने पर आधिकारिक PMUY वेबसाइट भी देखें।' },
  },
  bn: {
    no: { answer: 'আপনার বাড়িতে LPG সংযোগ না থাকলে আপনি উজ্জ্বলা যোজনার তথ্য নিতে পারেন।', speakText: 'আপনার বাড়িতে এল পি জি সংযোগ না থাকলে আপনি উজ্জ্বলা যোজনার তথ্য নিতে পারেন।', nextStep: 'কাগজপত্র নিয়ে কাছের LPG ডিস্ট্রিবিউটরের কাছে জিজ্ঞেস করুন।', sourceNote: 'ইন্টারনেট এলে সরকারি PMUY ওয়েবসাইট দেখুন।' },
    yes: { answer: 'বাড়িতে আগে থেকেই LPG সংযোগ থাকলে উজ্জ্বলা যোজনার নিয়ম আলাদা হতে পারে।', speakText: 'বাড়িতে আগে থেকেই এল পি জি সংযোগ থাকলে উজ্জ্বলা যোজনার নিয়ম আলাদা হতে পারে।', nextStep: 'কাছের LPG ডিস্ট্রিবিউটরের কাছে নিজের পরিস্থিতি জিজ্ঞেস করুন।', sourceNote: 'ইন্টারনেট এলে সরকারি PMUY ওয়েবসাইট দেখুন।' },
  },
  ta: {
    no: { answer: 'உங்கள் வீட்டில் LPG இணைப்பு இல்லையெனில் உஜ்வலா திட்டத்தைப் பற்றி தெரிந்துகொள்ளலாம்.', speakText: 'உங்கள் வீட்டில் எல் பி ஜி இணைப்பு இல்லையெனில் உஜ்வலா திட்டத்தைப் பற்றி தெரிந்துகொள்ளலாம்.', nextStep: 'ஆவணங்களுடன் அருகிலுள்ள LPG விநியோகஸ்தரிடம் கேளுங்கள்.', sourceNote: 'இணையம் கிடைக்கும்போது அதிகாரப்பூர்வ PMUY இணையதளத்தைப் பாருங்கள்.' },
    yes: { answer: 'வீட்டில் ஏற்கனவே LPG இணைப்பு இருந்தால் உஜ்வலா திட்ட விதிகள் வேறுபடலாம்.', speakText: 'வீட்டில் ஏற்கனவே எல் பி ஜி இணைப்பு இருந்தால் உஜ்வலா திட்ட விதிகள் வேறுபடலாம்.', nextStep: 'அருகிலுள்ள LPG விநியோகஸ்தரிடம் உங்கள் நிலையை கேளுங்கள்.', sourceNote: 'இணையம் கிடைக்கும்போது அதிகாரப்பூர்வ PMUY இணையதளத்தைப் பாருங்கள்.' },
  },
  te: {
    no: { answer: 'మీ ఇంట్లో LPG కనెక్షన్ లేకపోతే ఉజ్జ్వల పథకం గురించి తెలుసుకోవచ్చు.', speakText: 'మీ ఇంట్లో ఎల్ పీ జీ కనెక్షన్ లేకపోతే ఉజ్జ్వల పథకం గురించి తెలుసుకోవచ్చు.', nextStep: 'పత్రాలు తీసుకుని దగ్గరలోని LPG పంపిణీదారుని అడగండి.', sourceNote: 'ఇంటర్నెట్ వచ్చినప్పుడు అధికారిక PMUY వెబ్‌సైట్ చూడండి.' },
    yes: { answer: 'ఇంట్లో ఇప్పటికే LPG కనెక్షన్ ఉంటే ఉజ్జ్వల పథకం నియమాలు వేరుగా ఉండవచ్చు.', speakText: 'ఇంట్లో ఇప్పటికే ఎల్ పీ జీ కనెక్షన్ ఉంటే ఉజ్జ్వల పథకం నియమాలు వేరుగా ఉండవచ్చు.', nextStep: 'దగ్గరలోని LPG పంపిణీదారుని మీ పరిస్థితి గురించి అడగండి.', sourceNote: 'ఇంటర్నెట్ వచ్చినప్పుడు అధికారిక PMUY వెబ్‌సైట్ చూడండి.' },
  },
  mr: {
    no: { answer: 'तुमच्या घरी LPG कनेक्शन नसेल तर तुम्ही उज्ज्वला योजनेची माहिती घेऊ शकता.', speakText: 'तुमच्या घरी एल पी जी कनेक्शन नसेल तर तुम्ही उज्ज्वला योजनेची माहिती घेऊ शकता.', nextStep: 'कागदपत्रे घेऊन जवळच्या LPG वितरकाला विचारा.', sourceNote: 'इंटरनेट मिळाल्यावर अधिकृत PMUY वेबसाइट पहा.' },
    yes: { answer: 'घरी आधीपासून LPG कनेक्शन असल्यास उज्ज्वला योजनेचे नियम वेगळे असू शकतात.', speakText: 'घरी आधीपासून एल पी जी कनेक्शन असल्यास उज्ज्वला योजनेचे नियम वेगळे असू शकतात.', nextStep: 'जवळच्या LPG वितरकाला तुमची परिस्थिती विचारा.', sourceNote: 'इंटरनेट मिळाल्यावर अधिकृत PMUY वेबसाइट पहा.' },
  },
  kn: {
    no: { answer: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ LPG ಸಂಪರ್ಕ ಇಲ್ಲದಿದ್ದರೆ ಉಜ್ವಲ ಯೋಜನೆಯ ಬಗ್ಗೆ ತಿಳಿದುಕೊಳ್ಳಬಹುದು.', speakText: 'ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಎಲ್ ಪಿ ಜಿ ಸಂಪರ್ಕ ಇಲ್ಲದಿದ್ದರೆ ಉಜ್ವಲ ಯೋಜನೆಯ ಬಗ್ಗೆ ತಿಳಿದುಕೊಳ್ಳಬಹುದು.', nextStep: 'ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹತ್ತಿರದ LPG ವಿತರಕರನ್ನು ಕೇಳಿ.', sourceNote: 'ಇಂಟರ್ನೆಟ್ ಬಂದಾಗ ಅಧಿಕೃತ PMUY ವೆಬ್‌ಸೈಟ್ ನೋಡಿ.' },
    yes: { answer: 'ಮನೆಯಲ್ಲಿ ಈಗಾಗಲೇ LPG ಸಂಪರ್ಕ ಇದ್ದರೆ ಉಜ್ವಲ ಯೋಜನೆಯ ನಿಯಮಗಳು ಬೇರೆ ಇರಬಹುದು.', speakText: 'ಮನೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಎಲ್ ಪಿ ಜಿ ಸಂಪರ್ಕ ಇದ್ದರೆ ಉಜ್ವಲ ಯೋಜನೆಯ ನಿಯಮಗಳು ಬೇರೆ ಇರಬಹುದು.', nextStep: 'ಹತ್ತಿರದ LPG ವಿತರಕರ ಬಳಿ ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ಕೇಳಿ.', sourceNote: 'ಇಂಟರ್ನೆಟ್ ಬಂದಾಗ ಅಧಿಕೃತ PMUY ವೆಬ್‌ಸೈಟ್ ನೋಡಿ.' },
  },
  gu: {
    no: { answer: 'તમારા ઘરમાં LPG કનેક્શન ન હોય તો તમે ઉજ્જ્વલા યોજના વિશે જાણી શકો છો.', speakText: 'તમારા ઘરમાં એલ પી જી કનેક્શન ન હોય તો તમે ઉજ્જ્વલા યોજના વિશે જાણી શકો છો.', nextStep: 'કાગળો લઈને નજીકના LPG વિતરકને પૂછો.', sourceNote: 'ઇન્ટરનેટ મળે ત્યારે અધિકૃત PMUY વેબસાઇટ જુઓ.' },
    yes: { answer: 'ઘરમાં પહેલેથી LPG કનેક્શન હોય તો ઉજ્જ્વલા યોજનાના નિયમો અલગ હોઈ શકે છે.', speakText: 'ઘરમાં પહેલેથી એલ પી જી કનેક્શન હોય તો ઉજ્જ્વલા યોજનાના નિયમો અલગ હોઈ શકે છે.', nextStep: 'નજીકના LPG વિતરકને તમારી સ્થિતિ વિશે પૂછો.', sourceNote: 'ઇન્ટરનેટ મળે ત્યારે અધિકૃત PMUY વેબસાઇટ જુઓ.' },
  },
  ml: {
    no: { answer: 'നിങ്ങളുടെ വീട്ടിൽ LPG കണക്ഷൻ ഇല്ലെങ്കിൽ ഉജ്ജ്വല പദ്ധതിയെക്കുറിച്ച് അറിയാം.', speakText: 'നിങ്ങളുടെ വീട്ടിൽ എൽ പി ജി കണക്ഷൻ ഇല്ലെങ്കിൽ ഉജ്ജ്വല പദ്ധതിയെക്കുറിച്ച് അറിയാം.', nextStep: 'രേഖകളുമായി അടുത്തുള്ള LPG വിതരണക്കാരനോട് ചോദിക്കൂ.', sourceNote: 'ഇന്റർനെറ്റ് ലഭിക്കുമ്പോൾ ഔദ്യോഗിക PMUY വെബ്സൈറ്റ് കാണൂ.' },
    yes: { answer: 'വീട്ടിൽ ഇതിനകം LPG കണക്ഷൻ ഉണ്ടെങ്കിൽ ഉജ്ജ്വല പദ്ധതിയുടെ നിയമങ്ങൾ വ്യത്യസ്തമായേക്കാം.', speakText: 'വീട്ടിൽ ഇതിനകം എൽ പി ജി കണക്ഷൻ ഉണ്ടെങ്കിൽ ഉജ്ജ്വല പദ്ധതിയുടെ നിയമങ്ങൾ വ്യത്യസ്തമായേക്കാം.', nextStep: 'അടുത്തുള്ള LPG വിതരണക്കാരനോട് നിങ്ങളുടെ സ്ഥിതി ചോദിക്കൂ.', sourceNote: 'ഇന്റർനെറ്റ് ലഭിക്കുമ്പോൾ ഔദ്യോഗിക PMUY വെബ്സൈറ്റ് കാണൂ.' },
  },
  pa: {
    no: { answer: 'ਜੇ ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ LPG ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਹੈ ਤਾਂ ਤੁਸੀਂ ਉੱਜਵਲਾ ਯੋਜਨਾ ਬਾਰੇ ਜਾਣ ਸਕਦੇ ਹੋ।', speakText: 'ਜੇ ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਐਲ ਪੀ ਜੀ ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਹੈ ਤਾਂ ਤੁਸੀਂ ਉੱਜਵਲਾ ਯੋਜਨਾ ਬਾਰੇ ਜਾਣ ਸਕਦੇ ਹੋ।', nextStep: 'ਕਾਗਜ਼ ਨਾਲ ਲੈ ਕੇ ਨੇੜਲੇ LPG ਡਿਸਟ੍ਰੀਬਿਊਟਰ ਨੂੰ ਪੁੱਛੋ।', sourceNote: 'ਇੰਟਰਨੈੱਟ ਮਿਲਣ ਤੇ ਅਧਿਕਾਰਤ PMUY ਵੈੱਬਸਾਈਟ ਦੇਖੋ।' },
    yes: { answer: 'ਜੇ ਘਰ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ LPG ਕਨੈਕਸ਼ਨ ਹੈ ਤਾਂ ਉੱਜਵਲਾ ਯੋਜਨਾ ਦੇ ਨਿਯਮ ਵੱਖ ਹੋ ਸਕਦੇ ਹਨ।', speakText: 'ਜੇ ਘਰ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਐਲ ਪੀ ਜੀ ਕਨੈਕਸ਼ਨ ਹੈ ਤਾਂ ਉੱਜਵਲਾ ਯੋਜਨਾ ਦੇ ਨਿਯਮ ਵੱਖ ਹੋ ਸਕਦੇ ਹਨ।', nextStep: 'ਨੇੜਲੇ LPG ਡਿਸਟ੍ਰੀਬਿਊਟਰ ਤੋਂ ਆਪਣੀ ਸਥਿਤੀ ਪੁੱਛੋ।', sourceNote: 'ਇੰਟਰਨੈੱਟ ਮਿਲਣ ਤੇ ਅਧਿਕਾਰਤ PMUY ਵੈੱਬਸਾਈਟ ਦੇਖੋ।' },
  },
  or: {
    no: { answer: 'ଆପଣଙ୍କ ଘରେ LPG ସଂଯୋଗ ନଥିଲେ ଉଜ୍ଜ୍ୱଳା ଯୋଜନା ବିଷୟରେ ଜାଣିପାରିବେ।', speakText: 'ଆପଣଙ୍କ ଘରେ ଏଲ ପି ଜି ସଂଯୋଗ ନଥିଲେ ଉଜ୍ଜ୍ୱଳା ଯୋଜନା ବିଷୟରେ ଜାଣିପାରିବେ।', nextStep: 'କାଗଜପତ୍ର ନେଇ ନିକଟ LPG ବିତରକଙ୍କୁ ପଚାରନ୍ତୁ।', sourceNote: 'ଇଣ୍ଟରନେଟ ମିଳିଲେ ଅଧିକୃତ PMUY ୱେବସାଇଟ ଦେଖନ୍ତୁ।' },
    yes: { answer: 'ଘରେ ପୂର୍ବରୁ LPG ସଂଯୋଗ ଥିଲେ ଉଜ୍ଜ୍ୱଳା ଯୋଜନାର ନିୟମ ଅଲଗା ହୋଇପାରେ।', speakText: 'ଘରେ ପୂର୍ବରୁ ଏଲ ପି ଜି ସଂଯୋଗ ଥିଲେ ଉଜ୍ଜ୍ୱଳା ଯୋଜନାର ନିୟମ ଅଲଗା ହୋଇପାରେ।', nextStep: 'ନିକଟ LPG ବିତରକଙ୍କୁ ଆପଣଙ୍କ ସ୍ଥିତି ପଚାରନ୍ତୁ।', sourceNote: 'ଇଣ୍ଟରନେଟ ମିଳିଲେ ଅଧିକୃତ PMUY ୱେବସାଇଟ ଦେଖନ୍ତୁ।' },
  },
  as: {
    no: { answer: 'আপোনাৰ ঘৰত LPG সংযোগ নাথাকিলে উজ্জ্বলা যোজনাৰ বিষয়ে জানিব পাৰে।', speakText: 'আপোনাৰ ঘৰত এল পি জি সংযোগ নাথাকিলে উজ্জ্বলা যোজনাৰ বিষয়ে জানিব পাৰে।', nextStep: 'কাগজ-পত্ৰ লৈ ওচৰৰ LPG বিতৰকক সোধক।', sourceNote: 'ইণ্টাৰনেট পালে চৰকাৰী PMUY ৱেবছাইট চাওক।' },
    yes: { answer: 'ঘৰত ইতিমধ্যে LPG সংযোগ থাকিলে উজ্জ্বলা যোজনাৰ নিয়ম বেলেগ হ’ব পাৰে।', speakText: 'ঘৰত ইতিমধ্যে এল পি জি সংযোগ থাকিলে উজ্জ্বলা যোজনাৰ নিয়ম বেলেগ হ’ব পাৰে।', nextStep: 'ওচৰৰ LPG বিতৰকক আপোনাৰ পৰিস্থিতিৰ বিষয়ে সোধক।', sourceNote: 'ইণ্টাৰনেট পালে চৰকাৰী PMUY ৱেবছাইট চাওক।' },
  },
  ur: {
    no: { answer: 'اگر آپ کے گھر میں LPG کنکشن نہیں ہے تو آپ اجولا یوجنا کے بارے میں جان سکتی ہیں۔', speakText: 'اگر آپ کے گھر میں ایل پی جی کنکشن نہیں ہے تو آپ اجولا یوجنا کے بارے میں جان سکتی ہیں۔', nextStep: 'کاغذات لے کر قریبی LPG ڈسٹری بیوٹر سے پوچھیں۔', sourceNote: 'انٹرنیٹ ملنے پر سرکاری PMUY ویب سائٹ دیکھیں۔' },
    yes: { answer: 'اگر گھر میں پہلے سے LPG کنکشن ہے تو اجولا یوجنا کے اصول مختلف ہو سکتے ہیں۔', speakText: 'اگر گھر میں پہلے سے ایل پی جی کنکشن ہے تو اجولا یوجنا کے اصول مختلف ہو سکتے ہیں۔', nextStep: 'قریبی LPG ڈسٹری بیوٹر سے اپنی صورتحال پوچھیں۔', sourceNote: 'انٹرنیٹ ملنے پر سرکاری PMUY ویب سائٹ دیکھیں۔' },
  },
  en: {
    no: { answer: 'If your home does not have an LPG connection, you can ask about Ujjwala.', speakText: 'If your home does not have an LPG connection, you can ask about Ujjwala.', nextStep: 'Carry your papers and ask a nearby LPG distributor.', sourceNote: 'Check the official PMUY website when internet is available.' },
    yes: { answer: 'If your home already has an LPG connection, Ujjwala rules may be different.', speakText: 'If your home already has an LPG connection, Ujjwala rules may be different.', nextStep: 'Ask a nearby LPG distributor about your situation.', sourceNote: 'Check the official PMUY website when internet is available.' },
  },
  'hi-Latn': {
    no: { answer: 'Agar ghar mein LPG connection nahi hai, toh aap Ujjwala ke baare mein pooch sakti hain.', speakText: 'Agar ghar mein el pee gee connection nahi hai, toh aap Ujjwala ke baare mein pooch sakti hain.', nextStep: 'Kaagaz lekar paas ke LPG distributor se poochhein.', sourceNote: 'Internet aane par official PMUY website check karein.' },
    yes: { answer: 'Agar ghar mein pehle se LPG connection hai, toh Ujjwala ke rules alag ho sakte hain.', speakText: 'Agar ghar mein pehle se el pee gee connection hai, toh Ujjwala ke rules alag ho sakte hain.', nextStep: 'Paas ke LPG distributor se apni situation poochhein.', sourceNote: 'Internet aane par official PMUY website check karein.' },
  },
  'ta-Latn': {
    no: { answer: 'Unga veetla LPG connection illa-na, Ujjwala pathi kelunga.', speakText: 'Unga veetla el pee ji connection illa-na, Ujjwala pathi kelunga.', nextStep: 'Documents eduthuttu pakkathula irukkura LPG distributor-kitta kelunga.', sourceNote: 'Internet vandha official PMUY website-a check pannunga.' },
    yes: { answer: 'Unga veetla already LPG connection irundha, Ujjwala rules different-aa irukkalaam.', speakText: 'Unga veetla already el pee ji connection irundha, Ujjwala rules different-aa irukkalaam.', nextStep: 'Pakkathula irukkura LPG distributor-kitta unga situation kelunga.', sourceNote: 'Internet vandha official PMUY website-a check pannunga.' },
  },
};

const schemeSpecificGuidance = {
  'skill-india': {
    hi: {
      no: { answer: 'बहुत अच्छा! आप प्रधानमंत्री कौशल विकास योजना में सिलाई या हुनर प्रशिक्षण के लिए पात्र हैं।', speakText: 'बहुत अच्छा! आप प्रधानमंत्री कौशल विकास योजना में सिलाई या हुनर प्रशिक्षण के लिए पात्र हैं।', nextStep: 'आधार कार्ड लेकर नज़दीकी कौशल केंद्र (PMKK) जाएं।', sourceNote: 'मुफ्त प्रशिक्षण, प्रमाणपत्र और स्टाइपेंड सरकारी नियमों के अनुसार मिलेगा।' },
      yes: { answer: 'आप कभी भी नज़दीकी कौशल केंद्र जाकर नए कोर्स और समय की जानकारी ले सकती हैं।', speakText: 'आप कभी भी नज़दीकी कौशल केंद्र जाकर नए कोर्स और समय की जानकारी ले सकती हैं।', nextStep: 'कौशल केंद्र में अपने पसंदीदा कोर्स का फॉर्म भरें।', sourceNote: 'आधिकारिक स्किल इंडिया डिजिटल पोर्टल भी देख सकती हैं।' },
    },
    en: {
      no: { answer: 'Great! You are eligible for free tailoring and skill training under PMKVY.', speakText: 'Great! You are eligible for free tailoring and skill training under PMKVY.', nextStep: 'Visit your nearest Pradhan Mantri Kaushal Kendra (PMKK) with your Aadhaar card.', sourceNote: 'Government certificate and stipend provided upon completion.' },
      yes: { answer: 'You can check upcoming batches and timing at your local skill center anytime.', speakText: 'You can check upcoming batches and timing at your local skill center anytime.', nextStep: 'Visit the local center to view available women-centric batches.', sourceNote: 'Check the official Skill India Digital portal when online.' },
    }
  },
  'pmmvy': {
    hi: {
      no: { answer: 'बधाई! प्रधानमंत्री मातृ वंदना योजना के तहत आपको ₹5,000 की सरकारी पोषण सहायता मिल सकती है।', speakText: 'बधाई! प्रधानमंत्री मातृ वंदना योजना के तहत आपको पांच हजार रुपये की सरकारी पोषण सहायता मिल सकती है।', nextStep: 'ममता कार्ड और आधार कार्ड लेकर गाँव की आशा दीदी या आंगनवाड़ी केंद्र जाएं।', sourceNote: 'पैसा 2 किश्तों में सीधे आपके आधार-लिंक बैंक खाते में जमा होगा।' },
      yes: { answer: 'मातृ वंदना योजना की जानकारी के लिए आंगनवाड़ी कार्यकर्ता आपकी तुरंत मदद करेंगी।', speakText: 'मातृ वंदना योजना की जानकारी के लिए आंगनवाड़ी कार्यकर्ता आपकी तुरंत मदद करेंगी।', nextStep: 'आंगनवाड़ी केंद्र में अपना ममता कार्ड दिखाकर पंजीकरण करवाएं।', sourceNote: 'हेल्पलाइन 181 पर भी निशुल्क कॉल कर सकती हैं।' },
    },
    en: {
      no: { answer: 'Congratulations! You are eligible for ₹5,000 maternity benefit under PMMVY.', speakText: 'Congratulations! You are eligible for 5000 rupees maternity benefit under PMMVY.', nextStep: 'Meet your local ASHA worker or Anganwadi center with your MCP card and Aadhaar.', sourceNote: 'Financial assistance transferred directly to your Aadhaar-seeded bank account.' },
      yes: { answer: 'Your local Anganwadi worker will assist you with maternity registration details.', speakText: 'Your local Anganwadi worker will assist you with maternity registration details.', nextStep: 'Bring your MCP card to verify registration records.', sourceNote: 'You can also call women helpline 181 for guidance.' },
    }
  }
};

const schemeMetadata = {
  'pmuy-new-connection': {
    title: {
      hi: 'प्रधानमंत्री उज्ज्वला योजना (PMUY) - मुफ्त गैस कनेक्शन',
      en: 'Pradhan Mantri Ujjwala Yojana (PMUY) - Free LPG Connection',
      ta: 'பிரதான் மந்திரி உஜ்வலா திட்டம் (PMUY) - இலவச எரிவாயு',
      te: 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన (PMUY) - ఉచిత గ్యాస్',
      mr: 'प्रधानमंत्री उज्ज्वला योजना (PMUY) - मोफत गॅस कनेक्शन',
      bn: 'প্রধানমন্ত্রী উজ্জ্বলা যোজনা (PMUY) - বিনামূল্যে গ্যাস সংযোগ',
    },
    eligibility: {
      hi: '18 वर्ष से अधिक उम्र की महिला, परिवार में पहले से कोई LPG कनेक्शन न हो।',
      en: 'Adult woman (18+) from an eligible household with no existing LPG connection.',
    },
    documents: [
      { name: 'आधार कार्ड (Aadhaar Card)', desc: 'पहचान और पते के प्रमाण हेतु (महिला आवेदक एवं 18+ सदस्यों का)' },
      { name: 'राशन कार्ड (Ration Card)', desc: 'पारिवारिक सदस्यों की पुष्टि के लिए राज्य सरकार द्वारा जारी' },
      { name: 'बैंक खाता पासबुक (Bank Passbook)', desc: 'सब्सिडी सीधे खाते में आने के लिए आधार से लिंक खाता' },
      { name: 'पासपोर्ट साइज़ फोटो (Photos)', desc: 'हाल की 2 रंगीन फोटो वितरक कार्यालय में फॉर्म पर लगाने हेतु' },
    ],
    steps: [
      'कागज़ात की फोटोकॉपी तैयार करें',
      'नज़दीकी LPG वितरक (इंडेन, भारत गैस, एचपी) एजेंसी जाएं',
      'उज्ज्वला 2.0 फॉर्म निशुल्क प्राप्त करें और अंगूठे/हस्ताक्षर से भरें',
      'वितरक रसीद लें, सत्यापन के बाद मुफ्त गैस चूल्हा व सिलेंडर मिलेगा',
    ],
  },
  'pmmvy': {
    title: {
      hi: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY) - मातृत्व पोषण सहायता ₹5,000',
      en: 'Pradhan Mantri Matru Vandana Yojana (PMMVY) - Maternity Benefit ₹5,000',
      ta: 'பிரதான் மந்திரி மாத்ரு வந்தனா திட்டம் (PMMVY) - ரூ.5,000 உதவி',
      te: 'ప్రధాన మంత్రి మాతృ వందన యోజన (PMMVY) - రూ.5,000 సహాయం',
      mr: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY) - ₹5,000 मातृत्व पोषण',
      bn: 'প্রধানমন্ত্রী মাতৃ বন্দনা যোজনা (PMMVY) - মাতৃত্ব সহায়তা ₹৫,০০০',
    },
    eligibility: {
      hi: 'गर्भवती और स्तनपान कराने वाली माताएं (19 वर्ष या अधिक)। प्रथम एवं द्वितीय कन्या शिशु हेतु।',
      en: 'Eligible pregnant women and lactating mothers for 1st child and 2nd girl child.',
    },
    documents: [
      { name: 'ममता कार्ड / MCP कार्ड (Mother & Child Protection Card)', desc: 'आंगनवाड़ी या सरकारी अस्पताल से जारी टीकाकरण कार्ड' },
      { name: 'माँ का आधार कार्ड (Mother Aadhaar Card)', desc: 'आधार कार्ड अनिवार्य है एवं बैंक खाते से जुड़ा होना चाहिए' },
      { name: 'बैंक पासबुक (Bank Passbook)', desc: 'महिला के नाम का एकल खाता (DBT सक्षम)' },
      { name: 'पति का पहचान पत्र (Husband ID Proof)', desc: 'पारिवारिक विवरण एवं फॉर्म पर हस्ताक्षर' },
    ],
    steps: [
      'गर्भावस्था के पहले 150 दिनों में आंगनवाड़ी केंद्र में पंजीकरण करवाएं',
      'नियमित प्रसव पूर्व जांच (ANC) कराएं और कार्ड पर मुहर लगवाएं',
      'आंगनवाड़ी कार्यकर्ता या आशा दीदी को फॉर्म 1-A और कागज़ात दें',
      'सरकारी सहायता सीधे आपके बैंक खाते में दो किश्तों में आएगी',
    ],
  },
  'skill-india': {
    title: {
      hi: 'प्रधानमंत्री कौशल विकास योजना (PMKVY) - मुफ्त सिलाई व हुनर प्रशिक्षण',
      en: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY) - Free Skill Training',
      ta: 'பிரதான் மந்திரி கௌஷல் விகாஸ் திட்டம் (PMKVY) - இலவச பயிற்சி',
      te: 'ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన (PMKVY) - ఉచిత నైపుణ్య శిక్షణ',
      mr: 'प्रधानमंत्री कौशल विकास योजना (PMKVY) - मोफत कौशल्य प्रशिक्षण',
      bn: 'প্রধানমন্ত্রী কৌশল বিকাশ যোজনা (PMKVY) - বিনামূল্যে প্রশিক্ষণ',
    },
    eligibility: {
      hi: 'कोई भी भारतीय महिला या युवती (15-45 वर्ष) जो अपना काम या रोज़गार शुरू करना चाहती हैं।',
      en: 'Indian women (15-45 years) seeking skill training and self-employment.',
    },
    documents: [
      { name: 'आधार कार्ड (Aadhaar Card)', desc: 'बायोमेट्रिक उपस्थिति और सरकारी प्रमाण-पत्र हेतु अनिवार्य' },
      { name: 'शैक्षिक प्रमाण-पत्र (Marksheet/School Certificate)', desc: 'यदि कोई हो (अंगूठाछाप बहनों के लिए भी कई कोर्स उपलब्ध)' },
      { name: 'बैंक खाता विवरण (Bank Details)', desc: 'सरकारी वजीफा या मानदेय प्राप्त करने के लिए' },
      { name: 'पासपोर्ट साइज़ फोटो (2 Photos)', desc: 'कौशल केंद्र छात्र आईडी कार्ड हेतु' },
    ],
    steps: [
      'नज़दीकी प्रधानमंत्री कौशल केंद्र (PMKK) या जन शिक्षण संस्थान जाएं',
      'महिलाओं के लिए सिलाई, बुनाई, ब्यूटी, डिजिटल साक्षरता कोर्स चुनें',
      'मुफ्त प्रशिक्षण में भाग लें और दैनिक उपस्थिति दर्ज करें',
      'प्रशिक्षण पूरा होने पर सरकारी प्रमाणपत्र और रोज़गार मार्गदर्शन पाएं',
    ],
  },
};

export function getOfflineGuidance({ language = 'hi', answer = 'no', schemeId, resourceId, currentScreen }) {
  const targetScheme = schemeId || resourceId || 'pmuy-new-connection';
  let baseGuide;

  if (schemeSpecificGuidance[targetScheme]) {
    const schemeDict = schemeSpecificGuidance[targetScheme][language] || schemeSpecificGuidance[targetScheme].en || schemeSpecificGuidance[targetScheme].hi;
    if (schemeDict && schemeDict[answer]) {
      baseGuide = schemeDict[answer];
    }
  }

  if (!baseGuide) {
    const languageGuidance = guidance[language] || guidance.en || guidance.hi;
    baseGuide = languageGuidance[answer] || languageGuidance.no;
  }

  const meta = schemeMetadata[targetScheme] || schemeMetadata['pmuy-new-connection'];
  const title = (meta.title && (meta.title[language] || meta.title.en || meta.title.hi)) || meta.title.en;
  const eligibility = (meta.eligibility && (meta.eligibility[language] || meta.eligibility.en || meta.eligibility.hi)) || meta.eligibility.en;

  return {
    ...baseGuide,
    title,
    eligibility,
    documents: meta.documents || [],
    steps: meta.steps || [],
    source: 'Offline Knowledge Base',
  };
}

export function getOfflineDocuments(schemeId = 'pmuy-new-connection', language = 'hi') {
  const meta = schemeMetadata[schemeId] || schemeMetadata['pmuy-new-connection'];
  return meta.documents || [];
}

export function getRequiredDocuments(schemeId = 'pmuy-new-connection', language = 'hi') {
  return getOfflineDocuments(schemeId, language);
}

export function getOfflineVoicePrompts(language = 'hi') {
  const promptsByLang = {
    hi: [
      { text: 'मुझे नया गैस कनेक्शन चाहिए', hint: 'PMUY उज्ज्वला 2.0' },
      { text: 'गैस कनेक्शन के लिए कौन से कागज़ चाहिए?', hint: 'कागज़ात सूची' },
      { text: 'गर्भवती महिलाओं को कौन सी सरकारी मदद मिलती है?', hint: 'PMMVY ₹5,000' },
      { text: 'सिलाई सीखने की सरकारी योजना बताओ', hint: 'PMKVY कौशल विकास' },
      { text: 'आपातकाल में किस नंबर पर फोन करें?', hint: '112 / 181 सुरक्षा' },
    ],
    en: [
      { text: 'I need a new gas connection', hint: 'PMUY Ujjwala 2.0' },
      { text: 'What documents are required for gas?', hint: 'Document checklist' },
      { text: 'What government scheme helps pregnant women?', hint: 'PMMVY maternity ₹5,000' },
      { text: 'Tell me about free tailoring and skill training', hint: 'PMKVY Skill India' },
      { text: 'Which number to call in emergency?', hint: '112 / 181 Safety' },
    ],
    ta: [
      { text: 'எனக்கு புதிய கேஸ் இணைப்பு வேண்டும்', hint: 'PMUY உஜ்வலா' },
      { text: 'கேஸ் இணைப்புக்கு என்ன ஆவணங்கள் தேவை?', hint: 'ஆவணங்கள்' },
      { text: 'கர்ப்பிணி பெண்களுக்கு என்ன உதவி கிடைக்கிறது?', hint: 'PMMVY உதவி' },
      { text: 'தையல் பயிற்சி திட்டம் பற்றி கூறுங்கள்', hint: 'PMKVY பயிற்சி' },
    ],
    te: [
      { text: 'నాకు కొత్త గ్యాస్ కనెక్షన్ కావాలి', hint: 'PMUY ఉజ్జ్వల' },
      { text: 'గ్యాస్ కనెక్షన్ కొరకు ఏ పత్రాలు అవసరం?', hint: 'పత్రాల జాబితా' },
      { text: 'గర్భిణీ స్త్రీలకు ప్రభుత్వం ఇచ్చే సహాయం ఏమిటి?', hint: 'PMMVY సహాయం' },
      { text: 'ఉచిత కుట్టు మిషన్ శిక్షణ గురించి చెప్పండి', hint: 'PMKVY శిక్షణ' },
    ],
    mr: [
      { text: 'मला नवीन गॅस कनेक्शन हवे आहे', hint: 'PMUY उज्ज्वला' },
      { text: 'गॅस कनेक्शनसाठी कोणती कागदपत्रे लागतील?', hint: 'कागदपत्रे' },
      { text: 'गरोदर महिलांसाठी कोणती योजना आहे?', hint: 'PMMVY योजना' },
      { text: 'मोफत शिलाई प्रशिक्षणाबद्दल सांगा', hint: 'PMKVY कौशल्य' },
    ],
    bn: [
      { text: 'আমার একটি নতুন গ্যাস সংযোগ দরকার', hint: 'PMUY উজ্জ্বলা' },
      { text: 'গ্যাস সংযোগের জন্য কি কি কাগজপত্র লাগবে?', hint: 'কাগজপত্র' },
      { text: 'গর্ভবতী মহিলাদের জন্য কি সরকারি সুবিধা আছে?', hint: 'PMMVY সহায়তা' },
      { text: 'ফ্রি সেলাই প্রশিক্ষণের বিষয়ে বলুন', hint: 'PMKVY স্কিল' },
    ],
  };

  return promptsByLang[language] || promptsByLang.hi;
}

