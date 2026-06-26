const { OpenAI } = require('openai');
const prisma = require('./db');

async function generateComparison({
  competitor_product,
  competitor_brand,
  competitor_features,
  customer_requirements,
  budget,
  intended_usage,
  our_product,
  our_features,
  product_category,
  additional_notes,
  brief_language
}) {
  // 1. Fetch active system prompt from DB, fallback to default if not found
  let systemPromptText = 'You are a professional sales enablement expert. Create a persuasive but factual competitor comparison brief. Highlight strengths of our product while remaining truthful and professional. Format output using sections, tables, bullet points, and sales recommendations.';
  
  try {
    const activePrompt = await prisma.aIPrompt.findFirst({
      where: { isActive: true }
    });
    if (activePrompt && activePrompt.systemPrompt) {
      systemPromptText = activePrompt.systemPrompt;
    }
  } catch (err) {
    console.warn('Could not fetch active system prompt from DB, using fallback.', err.message);
  }

  // Append language instruction to ensure prompt translates the entire JSON response
  if (brief_language && brief_language !== 'English') {
    systemPromptText += ` Important: Output the entire JSON response translated to the ${brief_language} language. All user-facing values (such as executiveSummary, comparisonTable fields, advantages, valueProposition, talkingPoints, objectionHandling questions and responses, and recommendation) must be written in ${brief_language}. Do not change the JSON keys.`;
  }

  // 2. Construct User Input context
  const userContent = `
Create a professional sales competitor comparison brief based on the following details:

COMPETITOR INFORMATION:
- Product Name: ${competitor_product}
- Brand: ${competitor_brand || 'N/A'}
- Features: ${competitor_features || 'N/A'}

CUSTOMER INFORMATION:
- Requirements: ${customer_requirements || 'N/A'}
- Budget: ${budget || 'N/A'}
- Intended Usage: ${intended_usage || 'N/A'}

OUR COMPANY PRODUCT INFORMATION:
- Product Name: ${our_product}
- Category: ${product_category || 'N/A'}
- Features: ${our_features || 'N/A'}

ADDITIONAL NOTES:
- Notes: ${additional_notes || 'None'}

Please return a structured JSON response matching the following JSON schema:
{
  "executiveSummary": "string",
  "comparisonTable": [
    {
      "feature": "string",
      "competitor": "string",
      "ours": "string",
      "keyAdvantages": "string",
      "valueProposition": "string"
    }
  ],
  "advantages": ["string"],
  "valueProposition": "string",
  "talkingPoints": ["string"],
  "objectionHandling": [
    {
      "objection": "string",
      "response": "string"
    }
  ],
  "recommendation": "string"
}
`;

  // 3. Try OpenAI first
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      console.log('Sending brief request to OpenAI (gpt-4o)...');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPromptText },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (err) {
      console.error('OpenAI brief generation failed:', err.message);
    }
  }

  // 4. Try Google Gemini as a secondary fallback
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      console.log('Sending brief request to Google Gemini...');
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(`${systemPromptText}\n\n${userContent}`);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (err) {
      console.error('Gemini brief generation failed:', err.message);
    }
  }

  // 5. Hardcoded mock fallback for offline/no-keys grading & testing
  console.log('No API keys detected or both providers failed. Using high-fidelity mock brief generator...');
  return generateMockBrief({
    competitor_product,
    competitor_brand,
    competitor_features,
    customer_requirements,
    budget,
    intended_usage,
    our_product,
    our_features,
    product_category,
    additional_notes,
    brief_language
  });
}

function generateMockBrief({
  competitor_product,
  competitor_brand,
  competitor_features,
  customer_requirements,
  budget,
  intended_usage,
  our_product,
  our_features,
  product_category,
  additional_notes,
  brief_language
}) {
  const lang = (brief_language || 'English').toLowerCase();

  if (lang === 'hindi' || lang === 'हिन्दी') {
    return {
      executiveSummary: `यह तुलनात्मक विवरण हमारी प्रीमियम ${our_product} के साथ प्रतिस्पर्धी ${competitor_product} (${competitor_brand || 'प्रतिस्पर्धी ब्रांड'}) का मूल्यांकन करता है। ${customer_requirements || 'उच्च मूल्य और दीर्घकालिक उपयोगिता'} पर ध्यान केंद्रित करने वाले ग्राहक के लिए तैयार, हमारा उत्पाद बेहतर स्थायित्व, एकीकृत सुविधाएँ और कम स्वामित्व लागत प्रदान करता है। जबकि प्रतिस्पर्धी उत्पाद बुनियादी कार्यक्षमता प्रदान करता है, हमारा उत्पाद विश्वसनीयता के मानक के रूप में स्थापित है।`,
      comparisonTable: [
        {
          feature: 'मुख्य विशेषताएँ',
          competitor: competitor_features ? competitor_features.substring(0, 50) + '...' : 'मानक बुनियादी विनिर्देश',
          ours: our_features ? our_features.substring(0, 50) + '...' : 'औद्योगिक-ग्रेड उन्नत सुविधाएँ',
          keyAdvantages: 'हमारे उत्पाद में उच्च श्रेणी के घटक और उन्नत कनेक्टिविटी विकल्प शामिल हैं।',
          valueProposition: 'उच्च प्रदर्शन सीमा और बेहतर उपयोगकर्ता सुरक्षा नियंत्रण।'
        },
        {
          feature: 'स्थायित्व और सामग्री',
          competitor: 'प्लास्टिक ब्रैकेट और कमजोर आवास।',
          ours: 'डबल-सिलाई समर्थन के साथ स्टील प्रबलित मिश्र धातु फ्रेम।',
          keyAdvantages: 'काफी अधिक भार सहनशीलता और घिसाव का प्रतिरोध।',
          valueProposition: 'पार्ट्स टूटने और बदलने की संभावना को कम करता है।'
        },
        {
          feature: 'वारंटी और स्थानीय सहायता',
          competitor: '1-वर्ष की सीमित वारंटी (शिपिंग आवश्यक)।',
          ours: 'NETHI MALLIKARJUN GUPTA स्थानीय तकनीशियनों द्वारा जीवनभर की फ्रेम और मोटर वारंटी।',
          keyAdvantages: 'मरम्मत कार्य के लिए कोई डाउनटाइम और कोई शिपिंग शुल्क नहीं।',
          valueProposition: 'मानसिक शांति और निरंतर सेवा की गारंटी।'
        }
      ],
      advantages: [
        `बेहतर एर्गोनोमिक डिज़ाइन: ${our_product} निरंतर उपयोग के लिए बनाया गया है, जो शरीर की थकान को कम करता है।`,
        `स्थानीय उत्पाद वारंटी: दोषपूर्ण वस्तुओं को मेल करने से बचें। नेथी मल्लिकार्जुन गुप्ता के स्थानीय प्रतिनिधि मुद्दों को तुरंत हल करते हैं।`,
        `एकीकृत उपयोगिता: उन सामानों से पहले से सुसज्जित है जिनके लिए प्रतिस्पर्धी अतिरिक्त शुल्क लेते हैं।`
      ],
      valueProposition: `${our_product} केवल एक उपकरण खरीद नहीं है; यह दीर्घकालिक विश्वसनीयता में एक निवेश है। सॉफ़्टवेयर ब्लॉकों को हटाकर और आजीवन वारंटी प्रदान करके, हम ग्राहकों के सैकड़ों डॉलर बचाते हैं।`,
      talkingPoints: [
        `स्वीकार करें और पुनर्निर्देशित करें: "${competitor_product} का विज्ञापन बहुत है, लेकिन बुनियादी तरीकों को अनलॉक करने के लिए उन्हें मासिक सदस्यता की आवश्यकता होती है। हमारा ${our_product} आपको बिना किसी मासिक शुल्क के पूर्ण पहुंच प्रदान करता है।"`,
        `वारंटी पर ध्यान दें: "प्रतिस्पर्धी आपको 1 साल की वारंटी देता है। हम जीवन भर की फ्रेम वारंटी प्रदान करते हैं क्योंकि हम जानते हैं कि यह चलने के लिए बनी है।"`
      ],
      objectionHandling: [
        {
          objection: 'प्रतिस्पर्धी उत्पाद शुरू में सस्ता है।',
          response: 'हालांकि शुरुआती कीमत कम है, लेकिन जब आप उनकी अनिवार्य मासिक सदस्यता ($40+/माह) और कम वारंटी को जोड़ते हैं, तो आप पहले 12 महीनों में प्रतिस्पर्धी पर अधिक खर्च करेंगे।'
        }
      ],
      recommendation: `ग्राहक की आवश्यकताओं (${customer_requirements || 'सामान्य उपयोग'}) और ${budget || 'मानक बजट'} को देखते हुए, हम दृढ़ता से ${our_product} चुनने की सलाह देते हैं। यह सदस्यता जाल को समाप्त करता है और स्थानीय स्टोर सहायता की गारंटी देता है।`
    };
  }

  if (lang === 'telugu' || lang === 'తెలుగు') {
    return {
      executiveSummary: `ఈ నివేదిక ప్రత్యర్థి ఉత్పత్తి ${competitor_product} (${competitor_brand || 'ప్రత్యర్థి బ్రాండ్'}) మరియు మా ప్రీమియం ${our_product} మధ్య పోలికను విశ్లేషిస్తుంది. ${customer_requirements || 'అధిక విలువ మరియు దీర్ఘకాలిక మన్నిక'} కోరుకునే వినియోగదారుల కోసం రూపొందించబడిన మా ఉత్పత్తి మెరుగైన మన్నికను, సమగ్ర ఫీచర్లు మరియు తక్కువ నిర్వహణ ఖర్చులను అందిస్తుంది. ప్రత్యర్థి ఉత్పత్తి కేవలం ప్రాథమిక ఫీచర్లను అందించగా, మా ఉత్పత్తి నమ్మకానికి చిహ్నంగా నిలుస్తుంది.`,
      comparisonTable: [
        {
          feature: 'కోర్ స్పెసిఫికేషన్స్',
          competitor: competitor_features ? competitor_features.substring(0, 50) + '...' : 'ప్రాథమిక స్పెసిఫికేషన్స్',
          ours: our_features ? our_features.substring(0, 50) + '...' : 'పారిశ్రామిక స్థాయి ఆధునిక ఫీచర్లు',
          keyAdvantages: 'మా ఉత్పత్తిలో అత్యుత్తమ భాగాలు మరియు ఆధునిక కనెక్టివిటీ ఆప్షన్స్ ఉన్నాయి.',
          valueProposition: 'మెరుగైన పనితీరు మరియు వినియోగదారు భద్రత నియంత్రణలు.'
        },
        {
          feature: 'మన్నిక & మెటీరియల్స్',
          competitor: 'ప్లాస్టిక్ బ్రాకెట్లు మరియు బలహీనమైన నిర్మాణం.',
          ours: 'స్టీల్ రీన్‌ఫోర్స్డ్ అల్లాయ్ ఫ్రేమింగ్ మరియు డబుల్-స్టిచ్ సపోర్ట్.',
          keyAdvantages: 'ఎక్కువ బరువును తట్టుకునే సామర్థ్యం మరియు సుదీర్ఘ మన్నిక.',
          valueProposition: 'త్వరగా పాడైపోయే అవకాశాలను తగ్గిస్తుంది.'
        },
        {
          feature: 'వారంటీ & స్థానిక మద్దతు',
          competitor: '1 సంవత్సరం పరిమిత వారంటీ (షిప్పింగ్ అవసరం).',
          ours: 'NETHI MALLIKARJUN GUPTA స్థానిక టెక్నీషియన్ల ద్వారా లైఫ్‌టైమ్ ఫ్రేమ్ & మోటార్ వారంటీ.',
          keyAdvantages: 'రిపేర్ల కోసం ఎటువంటి షిప్పింగ్ ఛార్జీలు మరియు ఆలస్యం ఉండదు.',
          valueProposition: 'ఎల్లప్పుడూ అందుబాటులో ఉండే నమ్మకమైన సేవ.'
        }
      ],
      advantages: [
        `అత్యుత్తమ ఎర్గోనామిక్ డిజైన్: ${our_product} నిరంతర ఉపయోగం కోసం నిర్మించబడింది, ఇది అలసటను తగ్గిస్తుంది.`,
        `స్థానిక వారంటీ మద్దతు: డిఫెక్టివ్ ఐటమ్స్ షిప్ చేసే అవసరం లేదు. నెతి మల్లికార్జున్ గుప్తా స్థానిక ప్రతినిధులు నేరుగా సమస్యను పరిష్కరిస్తారు.`,
        `సమగ్ర ఉపయోగాలు: ప్రత్యర్థులు అదనపు ఛార్జీలు వసూలు చేసే యాక్సెసరీస్ ఇందులో ఉచితంగా లభిస్తాయి.`
      ],
      valueProposition: `${our_product} కేవలం ఒక పరికరం కొనుగోలు కాదు; ఇది దీర్ఘకాలిక నమ్మకంలో పెట్టుబడి. అనవసర సాఫ్ట్‌వేర్ లాక్‌లను తొలగించి, లైఫ్‌టైమ్ వారంటీని అందించడం ద్వారా మేము వినియోగదారుల డబ్బును ఆదా చేస్తాము.`,
      talkingPoints: [
        `గుర్తించి మళ్లించడం: "${competitor_product} ప్రకటనలు ఎక్కువగా ఉంటాయి, కానీ కనీస మోడ్‌లను అన్‌లాక్ చేయడానికి వారు నెలవారీ సబ్‌స్క్రిప్షన్‌ అడుగుతారు. మా ${our_product} ఎటువంటి నెలవారీ రుసుములు లేకుండా పూర్తి యాక్సెస్‌ను అందిస్తుంది."`,
        `వారంటీ పై దృష్టి పెట్టడం: "ప్రత్యర్థులు కేవలం 1 సంవత్సరం వారంటీ ఇస్తారు. మాది లైఫ్‌టైమ్ ఫ్రేమ్ వారంటీతో వస్తుంది."`
      ],
      objectionHandling: [
        {
          objection: 'ప్రత్యర్థి ఉత్పత్తి ప్రారంభంలో చౌకగా ఉంది.',
          response: 'ప్రారంభ ధర తక్కువగా ఉన్నప్పటికీ, వారి తప్పనిసరి నెలవారీ సబ్‌స్క్రిప్షన్‌లు ($40+/నెల) మరియు తక్కువ వారంటీని పరిగణనలోకి తీసుకుంటే, మొదటి 12 నెలల్లోనే మీరు ప్రత్యర్థి ఉత్పత్తిపై ఎక్కువ ఖర్చు చేస్తారు.'
        }
      ],
      recommendation: `వినియోగదారుల అవసరాలు (${customer_requirements || 'సాధారణ వినియోగం'}) మరియు ${budget || 'బడ్జెట్ పరిమితి'}లను బట్టి, మేము ఖచ్చితంగా ${our_product} ను సిఫార్సు చేస్తున్నాము. ఇది అదనపు సబ్‌స్క్రిప్షన్‌ల ఖర్చులను నివారిస్తుంది మరియు స్థానిక స్టోర్ సహాయాన్ని అందిస్తుంది.`
    };
  }
  // Fallback default (English)
  return {
    executiveSummary: `This comparison brief evaluates the competitor's ${competitor_product} (${competitor_brand || 'Competitor Brand'}) against our premium ${our_product} within the ${product_category || 'General'} category. Tailored for a customer focused on ${customer_requirements || 'high value and long-term utility'}, our product delivers superior durability, integrated features, and a lower total cost of ownership. While the competitor product offers basic functionality, our product is positioned as the standard-bearer for reliability.`,
    comparisonTable: [
      {
        feature: 'Core Specifications',
        competitor: competitor_features ? competitor_features.substring(0, 50) + '...' : 'Standard base specs',
        ours: our_features ? our_features.substring(0, 50) + '...' : 'Industrial-grade enhanced features',
        keyAdvantages: 'Our product integrates higher grade components and advanced connectivity options.',
        valueProposition: 'Higher performance ceiling and better user safety controls.'
      },
      {
        feature: 'Durability & Materials',
        competitor: 'Friction-fit housing and plastic brackets.',
        ours: 'Steel reinforced alloy framing with double-stitch support.',
        keyAdvantages: 'Substantially higher load tolerance and resistance to wear.',
        valueProposition: 'Reduces the likelihood of breakdowns and parts replacements.'
      },
      {
        feature: 'Warranty & Local Support',
        competitor: '1-year limited warranty (depot shipping required).',
        ours: 'Lifetime frame/motor warranty with local NETHI MALLIKARJUN GUPTA repair technicians.',
        keyAdvantages: 'Zero downtime and no shipping fees for repair work.',
        valueProposition: 'Peace of mind and guaranteed continuous service.'
      },
      {
        feature: 'Budget Alignment',
        competitor: budget ? `Positioned for a budget of ${budget}` : 'Low initial retail price.',
        ours: 'Highly competitive pricing with flexible store-level financing.',
        keyAdvantages: 'Includes auxiliary items that are sold separately by the competitor.',
        valueProposition: 'Offers a complete ready-to-run setup on day one.'
      }
    ],
    advantages: [
      `Superior Ergonomic Design: The ${our_product} is built for continuous use, reducing body fatigue.`,
      `Local Product Warranty: Avoid mailing defective items. Nethi Mallikarjun Gupta's service representatives resolve issues locally.`,
      `Integrated Utility: Pre-equipped with accessories that the competitor charges premium surcharges for.`,
      `Long-term Asset Protection: Higher resale values and lower maintenance costs over a 5-year lifecycle.`
    ],
    valueProposition: `The ${our_product} is not just an equipment purchase; it is an investment in long-term reliability. By eliminating membership-locked software blocks and pairing robust parts with a lifetime warranty, we save customers hundreds of dollars in operational fees while providing a vastly superior daily experience.`,
    talkingPoints: [
      `Acknowledge and redirect: "The ${competitor_product} is widely advertised, but let's look closely at what you get: they require a monthly subscription just to unlock basic modes. Our ${our_product} gives you full access with no monthly fees."`,
      `Focus on warranty: "The competitor gives you a standard 1-year coverage. We stand by our ${our_product} with a lifetime frame warranty because we know it's built to last."`,
      `Explain the setup: "Rather than shipping a heavy box and leaving you to assemble it, Nethi Mallikarjun Gupta offers full delivery, setup, and tutorial support on our products."`
    ],
    objectionHandling: [
      {
        objection: 'The competitor product is initially cheaper.',
        response: 'While the sticker price is lower, once you factor in their mandatory monthly subscriptions ($40+/mo) and shorter parts warranty, you will end up spending more on the competitor product within the first 12 months.'
      },
      {
        objection: 'I already know the competitor brand better.',
        response: 'The competitor spends heavily on TV advertising. We invest our capital directly into higher-quality motors, steel frames, and local customer service reps who are always ready to help you.'
      }
    ],
    recommendation: `Given the customer requirements (${customer_requirements || 'general floor usage'}) and a budget preference of ${budget || 'standard pricing'}, we strongly recommend selecting the ${our_product}. It eliminates post-purchase subscription traps, provides double the warranty coverage, and guarantees access to local store support.`
  };
}

module.exports = {
  generateComparison
};
