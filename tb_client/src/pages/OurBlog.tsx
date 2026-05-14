// src/pages/OurBlog.tsx
import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { ImageGallery } from "../components/ui/ImageGallery";
import { blogService } from "../lib/firebaseService";

import blog1 from "../assets/blog1.jpg";
import blog2 from "../assets/blog2 (2).png";
import blog3 from "../assets/blog3.jpg";

const staticBlogPosts = [
  {
    id: 1,
    title: "बालपणाच्या गोड आठवणी",
    date: "12-Aug-2023",
    image: blog1,
    content: `
समाजात वर्षानुवर्ष अनेक गैरसमज पसरलेले असतात. त्यातीलच एक गैरसमज असा आहे की शाळा व्यवस्थित सुरू असल्या की मुलं शिकतात. वास्तविक शाळा सुरू असणे आणि ती व्यवस्थित सुरू असणे यात खूप मोठा फरक आहे. दर पस्तीस मिनिटाला घंटा वाजते आणि एक शिक्षक बाहेर जाऊन दुसरा शिक्षक वर्गात प्रवेश करतो किंवा काही ठिकाणी पहिली, दुसरी, तिसरी, चौथी मधील सर्व मुले एकाच वर्गात शिकवली जातात,तसेच वर्गात पाठांतरावर भर दिला जातो किंवा घरातून अभ्यास करून नाही म्हणून दटावले जाते, अनेक हाय-फाय सुख सुविधा पुरविल्या म्हणजे मुले शिकतात, असे अनेक गैरसमज अस्तित्वात आहेत. प्रचंड मुलांच्या संख्येत एका बाकावर बसून शिकणे, अर्ध्या तासाच्या सुट्टीत शेकडो मुलांबरोबर घसरगुंडी किंवा झोपाळ्यावर बसणे, डिजिटल वर्गांमध्ये मुलांना शिकवणे किंवा गोष्टी सांगणे, महागडे कागद, क्राफ्ट पेपर, डझनाने आणलेले स्केच पेन्स याचा पेंटिंग साठी वापर करणे आणि मुलांना अति शिस्त लावायचा प्रयत्न करणे, याला जर कोणी शिक्षण म्हणत असेल तर त्यांच्या बुद्धीचे कौतुक करावे तेवढे थोडेच आहे.
याचे मुख्य कारण म्हणजे शाळेतच मुलं शिकतात किंवा मुलं शिकण्यासाठी शाळा पाहिजेत, या मताशी लाखो लोक सहमत नाहीत. दुर्दैवाने त्यांचे कुणी ऐकत नाही किंवा त्यांना खुळ्यात काढतात हा भाग वेगळा आणि म्हणून कोरोनाच्या संसर्गामुळे शाळा बंद पडलेल्या आहेत याचे फार मोठे दुःख होण्याचे काहीही कारण नाही. मुले शिकू शकत नाहीत, हे शाळा बंद पडण्याचे खरे दुःख नसून शासनाच्या आणि शिक्षण संस्थांच्या बंद पडलेल्या शाळांमुळे राजकीय, सामाजिक आणि आर्थिक नुकसान आणि अस्थैर्य त्यांना डोळ्यापुढे दिसत आहे ही खरी समस्या आहे. वास्तविक या दोन्ही वर्गांना मुलांच्या भवितव्याशी कोणतेही देणेघेणे नाही. शासन शाळा चालवते ते बेकार निर्माण करण्यासाठी आणि संस्थाचालक शाळा चालवतात ते पैसा मिळवण्यासाठी हे त्रिकालाबाधित सत्य आहे. जर खरच असे नसते तर कोरोना संसर्गाच्या आधी मागील पन्नास वर्षांमध्ये काही ठराविक टक्केवारी सोडता शालेय शिक्षणातून मुलांची किती प्रगती झाली हे देशातील उद्योजक, व्यापारी आणि व्यावसायीकानाच विचारावे. भारतातील शिक्षण व्यवस्था पूर्णपणे कोलमडली आहे असे विचारवंतांनी लिहीलेले रकानेच्या रकाने आपणास रोज वाचावयास मिळतात. तसे नसते तर एकविसाव्या शतकात शिक्षकांच्या आणि मंत्र्यांच्या फिनलंड मध्ये फेऱ्या झाल्या नसत्या. शिक्षकांचे महत्व कमी करून डिजिटलायझेशन आले नसते.


  याउलट गेल्या चार महिन्यातील सद्यस्थितीचा विचार केला तर मुलं खरोखरच अतिशय आनंदी आहेत. अभ्यासाचे टेन्शन हा विषयच त्यांच्या डोक्यातून गायब झाला आहे. सध्या ते घरातील अतिशय पोषक वातावरणात फक्त आईकडूनच नाही तर बाबा, बहीण, भाऊ, आजोबा-आजी या सर्वांकडून खेळ, टीव्ही, व्हिडिओ, पुस्तके, कॅरम, पत्ते, लुडो सापशीडी, बॅडमिंटन, व्हॉलीबॉल, फुटबॉल पळापळी सायकलिंग व्यायाम, योगा ,प्राणायाम,गप्पागोष्टी, खाद्यपदार्थ तयार करणे, वाढणे, झाडलोट करणे, अंथरूण घालणे, फरशी पुसणे, वडीलधाऱ्यांना औषधे देणे, या माध्यमातून प्रचंड गोष्टी आनंदाने शिकत आहेत असे बहुतांशी पालकांचे अनुभव आहेत. याला फक्त मॉडर्न आया की ज्यांना स्वतःला मोकळा वेळ पाहिजे आणि हाय-फाय शाळांच्या जाहिरातींना अधीन झालेल्या आहेत त्या फक्त अपवाद आहेत.
फक्त अभ्यास एके अभ्यास आणि शाळा एके शाळा ही कोरोनाव्हायरस पूर्वीची परिस्थिती आणि सर्व कुटुंबीय आणि मित्रांसह हसत बागडत, खेळत, उड्या मारत शिकणे यातील फरक झापडे लावलेल्या शासनाला आणि स्वार्थी संस्थाचालकांना समजण्या पलीकडचा आहे.

  आज सकाळी जेव्हा वर्तमानपत्रांमध्ये केजी ते दुसरीचे वर्ग सुद्धा आता ऑनलाईन असे वाचले त्यातून प्रेरणा घेऊन हा ब्लॉग लिहायची इच्छा झाली. कारण आत्ताच यांना थांबवले नाही तर आठवा आणि नववा महिना लागलेल्या मातेला देखील त्यांच्या गर्भाशयातील मुलांना ऑनलाइन शिकवू शकतो असे म्हणायला ही मंडळी कमी करणार नाहीत. कृपया विचार व्हावा.

    आता रिव्हर्स गियर वर मी कितीही कणखरपणे सध्य परिस्थिती सांगितली असली तरी देखील प्रत्येक पालकाने विद्यार्थ्याचे वय, त्याची मन:स्थिती, क्षमता, शाळेशी असलेले संबंध, शाळेवरची विश्वासार्हता या सर्व बाबींचा विचार करून परंतु भावनेच्या आहारी न जाता पूर्ण तारतम्य ठेऊन स्वत:च्या बाबतीत निर्णय घ्यायला हवा.

      शाळा या पाहिजेतच किंबहूना शाळा असणे ही अनेकांची सोय आणि गरज देखील आहे परंतु कोरोंना व्हायरस च्या काळात मुले कशी शिकली याचा अभ्यास होणे अत्यंत गरजेचे आहे आणि त्याचा अवलंब शाळांमध्ये करून शिक्षणाचा दर्जा कसा सुधारता येईल याकडे लक्ष दिले जावे म्हणून हा खटाटोप.
    
`,
  },
  {
    id: 2,
    title: "सणांचे महत्त्व",
    date: "15-Aug-2023",
    image: blog2,
    content: `
 शिक्षण याचा अर्थ शाळेत, क्लासेस मध्ये तसेच पालक मुलांना रोज वया पुस्तक घेऊन शिकवतात असा गैरसमज विनाकारण सगळीकडे पसरलेला आहे. शिक्षण अनुभावातून देखील घेता येते. त्याच अनुषंगाने माझे पुढील विचार मांडत आहे.

  आपणास लक्षात आले आहे का माहित नाही परंतु गेले महिनाभर आपण सर्वजण घरी बसलेलो आहोत. आपण घरचेच खात आहोत. हॉटेलिंग पूर्णपणे बंद झाले आहे. बाहेर जात नसल्यामुळे शरीरावर प्रदूषणाचा देखील काही परिणाम होत नाही. या सगळ्याचा कळत नकळत झालेला परिणाम येथे सांगण्याचा मी प्रयत्न करत आहे.

  पूर्वी महिन्या-दोन महिन्याला घरात कोणाला तरी सर्दी खोकला ताप असायचाच. महिन्यातून एकदा कुणी डॉक्टर कडे गेले नाही असे आठवत नाही परंतु या संपूर्ण महिन्यात साधे डोकेदुखी अंगदुखी, ताप असे कोणालाही आजिबात जाणवले नाही. याचा अर्थ असा आहे की आपण या महिन्याभरात ज्या चार-पाच गोष्टी केल्या त्यामुळे तब्येत लगेच सुधारली. डॉक्टरांची ओपीडी नक्कीच कमी झालेली असणार आहे किंबहुना हा लॉक डाउन बंद झाल्यानंतर देखील महिना-दोन महिने तरी आपण दवाखान्यात जाणार नाही याची मला खात्री वाटते.

    काही उदाहरणे द्यायची झाली तर या कोरोना मुळे वारंवार हात धुणे सुरू झाले सॅनिटायझर आणि मास्क वापरणे तसेच सोशल डिस्टन्सिंग पाळत असल्यामुळे हवेतून पसरणाऱ्या जंतूंपासून लोक दूर राहू लागले आणि त्याचाच परिणाम आजार कमी होण्यात झाला आहे. दुसरे म्हणजे, दररोज सतत काम आणि धावपळीमुळे शारीरिक आणि मानसिक स्वास्थ्य सतत बिघडलेले असायचे. आपल्याला पुरेशी विश्रांती आणि झोप मिळतच नव्हती. एक दिवस जरी ऑफिस बंद करायचे असले तर जीवावर यायचे. आता पूर्ण विश्रांती प्रत्येकाला मिळालेली आहे. तिसरा सगळ्यात महत्त्वाचा मुद्दा म्हणजे ताण- तणाव. आपल्या सगळ्यांना माहीतच आहे की बहुसंख्य आजारांची कारणे ही मानसिक ताणतणावाशी संबंधित असतात. लॉक डाउनच्या काळात लोक कुटुंबीय, मित्र, नातेवाईकांशी फोनवर संवाद साधत आहेत. त्याहीपुढे जाऊन इलेक्ट्रॉनिक माध्यमांचा जास्तीत जास्त वापर होत आहे आणि या संवादामुळे तणावाची पातळी खूपच कमी झालेली जाणवते. त्याशिवाय मी वर नमूद केल्याप्रमाणे हॉटेल तर बंद आहेतच आणि त्यामुळे चमचमीत, मसालेदार, तेलकट पदार्थ विशेषतः नॉनव्हेज, रस्त्यावरील भेळ आणि पाणीपुरी हे न खाता घरचे आरोग्यदायी खाणे सुरू झाले आहे. आता रस्त्यावर वाहने नाहीत, कारखाने बंद आहेत आणि त्यामुळे हवा पाणी आणि आवाजाच्या प्रदूषण निर्माण होणारे आजार थांबले आहेत. शेवटचा पण सगळ्यात महत्त्वाचा मुद्दा म्हणजे सर्व प्रकारच्या व्यसनांवर मर्यादा आली आहे. दारू, गुटका, सिगारेट, पान सुपारी या सर्वांमुळे उद्भवणारे आजार खूप प्रमाणात कमी झाले आहेत. कालच असे वाचनात आले की लॉक डाउन मुळे मृत्यूचे प्रमाण कमी झाल्यामुळे अमरधाम देखील ओस पडली आहेत.

       या सगळ्यातून आपण बरेच काही शिकण्यासारखे आहे लॉक डाउन संपल्यानंतर जरी आपण बाहेर पडलो तरी आपण आधी व्यापार व्यवसायासाठी जे बारा ते सोळा तास काम करत होतो त्याचे योग्य नियोजन करून दहा ते बारा तास काम केले, सकाळी कमीत कमी एक तास व्यायामासाठी दिला, हॉटेल मध्ये खाण्याचे प्रमाण बऱ्यापैकी कमी केले आणि कायमचा मास्कचा वापर केला तसेच संध्याकाळी एकदा घरी आल्यानंतर रात्री आईस्क्रीम आणि मित्रांशी गप्पा मारण्यासाठी बाहेर न पडता जर कुटुंबियांबरोबर बसून कॅरम, पत्ते अगदी सापशिडी आणि ल्युडो सारखे खेळ आपण खेळत बसलो तर आप सर्वांची प्रकृती नक्कीच सुधारेल असा विश्वास वाटतो.
    
`,
  },
  {
    id: 3,
    title: "तुमचा व्हिडिओ ब्लॉग",
    date: "20-Aug-2023",
    image: blog3,
    content: `
 मागील वर्षी मनुष्यबळ मंत्रालयाने दप्तराचे ओझे कमी करण्याच्या नियमावली बरोबरच पहिली आणि दुसरीच्या मुलांना गृहपाठ देता येणार नाही असे जाहीर केले होते. त्यापुढे जाऊन दीड किलोच्यावर दप्तर असणार नाही अशीही घोषणा झाली. गेल्या दशकातील अनेक प्रकारच्या तांत्रिक स्वरूपाचे निर्णय पाहिल्यास त्याचा प्रत्यक्षात फार थोड उपयोग होतो असे लक्षात येते. ज्ञानरचनावाद, डिजीटल शाळा, शाळेचे जादा तास, संगणक, निरनिराळया स्पर्धा, अस्मिता योजना, प्रशिक्षकांचे प्रशिक्षण यासारखे कित्येक मार्ग वेळोवेळी शासनाने अवलंबले आहेत. हे मार्ग वापरु नयेत असे माझे म्हणणे नाही. परंतू अशा साधनांचा वापर करताना आपण अपेक्षित साध्य गाठत आहोत का याचा साकल्याने विचार केला जात नसावा. अमूक एक कृती या शाळांनी करावी अशा प्रकारचे काढलेले आदेश काही महिन्यातच मागे घेतले आहेत. विद्याथ्यांच्या हिताकरीता परिपूर्ण
  विचार करुन काढलेल्या आदेशाबाबतीत गटशिक्षणाधिकारी पासून शिक्षकापर्यंत असमाधानकारक चर्चा का असावी याचा विचार झाला पाहिजे. दप्तराचे वजन कमी करणे, गृहपाठ बंद करणे, पालकांच्या सभा घेणे, व्यवसायभिमुख शिक्षण देणे या सर्व कार्यक्रमांची उद्दिष्टांची हाताळणी आणि त्या सर्वांचे मूल्यमापन या बाबतीत शासन खूपच मागे पडते.
,
  अभ्यास ही सतत चालणारी प्रक्रिया आहे. शाळेचा अभ्यासक्रम आणि घरचा अभ्यास हे मूळ अभ्यासाचे दोन अंग आहेत. सकाळी उठल्यावर दात घासण्यापासून रात्री झोपण्यापूर्वी दात घासण्यापर्यंत या चौदा तासांच्या प्रत्येक मिनीटांगणित प्रत्येक विदयार्थी हा शिकतच असतो. गरज फक्त आहे ती त्या त्या वेळी मुलगा ज्यांच्या ताब्यात आहे त्यांनी लक्ष ठेवण्याची किंवा त्यांना वळण लावण्याची. यामुळे वर नमूद केलेले शासनाने वापरलेले मार्ग किंवा या व्यतिरिक्त पालक आणि खासगी शिकवणीच्या शिक्षकांनी दिलेल्या दिशा यावर मुलांची प्रगती ठरवणे चुकीचे आहे.
  
  सर्वात महत्वाचे म्हणजे आपण कोणत्या वयात काय शिकवतो याचे गणितच बहुतेक पालक व शिक्षकांना माहितच नाही. सरकाराने त्याचे सर्वेक्षण जरूर करावे. मुलांवर आपले विचार बिंबवणे, लादणे आणि मार्कांच्या शर्यतीत त्याला टाकणे या पलीकडे कोणाला काहीच सुचत असल्याचे दिसत नाही. मुलाचे वय, त्याची आकलन शक्ती, घरातील स्थिती, आजुबाजूची परिस्थिती यासारखा बाबींचा विचार करुन मुलांचा सर्वांगीण विकास झाला पाहिजे आणि या विकासाचा तो योग्य वयात झाल्यावर स्वतः साठी, कुटुंबासाठी आणि समाजासाठी उपयोग झाला पाहिजे, तसेच कोणत्याही टप्प्यावर त्याची गोंधळाची स्थिती होता कामा नये, हे आदर्श शिक्षण पद्धतीचे लक्षण आहे.
  
  दुर्दैवाची बाब म्हणजे आज मुलाकडे बघायला कोणालाच वेळ नाही. घरात पाहिले तर आई, बाबा, आजोबा, भावंडे आपापल्या कामात इतके मग्न आहेत की घरातील लहान मुला-मुलींना घडवायचे काम आपलेच आहे याची बकिंचितही जाणीव नाही. शाळेत नाव घातले आणि दोन शिकवण्या जोडून दिल्या की आपली जबाबदारी संपते, या भावनेपलीकडील कोणीही जात नाही. त्याच पध्दतीने शाळेतील शिक्षकांना प्रचंड प्रमाणात शालाबाह्य कामे दिली जातात. वर्षभर रजिस्टर भरुन घेतली जातात, बिनउपयोगी प्रशिक्षणाचा मारा केला जातो आणि अनेक अडीअडचणीच्या तोंडघशी पाडले जाते. शिक्षकांना प्रेरणा आणि प्रोत्साहन सतत दिले असल्याचे कोठेही दिसत नाही. या सर्वाचा परिणाम असा होता की लहान मुले दुर्लक्षित राहतात आणि त्यामुळे त्यांना योग्य दिशा मिळत नाही.
  
  एखादा नवीन उदयोगधंदा सुरू करताना तो उदयोगधंदा सुरू करण्याच्या आधीपासून ते पुढील पंचवीस वर्ष उदयोगाची स्थिती कशी असेल यासाठी प्रकल्प अहवाल तयार केला जातो. नवीन रस्ते अगर धरणे बांधत असताना त्याची किमान १०० वर्ष क्षमता कशी टिकून राहिल याचा परिपूर्ण अभ्यास केला जातो. तर मग मुलाचा पहिली मध्ये प्रवेश घेताना त्याच्या बाबतीत पुढील १५ वर्ष नेमके काय आणि कशा पद्धतीने करावयाचे आहे तसेच त्याच्या इच्छेप्रमाणे योग्य वेळी योग्य तो बदल कसा करायचा याचे नियोजन आपल्याकडे होताना दिसत नाही आणि म्हणूनच उदयोगधंदयाच्या भाषेत बोलायचे झाले तर शाळा कॉलेजमधून बाहेर पडणार 'उत्पादन' हे समाजाच्या दृष्टीने निरुपयोगी ठरत आहे.

`,
  },
];


function BlogCard({ post, onOpen }: { post: any; onOpen: (post: any) => void }) {
  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{post.title}</h2>
        </div>
        <p className="text-gray-500 text-sm">{post.date}</p>
      </CardHeader>
      <CardContent>
        {/* Display multiple images using ImageGallery component */}
        {post.images && post.images.length > 0 ? (
          <ImageGallery
            images={post.images}
            title={post.title}
            className="mb-3"
            showThumbnails={post.images.length > 1}
            maxThumbnails={3}
          />
        ) : post.image ? (
          <ImageGallery
            images={[post.image]}
            title={post.title}
            className="mb-3"
            showThumbnails={false}
          />
        ) : (
          <div className="w-full h-64 md:h-80 lg:h-[400px] bg-gray-200 rounded-lg flex items-center justify-center mb-3">
            <span className="text-gray-500">No images available</span>
          </div>
        )}
        <p className="text-gray-700 mt-3">
          {post.content.slice(0, 200)}...
        </p>
        <button
          onClick={() => onOpen(post)}
          className="mt-2 font-medium hover:underline text-blue-600"
        >
          Read more ▼
        </button>
      </CardContent>
    </Card>
  );
}

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [firebaseBlogs, setFirebaseBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleClose = () => setSelectedPost(null);

  // Fetch blog posts from Firebase
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('OurBlog: Starting blog fetch process...');
        console.log('OurBlog: Firebase config check:', {
          hasDb: !!blogService,
          timestamp: new Date().toISOString()
        });
        
        // Try multiple approaches to get blogs
        let fetchedBlogs = [];
        
        try {
          // First try to get published blogs
          console.log('OurBlog: Attempting to fetch published blogs...');
          fetchedBlogs = await blogService.getPublished();
          console.log('OurBlog: Successfully fetched', fetchedBlogs.length, 'published blogs');
          
          // Log raw data structure for first blog
          if (fetchedBlogs.length > 0) {
            console.log('OurBlog: Sample blog data structure:', {
              firstBlog: fetchedBlogs[0],
              fields: Object.keys(fetchedBlogs[0]),
              imageFields: {
                image: fetchedBlogs[0].image,
                imageUrl: fetchedBlogs[0].imageUrl
              }
            });
          }
        } catch (publishedError) {
          console.error('OurBlog: Error fetching published blogs:', publishedError);
          
          try {
            // Fallback: try to get all blogs and filter client-side
            console.log('OurBlog: Trying to fetch all blogs as fallback...');
            const allBlogs = await blogService.getAll();
            fetchedBlogs = allBlogs.filter((blog: any) => 
              blog.status === 'published' || !blog.status // Include blogs without status field
            );
            console.log('OurBlog: Found', fetchedBlogs.length, 'blogs after client-side filtering');
          } catch (allBlogsError) {
            console.error('OurBlog: Error fetching all blogs:', allBlogsError);
            throw allBlogsError;
          }
        }
        
        const formattedBlogs = fetchedBlogs.map((blog: any) => {
          // Convert Firebase data to match existing blog structure
          const formatDate = (date: any) => {
            if (!date) return 'No date';
            
            let dateObj;
            
            // Handle Firestore timestamp
            if (date.toDate) {
              dateObj = date.toDate();
            }
            // Handle regular date string or Date object
            else if (typeof date === 'string' || date instanceof Date) {
              dateObj = new Date(date);
            }
            else {
              return 'No date';
            }
            
            // Check if date is valid
            if (isNaN(dateObj.getTime())) {
              return 'No date';
            }
            
            // Format date in Date-Month-Year format (e.g., "20-Sep-2024")
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const year = dateObj.getFullYear();
            
            return `${day}-${month}-${year}`;
          };

          // Enhanced image handling with multiple images support
          let images = [];
          let primaryImage = null;
          
          // Handle multiple images array
          if (blog.images && Array.isArray(blog.images)) {
            images = blog.images.filter(img => 
              img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
            );
          }
          
          // Handle single image fields as fallback
          if (images.length === 0) {
            if (blog.imageUrl && typeof blog.imageUrl === 'string' && blog.imageUrl.trim() && blog.imageUrl.startsWith('http')) {
              images = [blog.imageUrl.trim()];
            } else if (blog.image && typeof blog.image === 'string' && blog.image.trim() && blog.image.startsWith('http')) {
              images = [blog.image.trim()];
            }
          }
          
          // Set primary image for backward compatibility
          primaryImage = images.length > 0 ? images[0] : null;
          
          // Debug logging for image issues
          if (blog.id) {
            console.log(`OurBlog: Processing blog "${blog.title}":`, {
              id: blog.id,
              hasValidImages: images.length > 0,
              imagesCount: images.length,
              primaryImage: primaryImage,
              allImages: images,
              rawImageData: blog.image,
              rawImageUrlData: blog.imageUrl,
              rawImagesArray: blog.images,
              allImageFields: {
                image: blog.image,
                imageUrl: blog.imageUrl,
                images: blog.images,
                thumbnail: blog.thumbnail,
                photo: blog.photo,
                picture: blog.picture
              }
            });
          }

          return {
            id: `firebase-${blog.id}`,
            title: blog.title || 'Untitled Blog',
            date: formatDate(blog.publishDate || blog.date || blog.createdAt),
            image: primaryImage, // Keep for backward compatibility
            images: images, // New multiple images array
            content: blog.content || blog.description || blog.excerpt || 'No content available',
            isFromFirebase: true,
            author: blog.author || 'Admin',
            category: blog.category || 'General',
            status: blog.status
          };
        });
        
        setFirebaseBlogs(formattedBlogs);
        setLoading(false);
        console.log('OurBlog: Successfully loaded', formattedBlogs.length, 'blogs from Firebase');
      } catch (error) {
        console.error('OurBlog: Error fetching blogs:', error);
        // Set empty array on error - static blogs will still show
        setFirebaseBlogs([]);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Combine existing blog posts with Firebase blogs
  const allBlogs = [...staticBlogPosts, ...firebaseBlogs];

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-3.5" style={{ paddingTop: '65px' }}>
        <h1 className="text-3xl font-bold mb-8 text-center">Our Blog</h1>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading additional blogs...</span>
          </div>
        )}

        
        <div className="grid gap-6 md:grid-cols-2">
          {allBlogs.map((post) => (
            <BlogCard key={post.id} post={post} onOpen={setSelectedPost} />
          ))}
        </div>

      </div>

      {/* Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ×
            </button>
            {/* Display multiple images in modal */}
            {selectedPost.images && selectedPost.images.length > 0 ? (
              <ImageGallery
                images={selectedPost.images}
                title={selectedPost.title}
                className="mb-4"
                showThumbnails={selectedPost.images.length > 1}
                maxThumbnails={5}
              />
            ) : selectedPost.image ? (
              <ImageGallery
                images={[selectedPost.image]}
                title={selectedPost.title}
                className="mb-4"
                showThumbnails={false}
              />
            ) : null}
            <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>
            <p className="text-gray-500 mb-4">{selectedPost.date}</p>
            <p className="text-gray-700 whitespace-pre-line">{selectedPost.content}</p>
          </div>
        </div>
      )}
      
    </Layout>
  );
}
