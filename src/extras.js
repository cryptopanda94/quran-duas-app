(function(){
const {AR,EN,UR,META,esc,setHeader,store,toast,app,$,ARX,BISMX,endMark,readbar,S,dfavBtn,icon}=window.Q;
const DU=JSON.parse(document.getElementById('ddata').textContent);
const CI=JSON.parse(document.getElementById('cdata').textContent);
const icons={
  bell:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  belloff:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8M10 20a2 2 0 0 0 4 0M4 4l16 16"/></svg>'
};
function noJump(){$('jumpBtn').style.display='none'}

/* ================= DUAS ================= */
const LIST=[
  {id:'ayat-kursi',name:'Ayat ul Kursi',ur:'آیت الکرسی',sub:'Al-Baqarah 2:255–257',mark:'آ',grp:'d'},
  {id:'dua-e-ahad',user:'ahad',grp:'d',sub:'Covenant with Imam al-Mahdi (a.t.f.s.) · every morning',mark:'ع'},
  {id:'dua-kumayl',user:'kumayl',grp:'d',sub:'Taught by Imam Ali (a.s.) · Thursday nights',mark:'ک'},
  {id:'dua-tawassul',key:'E24',grp:'d',sub:'Recited especially on Tuesday nights',mark:'ت'},
  {id:'dua-nudba',key:'E34',grp:'d',sub:'Friday mornings & Eids',mark:'ن'},
  {id:'dua-faraj',user:'faraj-ilahi',grp:'d',sub:'Taught by Imam al-Mahdi (a.t.f.s.) · for relief',mark:'ف'},
  {id:'dua-imam-zamana',user:'faraj-kun',grp:'d',sub:'For Imam al-Mahdi (a.t.f.s.) · after every prayer',mark:'ف'},
  {id:'hadees-kisa',user:'kisa',grp:'d',sub:'Narrated by Bibi Fatima (s.a.)',mark:'ح'},
  {id:'dua-mujeer',user:'mujeer',grp:'d',sub:'13th–15th Ramadan · for forgiveness & relief',mark:'م'},
  {id:'dua-alqamah',key:'N_alqama',grp:'d',sub:'Recited after Ziyarat Ashura',mark:'ع'},
  {id:'duas-qunoot',key:'N_qunoot-quran',grp:'d',sub:'Quranic duas, Imam Husain (a.s.) & Witr qunoot',mark:'ق'},
  {id:'dua-safar-sakhkhara',key:'N_safar-sakhkhara',grp:'d',sub:'When getting into a car, plane or any ride · Quran 43:13–14',mark:'س'},
  {id:'dua-safar',key:'N_dua-safar',grp:'d',sub:'Travel duas: setting out, boarding, arriving, returning',mark:'س'},
  {id:'munajat-safar',key:'N_munajat-safar',grp:'d',sub:'Imam Muhammad Taqi (a.s.) · before a journey',mark:'م'},
  {id:'duas-leaving-home',key:'N_leaving-home',grp:'d',sub:'Eight duas from Baqiyat al-Salihat',mark:'گ'},
  {id:'taqibaat-general',key:'T_taqibaat_general',grp:'t',sub:'After every obligatory prayer',mark:'ت'},
  {id:'taqibaat-fajr-1',key:'T_taqibaat_fajr_1',grp:'t',sub:'After the Fajr prayer',mark:'ت'},
  {id:'taqibaat-fajr-2',key:'T_taqibaat_fajr_2',grp:'t',sub:'After the Fajr prayer',mark:'ت'},
  {id:'nafilah-fajr',key:'T_nafilah_fajr',grp:'t',sub:'With the Nafilah of Fajr',mark:'ت'},
  {id:'taqibaat-zuhr',key:'T_taqibaat_zuhr',grp:'t',sub:'After the Zuhr prayer',mark:'ت'},
  {id:'nafilah-zuhr',key:'T_nafilah_zuhr',grp:'t',sub:'With the Nafilah of Zuhr',mark:'ت'},
  {id:'taqibaat-asr',key:'T_taqibaat_asr',grp:'t',sub:'After the Asr prayer',mark:'ت'},
  {id:'taqibaat-maghrib',key:'T_taqibaat_maghrib',grp:'t',sub:'After the Maghrib prayer',mark:'ت'},
  {id:'taqibaat-isha',key:'T_taqibaat_isha',grp:'t',sub:'After the Isha prayer',mark:'ت'},
  {id:'dua-ya-sabab',key:'T_dua_ya_sabab',grp:'t',sub:'After every prayer · for lawful sustenance',mark:'ت'},
  {id:'every-faraj',user:'faraj-ilahi',grp:'e',sub:'Dua for relief · Ilahi azuma al-bala',mark:'ف'},
  {id:'every-ahad',user:'ahad',grp:'e',sub:'Covenant with Imam al-Mahdi (a.t.f.s.) · every morning',mark:'ع'},
  {id:'asma-ul-husna',key:'N_names-99',grp:'h',sub:'99 Names of Allah with meanings & benefits',mark:'ا'},
  {id:'dua-sahar',key:'N_sahar',grp:'d',sub:'Ramadan · at the time of Sahar',mark:'س'},
  {id:'dua-baha',key:'N_baha',grp:'d',sub:'Ramadan · Sahar (Dua al-Baha)',mark:'ب'},
  {id:'dua-adeela',key:'N_adeela',grp:'d',sub:'Declaration of beliefs · at the time of death',mark:'ع'},
  {id:'dua-hazeen',key:'N_hazeen',grp:'d',sub:'After Namaz-e-Tahajjud',mark:'ح'},
  {id:'dua-yastasheer',key:'N_yastasheer',grp:'d',sub:'Taught by the Holy Prophet (s.a.w.a.) to Imam Ali (a.s.)',mark:'ی'},
  {id:'dua-hifz-e-iman',key:'N_hifz-iman',grp:'d',sub:'For safeguarding faith',mark:'ح'},
  {id:'dua-simat',key:'N_simat',grp:'d',sub:'Friday evening · last hour of Friday',mark:'س'},
  {id:'dua-mashlool',key:'N_mashlool',grp:'d',sub:'Taught by Imam Ali (a.s.) · contains Ism-e-Azam',mark:'م'},
  {id:'dua-sabah',key:'N_sabah',grp:'d',sub:'Imam Ali (a.s.) · every morning',mark:'ص'},
  {id:'dua-jawshan-kabeer',key:'N_jawshan-kabeer',grp:'d',sub:'1000 Names of Allah · Nights of Qadr',mark:'ج'},
  {id:'dua-jawshan-sagheer',key:'N_jawshan-sagheer',grp:'d',sub:'Imam Musa Kazim (a.s.) · in difficulty',mark:'ج'},
  {id:'dua-noor',key:'N_noor',grp:'d',sub:'Taught to Bibi Fatima (s.a.) · for healing',mark:'ن'},
  {id:'dua-sad-subhan',key:'N_sad-subhan',grp:'d',sub:'One hundred tasbeehs',mark:'ص'},
  {id:'dua-sanami-quraish',key:'N_sanami-quraish',grp:'d',sub:'Taught by Imam Ali (a.s.)',mark:'ص'},
  {id:'dua-muqatil',key:'N_muqatil',grp:'d',sub:'For the fulfilment of needs',mark:'م'},
  {id:'dua-imam-husain-ashura',key:'N_ashura-husain',grp:'d',sub:'Dua of Imam Husain (a.s.) on the day of Ashura',mark:'ح'},
  {id:'dua-unity',key:'N_unity',grp:'d',sub:'After every obligatory prayer · Dua al-Wahda',mark:'و'},
  {id:'ziyarat-arbaeen',key:'Z_arbaeen',grp:'z',sub:'20th Safar · Imam Husain (a.s.)',mark:'ا'},
  {id:'ziyarat-ashura',key:'G4',grp:'z',sub:'Ziyarat of Imam Husain (a.s.)',mark:'ع'},
  {id:'ziyarat-waritha',user:'waritha',grp:'z',sub:'With Ali Akbar, Shuhada, Abbas, Imam Reza & Imam Zamana (a.s.)',mark:'و'},
  {id:'ziyarat-warith',key:'G6',grp:'z',sub:'Mafatih al-Jinan text, line-by-line Urdu',mark:'و'},
  {id:'ziyarat-aale-yasin',key:'Z_aale_yasin',grp:'z',sub:'Imam al-Mahdi (a.s.), line-by-line Urdu',mark:'ي'},
  {id:'ziyarat-hadi',key:'Z_hadi',grp:'z',sub:'Imam Ali al-Hadi (a.s.) · Samarra',mark:'ه'},
  {id:'ziyarat-askari',key:'Z_askari',grp:'z',sub:'Imam Hasan al-Askari (a.s.) · Samarra',mark:'ع'},
  {id:'ziyarat-hadi-askari',key:'Z_hadi_askari',grp:'z',sub:'Samarra · Imam al-Hadi & Imam al-Askari (a.s.)',mark:'س'},
  {id:'ziyarat-mahdi-fajr',key:'Z_mahdi_fajr',grp:'z',sub:'Imam al-Mahdi (a.t.f.s.) · after Fajr',mark:'ف'},
  {id:'ziyarat-jawad-2',key:'Z_jawad_2',grp:'z',sub:'Imam Muhammad al-Jawad (a.s.) · second form',mark:'ج'},
  {id:'ziyarat-jawad-3',key:'Z_jawad_3',grp:'z',sub:'Imam Muhammad al-Jawad (a.s.) · Saduq\'s form',mark:'ج'},
  {id:'ziyarat-kazim-2',key:'Z_kazim_2',grp:'z',sub:'Imam Musa al-Kazim (a.s.) · second form',mark:'م'},
  {id:'ziyarat-jawad',key:'Z_jawad_1',grp:'z',sub:'Imam Muhammad al-Jawad (a.s.) · Kazimayn',mark:'ج'},
  {id:'ziyarat-kazim',key:'Z_kazim',grp:'z',sub:'Imam Musa al-Kazim (a.s.) · Kazimayn',mark:'م'},
  {id:'ziyarat-kazim-jawad',key:'Z_kazim_jawad',grp:'z',sub:'Imam al-Kazim & Imam al-Jawad (a.s.)',mark:'ك'},
  {id:'ziyarat-narjis',key:'Z_narjis',grp:'z',sub:'Mother of Imam al-Mahdi (a.t.f.s.) · Samarra',mark:'ن'},
  {id:'ziyarat-abd-azim',key:'Z_abd_azim',grp:'z',sub:'Shah Abd al-Azim al-Hasani (a.s.) · Rayy',mark:'ع'},
  {id:'salawat-prophet',key:'Z_salawat_prophet',grp:'z',sub:'Salawat upon the Holy Prophet (s.a.w.)',mark:'ص'},
  {id:'salawat-ali',key:'Z_salawat_ali',grp:'z',sub:'Salawat upon the Commander of the Faithful (a.s.)',mark:'ع'},
  {id:'salawat-fatima',key:'Z_salawat_fatima',grp:'z',sub:'Salawat upon Lady Fatima al-Zahra (s.a.)',mark:'ف'},
  {id:'salawat-hasan-husayn',key:'Z_salawat_hh',grp:'z',sub:'Salawat upon Imam Hasan and Imam Husayn (a.s.)',mark:'ح'},
  {id:'salawat-kazim',key:'Z_salawat_kazim',grp:'z',sub:'Salawat upon Imam al-Kazim (a.s.)',mark:'ك'},
  {id:'salawat-jawad',key:'Z_salawat_jawad',grp:'z',sub:'Salawat upon Imam al-Jawad (a.s.)',mark:'ج'},
  {id:'salawat-imams',key:'Z_salawat_imams',grp:'z',sub:'Salawat upon each Imam (a.s.) · Mafatih',mark:'ص'},
  {id:'salawat-mahdi',key:'Z_salawat_mahdi',grp:'z',sub:'Salawat upon Imam al-Mahdi (a.t.f.s.)',mark:'ص'},
  {id:'ziyarat-hakimah',key:'Z_hakimah',grp:'z',sub:'Daughter of Imam al-Jawad (a.s.) · Samarra',mark:'ح'},
  {id:'ziyarat-nahiya',key:'Z_nahiya',grp:'z',sub:'Ziyarat of Imam Husain (a.s.) by Imam al-Mahdi (a.t.f.s.)',mark:'ن'},
  
  {id:'ziyarat-jamia-sagheera',key:'Z_jamia_saghira',grp:'z',sub:'Short ziyarat for all the Imams (a.s.)',mark:'ج'},
  {id:'ziyarat-jamia-kabeera',key:'Z_jamia_kabira',grp:'z',sub:'Taught by Imam Ali al-Naqi (a.s.) · for all Imams',mark:'ج'},
  {id:'ziyarat-comprehensive-1',key:'Z_jamia_1',grp:'z',sub:'Especially on the Day of Arafah · at any shrine',mark:'ج'},
  {id:'ziyarat-aminullah',key:'N_aminullah',grp:'z',sub:'Ziyarat of Imam Ali (a.s.) by Imam Zainul Abideen (a.s.) · at any shrine',mark:'ا'},
  {id:'ziyarat-comprehensive-3',key:'Z_rajabiya',grp:'z',sub:'Can be recited at any shrine',mark:'ر'},
  {id:'ziyarat-jamia-aimma',user:'jamia-aimma',grp:'z',sub:'Comprehensive ziyarat for all the Imams (a.s.)',mark:'ج'},
  {id:'ziyarat-masuma',key:'Z_masuma',grp:'z',sub:'Qom',mark:'م'},
  {id:'sahifa-1',key:'S_1',grp:'s',sec:'Supplications',secUr:'دعائیں',sub:'Dua 1 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-2',key:'S_2',grp:'s',sub:'Dua 2 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-3',key:'S_3',grp:'s',sub:'Dua 3 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-4',key:'S_4',grp:'s',sub:'Dua 4 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-5',key:'S_5',grp:'s',sub:'Dua 5 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-6',key:'S_6',grp:'s',sub:'Dua 6 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-7',key:'S_7',grp:'s',sub:'Dua 7 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-8',key:'S_8',grp:'s',sub:'Dua 8 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-9',key:'S_9',grp:'s',sub:'Dua 9 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-10',key:'S_10',grp:'s',sub:'Dua 10 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-11',key:'S_11',grp:'s',sub:'Dua 11 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-12',key:'S_12',grp:'s',sub:'Dua 12 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-13',key:'S_13',grp:'s',sub:'Dua 13 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-14',key:'S_14',grp:'s',sub:'Dua 14 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-15',key:'S_15',grp:'s',sub:'Dua 15 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-16',key:'S_16',grp:'s',sub:'Dua 16 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-17',key:'S_17',grp:'s',sub:'Dua 17 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-18',key:'S_18',grp:'s',sub:'Dua 18 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-19',key:'S_19',grp:'s',sub:'Dua 19 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-20',key:'S_20',grp:'s',sub:'Dua 20 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-21',key:'S_21',grp:'s',sub:'Dua 21 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-22',key:'S_22',grp:'s',sub:'Dua 22 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-23',key:'S_23',grp:'s',sub:'Dua 23 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-24',key:'S_24',grp:'s',sub:'Dua 24 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-25',key:'S_25',grp:'s',sub:'Dua 25 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-26',key:'S_26',grp:'s',sub:'Dua 26 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-27',key:'S_27',grp:'s',sub:'Dua 27 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-28',key:'S_28',grp:'s',sub:'Dua 28 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-29',key:'S_29',grp:'s',sub:'Dua 29 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-30',key:'S_30',grp:'s',sub:'Dua 30 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-31',key:'S_31',grp:'s',sub:'Dua 31 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-32',key:'S_32',grp:'s',sub:'Dua 32 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-33',key:'S_33',grp:'s',sub:'Dua 33 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-34',key:'S_34',grp:'s',sub:'Dua 34 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-35',key:'S_35',grp:'s',sub:'Dua 35 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-36',key:'S_36',grp:'s',sub:'Dua 36 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-37',key:'S_37',grp:'s',sub:'Dua 37 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-38',key:'S_38',grp:'s',sub:'Dua 38 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-39',key:'S_39',grp:'s',sub:'Dua 39 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-40',key:'S_40',grp:'s',sub:'Dua 40 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-41',key:'S_41',grp:'s',sub:'Dua 41 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-42',key:'S_42',grp:'s',sub:'Dua 42 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-43',key:'S_43',grp:'s',sub:'Dua 43 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-44',key:'S_44',grp:'s',sub:'Dua 44 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-45',key:'S_45',grp:'s',sub:'Dua 45 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-46',key:'S_46',grp:'s',sub:'Dua 46 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-47',key:'S_47',grp:'s',sub:'Dua 47 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-48',key:'S_48',grp:'s',sub:'Dua 48 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-49',key:'S_49',grp:'s',sub:'Dua 49 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-50',key:'S_50',grp:'s',sub:'Dua 50 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-51',key:'S_51',grp:'s',sub:'Dua 51 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-52',key:'S_52',grp:'s',sub:'Dua 52 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-53',key:'S_53',grp:'s',sub:'Dua 53 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-54',key:'S_54',grp:'s',sub:'Dua 54 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-55',key:'S_55',grp:'s',sub:'Dua 55 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-56',key:'S_56',grp:'s',sub:'Dua 56 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-57',key:'S_57',grp:'s',sub:'Dua 57 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-58',key:'S_58',grp:'s',sub:'Dua 58 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-59',key:'S_59',grp:'s',sub:'Dua 59 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-60',key:'S_60',grp:'s',sub:'Dua 60 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-61',key:'S_61',grp:'s',sub:'Dua 61 · Imam Zainul Abideen (a.s.)',mark:'ص'},
  {id:'sahifa-sunday',key:'S_D1',grp:'s',sec:'Supplications for the Days of the Week',secUr:'ایامِ ہفتہ کی دعائیں',sub:'Sunday · Imam Zainul Abideen (a.s.)',mark:'ا'},
  {id:'sahifa-monday',key:'S_D2',grp:'s',sub:'Monday · Imam Zainul Abideen (a.s.)',mark:'پ'},
  {id:'sahifa-tuesday',key:'S_D3',grp:'s',sub:'Tuesday · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-wednesday',key:'S_D4',grp:'s',sub:'Wednesday · Imam Zainul Abideen (a.s.)',mark:'ب'},
  {id:'sahifa-thursday',key:'S_D5',grp:'s',sub:'Thursday · Imam Zainul Abideen (a.s.)',mark:'ج'},
  {id:'sahifa-friday',key:'S_D6',grp:'s',sub:'Friday · Imam Zainul Abideen (a.s.)',mark:'ج'},
  {id:'sahifa-saturday',key:'S_D7',grp:'s',sub:'Saturday · Imam Zainul Abideen (a.s.)',mark:'ہ'},
  {id:'sahifa-m1',key:'S_M1',grp:'s',sec:'Fifteen Whispered Prayers',secUr:'مناجاتِ خمسہ عشر',sub:'Munajat 1 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m2',key:'S_M2',grp:'s',sub:'Munajat 2 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m3',key:'S_M3',grp:'s',sub:'Munajat 3 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m4',key:'S_M4',grp:'s',sub:'Munajat 4 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m5',key:'S_M5',grp:'s',sub:'Munajat 5 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m6',key:'S_M6',grp:'s',sub:'Munajat 6 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m7',key:'S_M7',grp:'s',sub:'Munajat 7 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m8',key:'S_M8',grp:'s',sub:'Munajat 8 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m9',key:'S_M9',grp:'s',sub:'Munajat 9 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m10',key:'S_M10',grp:'s',sub:'Munajat 10 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m11',key:'S_M11',grp:'s',sub:'Munajat 11 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m12',key:'S_M12',grp:'s',sub:'Munajat 12 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m13',key:'S_M13',grp:'s',sub:'Munajat 13 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m14',key:'S_M14',grp:'s',sub:'Munajat 14 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'sahifa-m15',key:'S_M15',grp:'s',sub:'Munajat 15 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-ali-kufa',key:'M_munajat_ali',grp:'m',sec:'Munajaat of Imam Ali (a.s.)',secUr:'مناجاتِ امام علیؑ',sub:'Masjid Kufa · Mawlaya ya Mawlaya',mark:'م'},
  {id:'munajat-manzoom',key:'M_munajat_manzoom',grp:'m',sub:'In verse · Imam Ali (a.s.)',mark:'م'},
  {id:'munajat-m1',key:'S_M1',grp:'m',sec:'Fifteen Whispered Prayers',secUr:'مناجاتِ خمسہ عشر',sub:'Munajat 1 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m2',key:'S_M2',grp:'m',sub:'Munajat 2 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m3',key:'S_M3',grp:'m',sub:'Munajat 3 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m4',key:'S_M4',grp:'m',sub:'Munajat 4 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m5',key:'S_M5',grp:'m',sub:'Munajat 5 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m6',key:'S_M6',grp:'m',sub:'Munajat 6 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m7',key:'S_M7',grp:'m',sub:'Munajat 7 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m8',key:'S_M8',grp:'m',sub:'Munajat 8 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m9',key:'S_M9',grp:'m',sub:'Munajat 9 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m10',key:'S_M10',grp:'m',sub:'Munajat 10 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m11',key:'S_M11',grp:'m',sub:'Munajat 11 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m12',key:'S_M12',grp:'m',sub:'Munajat 12 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m13',key:'S_M13',grp:'m',sub:'Munajat 13 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m14',key:'S_M14',grp:'m',sub:'Munajat 14 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'munajat-m15',key:'S_M15',grp:'m',sub:'Munajat 15 · Imam Zainul Abideen (a.s.)',mark:'م'},
  {id:'aamal-r1',key:'A_R1',grp:'a',sec:'Muharram',secUr:'محرم',sub:'Muharram · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-r4',key:'A_R4',grp:'a',sec:'Muharram',secUr:'محرم',sub:'Muharram · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-r6',key:'A_R6',grp:'a',sec:'Muharram',secUr:'محرم',sub:'Muharram · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-r7',key:'A_R7',grp:'a',sec:'Muharram',secUr:'محرم',sub:'Muharram · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-r9',key:'A_R9',grp:'a',sec:'Muharram',secUr:'محرم',sub:'Muharram · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-s1',key:'A_S1',grp:'a',sec:'Safar',secUr:'صفر',sub:'Safar · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-s5',key:'A_S5',grp:'a',sec:'Safar',secUr:'صفر',sub:'Safar · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-t2',key:'A_T2',grp:'a',sec:'Rabi al-Awwal',secUr:'ربیع الاول',sub:'Rabi al-Awwal · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-w1',key:'A_W1',grp:'a',sec:'Jumada al-Akhirah',secUr:'جمادی الثانی',sub:'Jumada al-Akhirah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-w2',key:'A_W2',grp:'a',sec:'Jumada al-Akhirah',secUr:'جمادی الثانی',sub:'Jumada al-Akhirah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-w3',key:'A_W3',grp:'a',sec:'Jumada al-Akhirah',secUr:'جمادی الثانی',sub:'Jumada al-Akhirah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x1',key:'A_X1',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x2',key:'A_X2',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x3',key:'A_X3',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x4',key:'A_X4',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x5',key:'A_X5',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x6',key:'A_X6',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x7',key:'A_X7',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x10',key:'A_X10',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x11',key:'A_X11',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x13',key:'A_X13',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x14',key:'A_X14',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-x15',key:'A_X15',grp:'a',sec:'Rajab',secUr:'رجب',sub:'Rajab · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y1',key:'A_Y1',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y2',key:'A_Y2',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y3',key:'A_Y3',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y4',key:'A_Y4',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y5',key:'A_Y5',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y6',key:'A_Y6',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y7',key:'A_Y7',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y9',key:'A_Y9',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y10',key:'A_Y10',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-y11',key:'A_Y11',grp:'a',sec:'Shaban',secUr:'شعبان',sub:'Shaban · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa1',key:'A_AA1',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa2',key:'A_AA2',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa3',key:'A_AA3',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa4',key:'A_AA4',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa5',key:'A_AA5',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa9',key:'A_AA9',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa10',key:'A_AA10',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa11',key:'A_AA11',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa12',key:'A_AA12',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa13',key:'A_AA13',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa14',key:'A_AA14',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa15',key:'A_AA15',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa16',key:'A_AA16',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa17',key:'A_AA17',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa18',key:'A_AA18',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa19',key:'A_AA19',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa20',key:'A_AA20',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa21',key:'A_AA21',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa22',key:'A_AA22',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa23',key:'A_AA23',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa25',key:'A_AA25',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa26',key:'A_AA26',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa27',key:'A_AA27',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa29',key:'A_AA29',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa30',key:'A_AA30',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa31',key:'A_AA31',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa32',key:'A_AA32',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa33',key:'A_AA33',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa34',key:'A_AA34',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa35',key:'A_AA35',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa37',key:'A_AA37',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa38',key:'A_AA38',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa39',key:'A_AA39',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa40',key:'A_AA40',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa43',key:'A_AA43',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa46',key:'A_AA46',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa47',key:'A_AA47',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa48',key:'A_AA48',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-aa49',key:'A_AA49',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-zall',key:'A_Zall',grp:'a',sec:'Ramadan',secUr:'رمضان',sub:'Ramadan · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ad2',key:'A_AD2',grp:'a',sec:'Shawwal',secUr:'شوال',sub:'Shawwal · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ad3',key:'A_AD3',grp:'a',sec:'Shawwal',secUr:'شوال',sub:'Shawwal · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ad4',key:'A_AD4',grp:'a',sec:'Shawwal',secUr:'شوال',sub:'Shawwal · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ab1',key:'A_AB1',grp:'a',sec:'Dhul Qadah',secUr:'ذی القعدہ',sub:'Dhul Qadah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ab2',key:'A_AB2',grp:'a',sec:'Dhul Qadah',secUr:'ذی القعدہ',sub:'Dhul Qadah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ab3',key:'A_AB3',grp:'a',sec:'Dhul Qadah',secUr:'ذی القعدہ',sub:'Dhul Qadah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac1',key:'A_AC1',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac2',key:'A_AC2',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac3',key:'A_AC3',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac5',key:'A_AC5',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac6',key:'A_AC6',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac7',key:'A_AC7',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac10',key:'A_AC10',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac11',key:'A_AC11',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac12',key:'A_AC12',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac13',key:'A_AC13',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac14',key:'A_AC14',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac15',key:'A_AC15',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac17',key:'A_AC17',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac18',key:'A_AC18',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac20',key:'A_AC20',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac21',key:'A_AC21',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac22',key:'A_AC22',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-ac23',key:'A_AC23',grp:'a',sec:'Dhul Hijjah',secUr:'ذی الحجہ',sub:'Dhul Hijjah · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j1',key:'A_J1',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j3',key:'A_J3',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j4',key:'A_J4',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j6',key:'A_J6',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j7',key:'A_J7',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j8',key:'A_J8',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-j9',key:'A_J9',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-p1',key:'A_P1',grp:'a',sec:'Friday (Jumu‘ah)',secUr:'جمعہ',sub:'Friday (Jumu‘ah) · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-c15',key:'A_C15',grp:'a',sec:'Every Month',secUr:'ہر مہینہ',sub:'Every Month · Mafatih al-Jinan',mark:'ع'},
  {id:'aamal-c16',key:'A_C16',grp:'a',sec:'Every Month',secUr:'ہر مہینہ',sub:'Every Month · Mafatih al-Jinan',mark:'ع'},
  {id:'namaz-merits-shab',key:'NM_merits-shab',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Virtues of the night prayer',mark:'ف'},
  {id:'namaz-namaz-e-shab',key:'NM_F2',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Night prayer · 11 rak‘ahs',mark:'ن'},
  {id:'namaz-namaz-e-shab-short',key:'NM_F3',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Short form of the night prayer',mark:'ن'},
  {id:'namaz-namaz-e-aayaat',key:'NM_F4',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'For eclipses, earthquakes & frightening events',mark:'ن'},
  {id:'namaz-namaz-e-ghufaylah',key:'NM_F5',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Between Maghrib and Isha',mark:'ن'},
  {id:'namaz-namaz-e-kamilah',key:'NM_F6',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Friday · before noon',mark:'ن'},
  {id:'namaz-namaz-e-mayyat',key:'NM_F7',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Funeral prayer',mark:'ن'},
  {id:'namaz-namaz-e-nawafil',key:'NM_F8',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Daily recommended prayers',mark:'ن'},
  {id:'namaz-namaz-e-wahshat',key:'NM_F9',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Namaz for the Night of Burial',mark:'ن'},
  {id:'namaz-namaz-e-maghfirat-e-waledain',key:'NM_F10',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Forgiveness for parents',mark:'ن'},
  {id:'namaz-namaz-of-jafar-e-tayyar',key:'NM_F11',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Salat al-Tasbih',mark:'ن'},
  {id:'namaz-eid-prayer',key:'NM_AD4',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'Eid al-Fitr & Eid al-Adha',mark:'ن'},
  {id:'namaz-bedouin',key:'NM_N19',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'',mark:'ن'},
  {id:'namaz-days-of-week',key:'NM_N20',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'',mark:'ن'},
  {id:'namaz-travel',key:'NM_N14',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'',mark:'ن'},
  {id:'dua-seeing-non-muslim',key:'NM_N9',grp:'n',sec:'Daily & Special Namaz',secUr:'روزمرہ اور خاص نمازیں',sub:'',mark:'ن'},
  {id:'namaz-hadiyah-masoomeen',key:'NM_F12',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'Gift prayer for the 14 Masoomeen',mark:'ن'},
  {id:'namaz-holy-prophet',key:'NM_F13',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'2 rak‘ahs',mark:'ن'},
  {id:'namaz-lady-fatimah',key:'NM_F14',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'Three forms',mark:'ن'},
  {id:'namaz-imam-ali',key:'NM_F15',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'1st Imam',mark:'ن'},
  {id:'namaz-imam-hasan',key:'NM_F16',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'2nd Imam',mark:'ن'},
  {id:'namaz-imam-husain',key:'NM_F17',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'3rd Imam',mark:'ن'},
  {id:'namaz-imam-sajjad',key:'NM_F18',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'4th Imam',mark:'ن'},
  {id:'namaz-imam-baqir',key:'NM_F19',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'5th Imam',mark:'ن'},
  {id:'namaz-imam-sadiq',key:'NM_F20',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'6th Imam',mark:'ن'},
  {id:'namaz-namaz-of-imam-musa-kazim-a-s',key:'NM_F21',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'7th Imam',mark:'ن'},
  {id:'namaz-imam-reza',key:'NM_F22',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'8th Imam',mark:'ن'},
  {id:'namaz-imam-taqi',key:'NM_F23',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'9th Imam',mark:'ن'},
  {id:'namaz-imam-naqi',key:'NM_F24',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'10th Imam',mark:'ن'},
  {id:'namaz-imam-askari',key:'NM_F25',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'11th Imam',mark:'ن'},
  {id:'namaz-namaz-of-imam-mahdi-a-t-f-s',key:'NM_F26',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'12th Imam',mark:'ن'},
  {id:'namaz-namaz-of-imam-mahdi-a-t-f-s-at-masjid-jamkaran',key:'NM_F41',grp:'n',sec:'Namaz of the Masoomeen (a.s.)',secUr:'نماز ہائے معصومین علیہم السلام',sub:'12th Imam · Masjid Jamkaran, Qom',mark:'ن'},
  {id:'namaz-namaz-for-forgiveness',key:'NM_F45',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-for-gaining-intelligence-and-good-memory',key:'NM_F46',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-for-seeking-divine-help',key:'NM_F47',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-for-settling-needs',key:'NM_F50',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-for-settling-urgent-needs',key:'NM_F53',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-for-solving-difficulties',key:'NM_F54',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-of-pardon',key:'NM_F60',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-of-the-hungry',key:'NM_F61',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-namaz-of-will',key:'NM_F62',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'Between Maghrib and Isha',mark:'ن'},
  {id:'namaz-namaz-on-friday-nights-the-night-of-eid-al-adha-for-fulfilment-of-needs',key:'NM_F63',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-needs-1',key:'NM_N1',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-needs-2',key:'NM_N2',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-needs-3',key:'NM_N3',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-needs-4',key:'NM_N4',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-needs-5',key:'NM_N5',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-sustenance',key:'NM_N6',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-sustenance-2',key:'NM_N7',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-debts',key:'NM_N13',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-fear-oppressors',key:'NM_N8',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-whisperings',key:'NM_N10',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-help-fatimah',key:'NM_N11',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'namaz-help-prophet-ali',key:'NM_N12',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'dhikr-difficulties',key:'NM_N18',grp:'n',sec:'Namaz for Needs & Forgiveness',secUr:'حاجات اور مغفرت کی نمازیں',sub:'',mark:'ن'},
  {id:'hijab-imam-sadiq',key:'NM_N17',grp:'n',sec:'Protective Duas of the Imams (Hijab)',secUr:'ائمہؑ کی حفاظتی دعائیں (حجاب)',sub:'',mark:'ن'},
  {id:'hijab-imam-kazim',key:'NM_N15',grp:'n',sec:'Protective Duas of the Imams (Hijab)',secUr:'ائمہؑ کی حفاظتی دعائیں (حجاب)',sub:'',mark:'ن'},
  {id:'hijab-imam-taqi',key:'NM_N16',grp:'n',sec:'Protective Duas of the Imams (Hijab)',secUr:'ائمہؑ کی حفاظتی دعائیں (حجاب)',sub:'',mark:'ن'},
];
const UD=JSON.parse(document.getElementById('udata').textContent);
LIST.forEach(d=>{if(d.key){d.name=DU[d.key].name;d.ur=DU[d.key].nameUr}if(d.user){d.name=UD[d.user].name;d.ur=UD[d.user].nameUr}});
LIST.find(x=>x.id==='ziyarat-warith').name='Ziyarat Warith (Mafatih)';
let dTab=store.get('dTab','d'), dQ='', dSec='';
function duaSpot(){const n=new Date(),day=n.getDay(),hr=n.getHours();
  const pick=(day===4&&hr>=16)||(day===5&&hr<5)?['dua-kumayl','Recommended tonight · Thursday night']
    :day===2?['dua-tawassul','Recommended today · Tuesday']
    :day===5?['dua-nudba','Recommended today · Friday']
    :hr<12?['dua-e-ahad','Recommended this morning']:['ziyarat-ashura','Recommended today'];
  const d=LIST.find(x=>x.id===pick[0]);if(!d)return'';
  return `<a class="continue dspot" href="#dua-${d.id}"><div class="t2"><small>${pick[1]}</small><b>${esc(d.name)}</b></div><div class="dsu">${d.ur}</div>${icon.arrow}</a>`}
const DTABS=[['e','Every Day'],['t','Taqibaat'],['n','Namaz'],['d','Duas'],['z','Ziyarat'],['a','Aamaal'],['m','Munajaat'],['s','Sahifa'],['h','99 Names']];
const DCAT={e:['Every Day Recitations','روزانہ کے اعمال','Duas to read every day','ر'],t:['Taqibaat e Namaz','تعقیباتِ نماز','Duas and dhikr after each prayer','ت'],d:['Duas','دعائیں','Daily, weekly & special supplications','د'],z:['Ziyarat','زیارات','Salutations to the Prophet & Ahlul Bayt','ز'],s:['Sahifa Sajjadiya','صحیفۂ سجادیہ','Imam Zainul Abideen (a.s.) · 61 duas, 7 days, 15 munajat','ص'],a:['Aamaal','اعمال','Deeds for special days & nights','ع'],m:['Munajaat','مناجات','Whispered prayers of Imam Ali & Imam Sajjad (a.s.)','م'],n:['Namaz','نماز','Prayers, taqibaat & qunoot','ن'],h:['99 Names','اسمائے حسنیٰ','Names of Allah with meanings & benefits','ا'],r:['AI Research Notebooks','تحقیقی نوٹ بُکس','ShiaLM on Google NotebookLM · ask questions of classical books','✦']};
const NOTEBOOKS=[["991380e6-3141-43c5-8ff4-8882ede2326d", "Holy Quran · Tafseer", "Quranic commentary and exegesis"], ["7e16985a-b1c5-430d-8685-184a64a6980c", "Basa'ir al-Darajat", "al-Saffar on the virtues of the Ahlul Bayt (a.s.)"], ["bc110ba0-ecda-4c25-b738-b5154cf16c76", "Mir'at al-Uqool", "Allama Majlisi's commentary on al-Kafi · 24 volumes (Arabic)"], ["0c5d849e-a657-416a-b128-3c74a5035741", "Safinat al-Bihar", "Shaykh Abbas Qummi's index of Bihar al-Anwar · 8 volumes"], ["84c60541-e06d-4e83-ae44-3fe6614fd53d", "The Amali", "Dictations of Saduq, Mufid and Tusi"], ["49752979-f698-48ba-bcf5-64df6da1971f", "Shaykh Saduq (r.a.)", "Collected works of al-Shaykh al-Saduq"], ["a75a5426-4f2c-4895-8dd3-78ec0ab31e09", "Nahj al-Balagha", "Sermons, letters and sayings of Imam Ali (a.s.)"], ["8ae34cf8-c283-42ee-8f7f-b0ddd5b30bd1", "Virtues of the Five (a.s.)", "From the Sihah al-Sittah · 3 volumes"], ["06e04aab-714e-4475-92a0-007973a17ec1", "Mahdaviyat", "On Imam al-Mahdi (a.t.f.s.)"], ["21f14960-6d8b-47a5-92fc-ee4441e8c93b", "I'tiqadat", "Beliefs, by Saduq and Majlisi"], ["89ee2444-82fc-4f30-892d-c91202ac2359", "Bihar al-Anwar", "Allama Majlisi's hadith encyclopedia · 110 volumes"], ["3df041d1-9621-4501-b6c0-13fff62e3548", "Ayatullah Sistani", "Tauzeeh al-Masael and other books"], ["f9ad8a9b-b533-43aa-8de7-cc24fb628305", "A Shi'ite Encyclopedia", "Questions and answers on Shia beliefs"], ["14d5f383-c902-4400-8548-5e49775c2997", "Wasa'il al-Shi'a", "Hadith on law and practice · 30 volumes"], ["49c6f15f-f2f5-4b82-819e-3bc063c479e0", "Man La Yahduruhu al-Faqih", "Shaykh Saduq's hadith collection · 4 volumes"], ["f5c79bdb-a1ae-422b-b7f3-15dc87ebf106", "Usool al-Kafi", "Shaykh Kulayni's al-Kafi · 8 volumes"]];
const DICON={"m": "<path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"/><path d=\"M17 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z\"/>", "d": "<path d=\"M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6.5a1.5 1.5 0 0 1 3 0v7.5a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4 14.5a1.5 1.5 0 0 1 2.5-1.6L8 15\"/>", "z": "<path d=\"M4 20h16M6 20v-7a6 6 0 0 1 12 0v7M12 7V4M10.5 4.5h3M9 20v-4a3 3 0 0 1 6 0v4\"/>", "s": "<path d=\"M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M9 8h7M9 11.5h5\"/>", "a": "<path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5zM17 3l.7 1.6 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z\"/>", "n": "<path d=\"M5 21V10l7-6 7 6v11zM9 21v-5a3 3 0 0 1 6 0v5M5 21h14\"/>", "h": "<path d=\"M12 2.5l2.4 5 5.4.7-4 3.8 1 5.4L12 14.8 7.2 17.4l1-5.4-4-3.8 5.4-.7z\"/>", "e": "<path d=\"M12 3v2M12 19v2M4.2 7l1.7 1M18.1 15l1.7 1M3 12h2M19 12h2M4.2 17l1.7-1M18.1 9l1.7-1\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>", "t": "<path d=\"M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2\"/>"};const DTINT={"m": "#6c5ce7", "d": "#2f7dd1", "z": "#16a085", "s": "#8e44ad", "a": "#d68910", "n": "#c0392b", "h": "#2c7a7b", "e": "#e67e22", "t": "#3d5afe"};
let dView=store.get('dView','grid');
function renderDuas(g){
  if(g&&!DCAT[g])g=null;
  if(g){if(g!==dTab)dSec='';dTab=g;store.set('dTab',g)}
  setHeader(g?DCAT[g][0]:'<img class="lib-logo" src="data:image/png;base64,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" alt="">Library',!!g);
  const cnt=g=>g==='h'?99:g==='r'?NOTEBOOKS.length:LIST.filter(x=>x.grp===g).length;
  const cats=`<div class="dcat-head"><b>Categories</b><div class="seg vseg"><button data-v="grid" class="${dView==='grid'?'on':''}">▦ Grid</button><button data-v="list" class="${dView==='list'?'on':''}">☰ List</button></div></div>
   <div class="dcats ${dView}">${DTABS.map(([k])=>{const c=DCAT[k];return `<a class="dcat" href="#duas-${k}"><span class="dcat-m" style="--t:${DTINT[k]}"><svg viewBox="0 0 24 24" aria-hidden="true">${DICON[k]}</svg></span><span class="dcat-t"><b>${c[0]}</b><small>${c[2]}</small></span><span class="dcat-u">${c[1]}</span><span class="dcat-n">${cnt(k)}</span><span class="dcat-go">›</span></a>`}).join('')}</div>`;
  app.innerHTML=`${g?`<div class="lib-hero"><h1>${DCAT[g][0]}</h1><p>${esc(DCAT[g][2])}</p></div>`:`<div class="lib-hero"><h1>Library</h1><p>Duas, ziyarat, aamaal, namaz &amp; the Sahifa</p></div>
   <a class="ai-ban" href="#duas-r"><span class="ai-pill">✦ Google NotebookLM AI</span><b>AI Research Notebooks</b><span class="ai-d">Ask questions of 16 classical Shia books, from Bihar al-Anwar and al-Kafi to Nahj al-Balagha and tafseer.</span><span class="ai-go">Explore notebooks →</span></a>
   ${duaSpot()}`}
   <div class="search">${icon.search}<input id="dq" type="search" placeholder="Search duas, ziyarat, namaz…" value="${esc(dQ)}" autocomplete="off"></div>
   ${g?'':`<div id="dcatw">${cats}</div>`}
   <div class="list" id="dlist"></div>
`;
  app.querySelectorAll('.vseg [data-v]').forEach(b=>b.onclick=()=>{dView=b.dataset.v;store.set('dView',dView);renderDuas(g)});
  const norm=x=>(x||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,' ').trim();
  const draw=()=>{
    const q=norm(dQ);
    if($('dcatw'))$('dcatw').hidden=!!q;
    if(!q&&!g){$('dlist').innerHTML='';return}
    if(!q&&g==='r'){const TG=['Quran & Tafseer','Virtues','24 volumes','8 volumes','Hadith dictations','Primary sources','Imam Ali (a.s.)','3 volumes','Imam al-Mahdi','Beliefs','110 volumes','Fiqh','Q & A','30 volumes','4 volumes','8 volumes'];$('dlist').innerHTML=`<div class="hint" style="margin:0 2px 14px">Public notebooks on Google NotebookLM, shared by Divine Pearls (ya-mahdi.net) as ShiaLM. Each opens in your browser and needs a Google account.</div><div class="nbgrid">`+NOTEBOOKS.map(([id,t,d],i)=>`<a class="nbc" href="https://notebook.google.com/notebook/${id}" target="_blank" rel="noopener"><div class="nbc-top"><span class="nbc-i">✦</span><span class="nbc-tag">${esc(TG[i]||'')}</span></div><b>${esc(t)}</b><small>${esc(d)}</small><span class="nbc-btn">Open NotebookLM →</span></a>`).join('')+'</div>';return}
    const items=q?LIST.filter((d,i,A)=>norm(d.name+' '+d.sub+' '+d.ur+' '+d.id).includes(q)&&(!d.key||A.findIndex(x=>x.key===d.key)===i)):LIST.filter(d=>d.grp===dTab);
    let lastSec='';
    if(!q&&dTab==='s'){
      const secs=[];LIST.filter(x=>x.grp==='s'&&x.sec).forEach(x=>{if(!secs.find(y=>y[0]===x.sec))secs.push([x.sec,x.secUr||'',(()=>{let c=0,on=false;LIST.forEach(z=>{if(z.grp!=='s')return;if(z.sec)on=z.sec===x.sec;if(on)c++});return c})()])});
      const SD={'Supplications':'Duas 1–61','Supplications for the Days of the Week':'Sunday to Saturday','Fifteen Whispered Prayers':'Munajat 1–15'};
      if(!dSec||!secs.find(y=>y[0]===dSec)){
        $('dlist').innerHTML=secs.map(([n,u,c],i)=>`<div class="item sec-card" data-sec="${i}" role="button" tabindex="0"><div class="num"><span>${c}</span></div><div class="t"><b>${esc(n)}</b><small>${esc(SD[n]||'')}</small></div><div class="dur">${u}</div><span class="dcat-go">›</span></div>`).join('');
        $('dlist').querySelectorAll('.sec-card').forEach(c=>c.onclick=()=>{dSec=secs[+c.dataset.sec][0];draw();window.scrollTo(0,0)});
        return}
      const cur=secs.find(y=>y[0]===dSec);
      const its=LIST.filter(d=>d.grp==='s'&&d.sec===dSec||(d.grp==='s'&&!d.sec&&inSec(d,dSec)));
      function inSec(d,n){const idx=LIST.indexOf(d);let sc='';for(let i=idx;i>=0;i--){if(LIST[i].grp==='s'&&LIST[i].sec){sc=LIST[i].sec;break}}return sc===n}
      $('dlist').innerHTML=`<div class="sec-back" role="button" tabindex="0">‹ Sahifa Sajjadiya</div><div class="dsec"><b>${esc(cur[0])}</b><span>${cur[1]}</span></div>`+its.map(d=>{const m=/^(\d+)\.\s*(.*)$/.exec(d.name),sub=m?'':d.sub;
        return `<a class="item dua-item${m?' snum':''}" href="#dua-${d.id}"><div class="num"><span>${m?m[1]:(d.mark||'د')}</span></div><div class="t"><b>${esc(m?m[2]:d.name)}</b>${sub?`<small>${esc(sub)}</small>`:''}</div><div class="dur">${d.ur||''}</div>${dfavBtn(d.id)}</a>`}).join('');
      $('dlist').querySelector('.sec-back').onclick=()=>{dSec='';draw();window.scrollTo(0,0)};
      return}
    if(!q&&dTab==='h'){const N=DU['N_names-99'].segs.filter(x=>x.ar);
      $('dlist').innerHTML=`<a class="item dua-item" href="#dua-asma-ul-husna"><div class="t"><b>Open with meanings &amp; benefits</b><small>Allah has the Most Beautiful Names, so call Him by them (7:180)</small></div><div class="ar" style="font-family:'Noto Nastaliq Urdu',serif;font-size:15px;line-height:2">اسمائے حسنیٰ</div></a>`+
        N.map((x,i)=>`<a class="item nm99" href="#dua-asma-ul-husna"><span class="nn">${i||''}</span><div class="t"><b>${esc(x.tr)}</b><small>${esc(x.en.replace(/^\d+\.\s*/,''))}</small></div><div class="ar nar">${x.ar}</div></a>`).join('');
      app.querySelectorAll('.dtabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.g===dTab));return}
    $('dlist').innerHTML=items.map(d=>(d.sec&&!q&&d.sec!==lastSec?(lastSec=d.sec,`<div class="dsec"><b>${esc(d.sec)}</b><span>${d.secUr||''}</span></div>`):'')+(()=>{const m=d.grp==='s'&&/^(\d+)\.\s*(.*)$/.exec(d.name),sub=m?'':d.sub;
      return `<a class="item dua-item${m?' snum':''}" href="#dua-${d.id}"><div class="num"><span>${m?m[1]:(d.mark||'د')}</span></div><div class="t"><b>${esc(m?m[2]:d.name)}</b>${sub?`<small>${esc(sub)}</small>`:''}</div>`})()+`<div class="dur">${d.ur||''}</div>${dfavBtn(d.id)}</a>`).join('')
      ||'<div class="hint" style="padding:20px 4px;text-align:center">Nothing found — try another name (e.g. Kumayl, Ashura, Kisa).</div>';
    app.querySelectorAll('.dtabs .tab').forEach(b=>b.classList.toggle('on',!q&&b.dataset.g===dTab));
  };
  app.querySelectorAll('.dtabs .tab').forEach(b=>b.onclick=()=>{dTab=b.dataset.g;dSec='';store.set('dTab',dTab);dQ='';$('dq').value='';draw()});
  $('dq').oninput=e=>{dQ=e.target.value;draw()};
  draw();
}
if(S.nl==null)S.nl=store.get('nl','en');
function noteHTML(note,ur,h,cls){const l=S.nl,hasUr=!!ur,showEn=l!=='ur'||!hasUr,showUr=hasUr&&l!=='en';
  return `<div class="${cls||'note'}${h?' h':''}">${showEn?`<span class="nen">${esc(note)}</span>`:''}${showUr?`<span class="nur">${esc(ur)}</span>`:''}</div>`}
function nlSeg(){const b=(v,t)=>`<button data-nl="${v}" class="${S.nl===v?'on':''}">${t}</button>`;
  return `<div class="nlseg"><span>Instructions</span><div>${b('en','English')}${b('ur','اردو')}${b('both','Both')}</div></div>`}
function meritsHTML(D,id){const l=S.nl,u=D.meritsUr,showEn=l!=='ur'||!u,showUr=u&&l!=='en';
  const b=(v,t)=>`<button data-nl="${v}" class="${S.nl===v?'on':''}">${t}</button>`;
  return `<details class="merits" data-mid="${id}"${S.moId===id?' open':''}><summary>About &amp; merits<span class="mur-t">فضیلت و تعارف</span></summary>`
   +(u?`<div class="mseg">${b('en','English')}${b('ur','اردو')}${b('both','Both')}</div>`:'')
   +(showEn?`<div class="men">${esc(cleanMd(D.merits))}</div>`:'')+(showUr?`<div class="mur">${esc(u)}</div>`:'')+`</details>`}
document.addEventListener('toggle',e=>{const t=e.target;if(t.matches&&t.matches('details.merits'))S.moId=t.open?t.dataset.mid:null},true);
app.addEventListener('click',e=>{const b=e.target.closest('[data-nl]');if(!b)return;S.nl=b.dataset.nl;store.set('nl',S.nl);const y=window.scrollY,h=location.hash.slice(1);if(!(window.XR&&window.XR(h)))window.dispatchEvent(new HashChangeEvent('hashchange'));window.scrollTo(0,y)});
const cleanMd=s=>s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/^##\s*/gm,'').replace(/\*\*/g,'');
function verseHTML(ar,tr,en,ur,end){
  return `<div class="dverse"><div class="v-ar">${ar}${end?` <span class="end">${end}</span>`:''}</div>
    ${tr?`<div class="v-tr">${esc(tr)}</div>`:''}${en?`<div class="v-en">${esc(en)}</div>`:''}${ur?`<div class="v-ur">${esc(ur)}</div>`:''}</div>`;
}
const NLG=['a','n','h'];
function renderDua(id){
  const d=LIST.find(x=>x.id===id); if(!d) return false;
  setHeader(`${esc(d.name)}`,true); noJump();
  let h=`<div class="s-head"><div class="ar" style="font-family:'Noto Nastaliq Urdu',serif;font-size:30px;line-height:2.2">${d.ur}</div><h2>${esc(d.name)}</h2><p>${esc(d.sub)}</p>${dfavBtn(d.id,true)}</div>`;
  if(d.user){
    const U=UD[d.user];h+=readbar('dua',null);
    if(NLG.includes(d.grp)&&U.items.some(x=>x.note&&x.ur))h+=nlSeg();
    const tlBox=t=>t?`<div class="v-tr tlbox"><b>Transliteration</b>${esc(t).replace(/\n\n/g,'<br><br>')}</div>`:'';
    let pend=U.tl0;h+='<div class="dbody">';
    U.items.forEach(it=>{
      if(it.head){h+=tlBox(pend);pend=it.tl||'';h+=`<div class="uhead">${esc(it.head)}</div>`;return}
      if(it.note){h+=noteHTML(it.note,it.ur,false,'unote');return}
      if(it.enb){h+=`<div class="v-en tbox enb"><b>English</b>${esc(it.enb).replace(/\n\n/g,'<br><br>')}</div>`;return}
      if(!it.en){h+=`<div class="uv uvc"><div class="v-ar">${it.ar}</div></div>`;return}
      h+=`<div class="uv"><div class="v-ar">${it.ar}</div><div class="v-en tbox">${esc(it.en)}</div>${it.ur?`<div class="v-ur tbox urbox">${esc(it.ur)}</div>`:''}</div>`;
    });
    h+=tlBox(pend);h+='</div>';
    app.innerHTML=h;return true;
  }
  if(d.id==='ayat-kursi'){
    h+=readbar('dua',false);
    h+=`<div class="bism">${BISMX()}</div><div class="dbody">`;
    for(const v of [255,256,257]) h+=verseHTML(ARX()[1][v-1],'',EN[1][v-1],UR[1][v-1],endMark(v)).replace('class="v-ur"','class="v-ur qur"');
    h+=`</div><div class="nav-surah"><a href="#surah-2-255">Open in Quran (2:255) ›</a></div>`;
  } else {
    const D=DU[d.key], useAlt=!!D.alt&&D.alt.style!=='para', after=useAlt?D.alt.after:{}, para=useAlt&&D.alt.style==='para';
    h+=readbar('dua',useAlt?D.alt.label:null);
    if(NLG.includes(d.grp)&&D.segs.some(x=>x.note!=null&&x.ur))h+=nlSeg();
    if(D.merits) h+=meritsHTML(D,d.id);
    h+='<div class="dbody">';
    if(useAlt&&D.alt.style==='own'){
      const segs=D.segs,L=D.alt.lines,noteH=s=>noteHTML(s.note,s.ur,s.h);
      let ptr=0;
      L.forEach(([ar,en,sg],k)=>{
        if(sg<0){h+=verseHTML(ar,'',en,'');return}
        while(ptr<=sg){if(segs[ptr].note!=null)h+=noteH(segs[ptr]);ptr++}
        let n=k+1;while(n<L.length&&L[n][2]<0)n++;
        const last=n>=L.length||L[n][2]!==sg, S2=segs[sg]||{};
        h+=verseHTML(ar,last?S2.tr:'',en,last?S2.ur:'');
      });
      for(;ptr<segs.length;ptr++){const s2=segs[ptr];h+=s2.note!=null?noteH(s2):verseHTML(s2.ar,s2.tr,s2.en,s2.ur)}
    } else
    h+=D.segs.map((s,i)=>s.note!=null
      ? noteHTML(s.note,s.ur,s.h)
      : (para?verseHTML(s.ar,s.tr,'',s.ur)+(after[i]?`<div class="v-en v-enp">${esc(after[i])}</div>`:'')
             :verseHTML(s.ar,s.tr,useAlt?(after[i]||''):s.en,s.ur))).join('');
  }
  if(d.id!=='ayat-kursi')h+='</div>';
  app.innerHTML=h;
  return true;
}

const dediHTML=()=>`<div class="card dedi"><div class="dstar">✦</div>
     <div class="dar">اَللّٰهُمَّ عَجِّلْ لِوَلِيِّكَ الْفَرَج</div>
     <p>This app is lovingly dedicated to <b style="white-space:nowrap">Imam-e-Zamana (a.t.f.s.)</b>, the Master of our Time.</p>
     <p class="dsub">Every time you turn towards the Kaaba, remember that he is waiting for us too. Please pray for his reappearance 🤍</p></div>`;

/* ================= PRAYER TIMES (Jafari / Shia Ithna Ashari) ================= */
const dtr=d=>d*Math.PI/180, rtd=r=>r*180/Math.PI;
const sin=d=>Math.sin(dtr(d)),cos=d=>Math.cos(dtr(d)),tan=d=>Math.tan(dtr(d));
const asin=x=>rtd(Math.asin(x)),acos=x=>rtd(Math.acos(x)),atan2=(y,x)=>rtd(Math.atan2(y,x)),acot=x=>rtd(Math.atan(1/x));
const fix=(a,b)=>{a=a-b*Math.floor(a/b);return a<0?a+b:a};
function julian(y,m,d){if(m<=2){y-=1;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){const D=jd-2451545,g=fix(357.529+0.98560028*D,360),q=fix(280.459+0.98564736*D,360),
  L=fix(q+1.915*sin(g)+0.020*sin(2*g),360),e=23.439-0.00000036*D,RA=atan2(cos(e)*sin(L),cos(L))/15;
  return{decl:asin(sin(e)*sin(L)),eqt:q/15-fix(RA,24)}}
function computeDay(y,m,d,lat,lng,tz){
  const jDate=julian(y,m,d)-lng/(15*24);
  const midDay=t=>fix(12-sunPos(jDate+t).eqt,24);
  const angleTime=(ang,t,ccw)=>{const dec=sunPos(jDate+t).decl,noon=midDay(t);
    const T=acos((-sin(ang)-sin(dec)*sin(lat))/(cos(dec)*cos(lat)))/15;return noon+(ccw?-T:T)};
  const asrT=(f,t)=>{const dec=sunPos(jDate+t).decl;return angleTime(-acot(f+tan(Math.abs(lat-dec))),t)};
  let t={fajr:5,sunrise:6,dhuhr:12,asr:13,sunset:18,maghrib:18,isha:18};
  for(let i=0;i<2;i++){const p={};for(const k in t)p[k]=t[k]/24;
    t={fajr:angleTime(16,p.fajr,true),sunrise:angleTime(0.833,p.sunrise,true),dhuhr:midDay(p.dhuhr),asr:asrT(1,p.asr),
       sunset:angleTime(0.833,p.sunset),maghrib:angleTime(4,p.maghrib),isha:angleTime(14,p.isha)}}
  for(const k in t)t[k]+=tz-lng/15;
  // high-latitude safety (night-middle rule)
  const night=fix(t.sunrise-t.sunset,24);
  const adj=(v,base,portion,ccw)=>{const diff=ccw?fix(base-v,24):fix(v-base,24);return(isNaN(v)||diff>portion)?base+(ccw?-portion:portion):v};
  t.fajr=adj(t.fajr,t.sunrise,night*16/60,true);t.isha=adj(t.isha,t.sunset,night*14/60);t.maghrib=adj(t.maghrib,t.sunset,night*4/60);
  t.midnight=t.sunset+fix(t.fajr+24-t.sunset,24)/2; // Jafari midnight: sunset → fajr
  return t;
}
function tzOffset(tz,date){
  try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
    const p={};f.formatToParts(date).forEach(x=>p[x.type]=x.value);
    return(Date.UTC(+p.year,p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-date.getTime())/3600000}catch(e){return -date.getTimezoneOffset()/60}
}
function localYMD(tz,date){try{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date).forEach(x=>p[x.type]=x.value);return[+p.year,+p.month,+p.day]}catch(e){return[date.getFullYear(),date.getMonth()+1,date.getDate()]}}
const PR=[['fajr','Fajr','فجر',1],['sunrise','Sunrise','طلوع آفتاب',0],['dhuhr','Dhuhr','ظہر',1],['asr','Asr','عصر',1],['sunset','Sunset','غروب آفتاب',0],['maghrib','Maghrib','مغرب',1],['isha','Isha','عشاء',1],['midnight','Midnight','نصف شب',0]];
function timesFor(loc,date){ // returns {key: Date}
  const [y,m,d]=localYMD(loc.tz,date), base=Date.UTC(y,m-1,d);
  const off=tzOffset(loc.tz,new Date(base+12*3600e3));
  const t=computeDay(y,m,d,loc.lat,loc.lng,off), r={};
  for(const k in t) r[k]=new Date(base+(t[k]-off)*3600e3);
  return r;
}
const fmt=(loc,dt)=>{try{return dt.toLocaleTimeString([], {timeZone:loc.tz,hour:'numeric',minute:'2-digit'})}catch(e){return dt.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}};

let LOC=store.get('loc',null);
const ALERTS=Object.assign({fajr:true,dhuhr:true,asr:true,maghrib:true,isha:true},store.get('alerts',{}));
let armed=false,ticker=null,audioCtx=null,playing=null,fired=store.get('fired',{});
const SLOTS=[['builtin','Azan',''],['mecca','Mecca','Masjid al-Haram'],['medina','Medina','Masjid an-Nabawi'],['moazenzadeh','Moazenzadeh','Rahim Moazenzadeh Ardabili'],['moazenzadeh_2','Moazenzadeh (2)','Mashhad'],['kazemzadeh','Kazemzadeh',''],['aghati_1','Aghati (1)',''],['aghati_2','Aghati (2)',''],['rezaeian','Rezaeian',''],['abdulbasit','Abdul Basit','']];
const AZ={builtin:{url:document.getElementById('azdata').dataset.src||('data:audio/mpeg;base64,'+document.getElementById('azdata').textContent.trim()),name:'Azan',fixed:true},
  mecca:{url:'azan_mecca.mp3',name:'Mecca azan',fixed:true},medina:{url:'azan_medina.mp3',name:'Medina azan',fixed:true},moazenzadeh:{url:'azan_moazenzadeh.mp3',name:'Moazenzadeh azan',fixed:true},moazenzadeh_2:{url:'azan_moazenzadeh_2.mp3',name:'Moazenzadeh (2) azan',fixed:true},kazemzadeh:{url:'azan_kazemzadeh.mp3',name:'Kazemzadeh azan',fixed:true},aghati_1:{url:'azan_aghati_1.mp3',name:'Aghati (1) azan',fixed:true},aghati_2:{url:'azan_aghati_2.mp3',name:'Aghati (2) azan',fixed:true},rezaeian:{url:'azan_rezaeian.mp3',name:'Rezaeian azan',fixed:true},abdulbasit:{url:'azan_abdulbasit.mp3',name:'Abdul Basit azan',fixed:true}};
const AZOK=v=>!!AZ[v];
const AZK=[['fajr','Fajr'],['dhuhr','Dhuhr'],['asr','Asr'],['maghrib','Maghrib'],['isha','Isha']];
const AZP=(()=>{const f=store.get('azFajr','builtin'),o=store.get('azOther','builtin'),m=store.get('azPer',{}),r={};
  for(const [k] of AZK){const v=m[k]||(k==='fajr'?f:o);r[k]=AZOK(v)?v:'builtin'}return r})();
let azTarget='fajr';
const setAz=(k,v)=>{AZP[k]=v;store.set('azPer',AZP)};
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('quranapp',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbPut(key,val){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction('f','readwrite');val==null?tx.objectStore('f').delete(key):tx.objectStore('f').put(val,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function idbGet(key){try{const db=await idb();return await new Promise(res=>{const q=db.transaction('f').objectStore('f').get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
(async()=>{
  const old=await idbGet('azan'); if(old&&!(await idbGet('azan:custom'))){try{await idbPut('azan:custom',old);await idbPut('azan',null)}catch(e){}}
  if(location.hash==='#prayer')renderPrayer();
})();

function chime(){ // gentle synthesized bell, repeated
  try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return}
  const ctx=audioCtx, start=ctx.currentTime+0.05, nodes=[];
  [0,1.6,3.2,4.8,6.4,8.0].forEach((o,i)=>{[523.25,659.25,783.99].forEach((f,j)=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=f*(i%2?0.75:1);
    const t0=start+o+j*0.12;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.18,t0+0.03);g.gain.exponentialRampToValueAtTime(0.0008,t0+1.5);
    osc.connect(g).connect(ctx.destination);osc.start(t0);osc.stop(t0+1.6);nodes.push(osc)})});
  return{stop(){nodes.forEach(n=>{try{n.stop()}catch(e){}})}};
}
function slotFor(k){const v=AZP[k]||AZP.dhuhr;return AZ[v]?v:'builtin'}
function playAlert(name,k){
  stopAlert();const slot=k&&k.startsWith('slot:')?k.slice(5):slotFor(k);
  $('alertTxt').textContent=k&&k.startsWith('slot:')?`Playing: ${name}`:`It's time for ${name} prayer · ${LOC?LOC.name:''}`;$('alertbar').classList.add('show');
  if(!k||!k.startsWith('slot:')){try{if(store.get('alertVib',true)&&navigator.vibrate)navigator.vibrate([600,300,600])}catch(e){}
    if(!store.get('alertSound',true)){playing={stop(){}};return}}
  if(AZ[slot]){const a=new Audio(AZ[slot].url);a.play().catch(()=>{});a.onended=()=>$('alertbar').classList.remove('show');playing={stop(){a.pause()}}}
  else playing=chime();
  try{if(window.Notification&&Notification.permission==='granted')new Notification(`${name} — time for prayer`,{body:LOC?LOC.name:''})}catch(e){}
}
function stopAlert(){if(playing){playing.stop();playing=null}$('alertbar').classList.remove('show')}
$('alertStop').onclick=stopAlert;

function tick(){
  if(!LOC)return;const now=new Date(),T=timesFor(LOC,now);
  for(const [k,n,,main] of PR){ if(!main||!ALERTS[k])continue;
    const t=T[k],id=k+'@'+t.toISOString().slice(0,16);
    if(now>=t&&now-t<120000&&!fired[id]){fired[id]=1;
      const keep={};Object.keys(fired).slice(-20).forEach(x=>keep[x]=1);fired=keep;store.set('fired',fired);
      if(armed)playAlert(n,k)}}
  if(location.hash==='#prayer')updateNext();
}
function nextPrayer(){
  const now=new Date();
  for(const dayAdd of [0,1]){const T=timesFor(LOC,new Date(now.getTime()+dayAdd*86400e3));
    for(const [k,n,u,main] of PR) if(main&&T[k]>now) return{k,n,u,t:T[k]}}
}
function updateNext(){
  const el=$('nextBox');if(!el||!LOC)return;const np=nextPrayer();if(!np)return;
  const s=Math.max(0,Math.round((np.t-new Date())/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;
  el.innerHTML=`<small>Next prayer</small><div class="nm">${np.n} · ${fmt(LOC,np.t)}</div><div class="cd">in ${h?h+'h ':''}${m}m ${String(sec).padStart(2,'0')}s</div>`;
}
function cityPicker(target){
  target.innerHTML=`${window.NH?`<button class="btn pri" id="cgps" style="width:100%;padding:13px;font-size:15px;margin-bottom:12px">📍 Use my current location</button>
    <div class="hint" style="text-align:center;margin:-4px 0 10px">or search</div>`:''}
    <input class="inp" id="cq" placeholder="Search your city (e.g. Chicago, Karachi, Qom)" autocomplete="off">
    <div class="cities" id="cres"></div>
    <details style="margin-top:12px"><summary class="hint" style="cursor:pointer">Or enter coordinates</summary>
      <div style="display:flex;gap:8px;margin-top:8px"><input class="inp" id="clat" placeholder="Latitude" inputmode="decimal"><input class="inp" id="clng" placeholder="Longitude" inputmode="decimal"></div>
      <button class="btn pri" id="cset" style="margin-top:8px">Use these (with my phone's time zone)</button></details>`;
  const show=q=>{q=q.trim().toLowerCase();const out=[];
    if(q.length>=2){for(const p of CI.p)if(p[0].toLowerCase()===q)out.push(p);for(const p of CI.p){if(out.length>=40)break;if(out.includes(p))continue;if(p[0].toLowerCase().startsWith(q)||(q.length>3&&p[0].toLowerCase().includes(q)))out.push(p)}}
    $('cres').innerHTML=out.map((p,i)=>`<button data-i="${CI.p.indexOf(p)}">${esc(p[0])} <small>· ${esc(CI.c[p[1]]||p[1])}</small></button>`).join('')||(q.length>=2?'<div class="hint" style="padding:10px 4px">No match — try a nearby larger city, or enter coordinates.</div>':'')};
  $('cq').oninput=e=>show(e.target.value);
  if($('cgps'))$('cgps').onclick=async()=>{const b=$('cgps');b.disabled=true;b.textContent='Finding your location…';if(!(await locateMe(false))){b.disabled=false;b.textContent='📍 Use my current location'}};
  $('cres').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=CI.p[+b.dataset.i];
    setLoc({name:`${p[0]}, ${CI.c[p[1]]||p[1]}`,lat:p[2],lng:p[3],tz:CI.z[p[4]],auto:false})};
  $('cset').onclick=()=>{const la=parseFloat($('clat').value),ln=parseFloat($('clng').value);
    if(!(la>=-90&&la<=90&&ln>=-180&&ln<=180)){toast('Enter a valid latitude and longitude');return}
    let tz;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){tz='UTC'}
    setLoc({name:`${la.toFixed(2)}, ${ln.toFixed(2)}`,lat:la,lng:ln,tz,auto:false})};
  setTimeout(()=>{try{$('cq').focus()}catch(e){}},50);
}
function setLoc(l,quiet){LOC=l;store.set('loc',l);if(!quiet)toast('Location set: '+l.name);window.NH&&NH.refresh();route2()}
/* automatic location: GPS -> nearest city name, device time zone */
function nearestCity(la,ln){let best=null,bd=1e9;for(const p of CI.p){const dl=dtr(p[2]-la),dg=dtr(p[3]-ln),a=Math.sin(dl/2)**2+Math.cos(dtr(la))*Math.cos(dtr(p[2]))*Math.sin(dg/2)**2,d=12742*Math.asin(Math.sqrt(a));if(d<bd){bd=d;best=p}}return [best,bd]}
async function getPos(){
  if(window.NH&&NH.getLocation)return await NH.getLocation();
  if(!navigator.geolocation)throw new Error('no geolocation');
  return await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),rej,{timeout:20000,maximumAge:600000}));
}
let locating=false;
async function locateMe(quiet){
  if(locating)return false;locating=true;
  try{
    const {lat,lng}=await getPos();
    const [c,d]=nearestCity(lat,lng);
    let tz;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){tz=c?CI.z[c[4]]:'UTC'}
    const place=c?`${c[0]}, ${CI.c[c[1]]||c[1]}`:`${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    const name=c&&d>40?`Near ${place}`:place;
    if(quiet&&LOC&&LOC.auto!==false){const [,moved]=[0,Math.hypot(LOC.lat-lat,(LOC.lng-lng)*Math.cos(dtr(lat)))*111];if(moved<20){locating=false;return true}}
    setLoc({name,lat:+lat.toFixed(4),lng:+lng.toFixed(4),tz,auto:true},quiet);editing=false;
    if(quiet)toast('📍 Location: '+name);
    return true;
  }catch(e){if(!quiet)toast('Could not get your location — please allow location, or search your city');return false}
  finally{locating=false}
}
/* called at launch / when the app comes back: first run asks once; afterwards only follows you if you chose automatic */
function autoLocate(resume){
  if(!window.NH)return;
  if(!LOC){if(resume&&store.get('autoAsked',false))return;store.set('autoAsked',true);locateMe(true);return}
  if(LOC.auto!==false)locateMe(true);
}
function route2(){if(location.hash==='#qibla')renderQibla();else renderPrayer()}
let editing=false;
function renderPrayer(){
  setHeader('Prayer times',false);
  if(!LOC||editing){
    app.innerHTML=`<div class="hero"><div class="ar" style="font-family:IndoPak,serif">اَوْقَاتُ الصَّلٰوة</div><p>Choose your city to see prayer times</p></div><div class="card" id="pick"></div>
    ${LOC?'<button class="btn" id="cancelEdit">Cancel</button>':''}`;
    cityPicker($('pick'));if($('cancelEdit'))$('cancelEdit').onclick=()=>{editing=false;renderPrayer()};return;
  }
  const now=new Date(),T=timesFor(LOC,now),np=nextPrayer();
  let dstr='';try{dstr=now.toLocaleDateString([], {timeZone:LOC.tz,weekday:'long',day:'numeric',month:'long'})}catch(e){}
  app.innerHTML=`
   <div class="card loc" style="margin-top:16px"><b>📍 ${esc(LOC.name)}<br><small class="hint">${esc(dstr)}${window.NH&&LOC.auto!==false?' · 📡 automatic':''}</small></b><button class="btn" id="chg">Change</button></div>
   <div class="next" id="nextBox"></div>
   <div class="card ptable">${PR.map(([k,n,u,main])=>`<div class="pr${main?'':' minor'}${np&&np.k===k?' now':''}"><span>${n}</span><span class="ur">${u}</span><b>${fmt(LOC,T[k])}</b>
      ${main?`<button class="bell${ALERTS[k]?' on':''}" data-k="${k}" aria-label="Azan alert for ${n}">${ALERTS[k]?icons.bell:icons.belloff}</button>`:'<span style="width:34px;flex:none"></span>'}</div>`).join('')}</div>
   <div class="card">
     <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><b style="flex:1">Azan alerts</b>
       <button class="btn${(window.NH?NH.alertsOn():armed)?'':' pri'}" id="arm">${(window.NH?NH.alertsOn():armed)?'Turn off':'Turn on alerts'}</button></div>
     ${(window.NH?NH.alertsOn():armed)?`<div class="aprefs">
        <button class="arow" data-pref="alertSound"><span><b>🔊 Sound</b><small>${window.NH&&NH.platform==='ios'?'Plays the azan you chose, like an alarm — even when your iPhone is on silent':'Plays the azan you chose for each prayer'}</small></span><i class="sw${store.get('alertSound',true)?' on':''}"></i></button>
        <button class="arow" data-pref="alertVib"><span><b>📳 Vibrate</b><small>${window.NH&&NH.platform==='ios'?'With sound on, vibration follows your iPhone\'s Sounds &amp; Haptics settings':'Vibrates when the alert arrives'}</small></span><i class="sw${store.get('alertVib',true)?' on':''}"></i></button>
        <div class="hint" style="margin-top:8px">✓ Alerts on for ${esc(LOC.name)} — at the exact time of each prayer you've belled above, even when the app is closed.</div>
        ${window.NH&&NH.alertStatus?`<div class="hint" id="alstat" style="margin-top:6px">Checking alerts on this phone…</div>
        <button class="btn" id="testAl" style="margin-top:8px;width:100%">🔔 Send a test alert (10 seconds)</button>`:''}
      </div>`:`<div class="hint">Get an alert at the time of every salah for your location, with the azan you choose below.</div>`}
     ${window.NH?'':`<div class="hint" style="margin-top:6px">In the web version, alerts ring <b>only while this page is open</b>. Install the app for alerts with the phone locked.</div>`}
   </div>
   <div class="card">
     <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><b style="flex:1">Choose azan</b>
</div>
     <div class="seg azseg">${AZK.map(([k,n])=>`<button data-tgt="${k}" class="${azTarget===k?'on':''}">${n}</button>`).join('')}</div>
     <div class="hint" style="margin:8px 0 6px">Tap an azan to use it for <b>${AZK.find(x=>x[0]===azTarget)[1]}</b>. ▶ plays it.<br>${AZK.map(([k,n])=>`<span class="azsum">${n}: ${(SLOTS.find(x=>x[0]===AZP[k])||SLOTS[0])[1]}</span>`).join(' ')}</div>
     <div class="azlist">${SLOTS.map(([k,n,sub])=>{const have=AZ[k],sel=AZP[azTarget]===k;
       return `<div class="azrow${sel?' sel':''}${have?'':' off'}" data-pick="${k}" role="radio" aria-checked="${sel}" tabindex="0">
         <span class="azdot"></span>
         <div style="flex:1;min-width:0"><b>${n}</b>${(have&&AZ[k].fixed&&!sub)?'':`<small>${have?(k==='chime'||AZ[k].fixed?sub:'✓ '+esc(AZ[k].name)):(sub?sub+' · ':'')+'Tap to add a recording'}</small>`}</div>
         ${have?`<button class="btn azplay" data-play="${k}" aria-label="Play ${n}">▶</button>`:''}${AZ[k]&&!AZ[k].fixed?`<button class="btn" data-del="${k}" aria-label="Remove ${n}">✕</button>`:''}
         ${have?'':`<input type="file" accept="audio/*" data-add="${k}" hidden>`}</div>`}).join('')}</div>
   </div>
   <div class="foot">Method: Shia Ithna Ashari (Jafari, Leva Institute Qum) — Fajr 16°, Maghrib 4°, Isha 14°, midnight = halfway from sunset to Fajr.<br>Times may differ by a few minutes from your local mosque's timetable.</div>`;
  updateNext();
  $('chg').onclick=()=>{editing=true;renderPrayer()};
  app.querySelectorAll('.bell').forEach(b=>b.onclick=()=>{const k=b.dataset.k;ALERTS[k]=!ALERTS[k];store.set('alerts',ALERTS);window.NH&&NH.refresh();renderPrayer()});
  if(window.NH)$('arm').onclick=async()=>{await NH.toggleAlerts();renderPrayer()};
  if(window.NH&&NH.alertStatus&&$('alstat')){
    if($('testAl'))$('testAl').onclick=()=>NH.testAlert();
    NH.alertStatus().then(st=>{const el=$('alstat');if(!el)return;const bad=[];
      if(st.perm&&st.perm!=='granted')bad.push('⚠️ Notifications are blocked for this app — turn them on in phone Settings.');
      if(st.exact&&st.exact!=='granted')bad.push('⚠️ “Alarms &amp; reminders” is off — alerts may come late. Turn it on in Settings → Apps → Quran &amp; Duas.');
      if(!st.loc)bad.push('⚠️ No location set — tap Change above.');
      const total=Math.max(st.pending,st.alarms);
      if(!total&&st.loc)bad.push('⚠️ No alerts are scheduled yet. Turn alerts off and on again.');
      const nx=st.next?new Date(st.next).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'}):'';
      el.innerHTML=(bad.length?bad.join('<br>')+'<br>':'')+`${total} alerts scheduled${st.alarms?` (${st.alarms} as alarms)`:''}${nx?` · next: ${nx}`:''}${st.err?`<br>Error: ${esc(st.err)}`:''}`}).catch(()=>{});
  }
  else $('arm').onclick=()=>{
    if(armed){armed=false;renderPrayer();return}
    try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}catch(e){}
    const u=AZ[slotFor('dhuhr')]||AZ[slotFor('fajr')];if(u){const a=new Audio(u.url);a.volume=0;a.play().then(()=>a.pause()).catch(()=>{})}
    try{if(window.Notification&&Notification.permission==='default')Notification.requestPermission().catch(()=>{})}catch(e){}
    armed=true;toast('Azan alerts on — keep this page open');renderPrayer()};
  app.querySelectorAll('[data-pref]').forEach(b=>b.onclick=async()=>{const k=b.dataset.pref,v=!store.get(k,true);
    b.querySelector('.sw').classList.toggle('on',v);if(window.NH)await NH.setPref(k,v);else store.set(k,v);
    toast((k==='alertSound'?'Sound ':'Vibrate ')+(v?'on':'off'))});
  app.querySelectorAll('[data-add]').forEach(inp=>inp.onchange=async e=>{const f=e.target.files[0];if(!f)return;const k=inp.dataset.add;
    if(AZ[k])URL.revokeObjectURL(AZ[k].url);AZ[k]={url:URL.createObjectURL(f),name:f.name};
    try{await idbPut('azan:'+k,{blob:f,name:f.name})}catch(err){toast('Saved for this visit only')}
    setAz(azTarget,k);renderPrayer()});
  app.querySelectorAll('[data-play]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.play;playAlert(k==='builtin'?'Azan':SLOTS.find(x=>x[0]===k)[1]+' azan','slot:'+k)});
  app.querySelectorAll('[data-tgt]').forEach(b=>b.onclick=()=>{azTarget=b.dataset.tgt;renderPrayer()});
  app.querySelectorAll('[data-pick]').forEach(r=>{const pick=()=>{const k=r.dataset.pick;
      if(!AZ[k]){r.querySelector('[data-add]').click();return}
      setAz(azTarget,k);
      window.NH&&NH.refresh&&NH.refresh();renderPrayer()};
    r.onclick=e=>{if(e.target.closest('button,input'))return;pick()};r.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}}});
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async e=>{e.stopPropagation();const k=b.dataset.del;stopAlert();if(AZ[k])URL.revokeObjectURL(AZ[k].url);delete AZ[k];
    for(const [p] of AZK)if(AZP[p]===k)setAz(p,'builtin');
    try{await idbPut('azan:'+k,null)}catch(e){}renderPrayer()});
}

/* ================= QIBLA ================= */
const KAABA=[21.422487,39.826206];
function qibla(lat,lng){const [kl,kg]=KAABA;const dl=dtr(kg-lng);
  return fix(rtd(Math.atan2(Math.sin(dl),Math.cos(dtr(lat))*Math.tan(dtr(kl))-Math.sin(dtr(lat))*Math.cos(dl))),360)}
function distKm(lat,lng){const [kl,kg]=KAABA,R=6371,a=Math.sin(dtr(kl-lat)/2)**2+Math.cos(dtr(lat))*Math.cos(dtr(kl))*Math.sin(dtr(kg-lng)/2)**2;return 2*R*Math.asin(Math.sqrt(a))}
function renderQibla(){
  setHeader('Qibla direction',false);
  if(!LOC||editing){app.innerHTML=`<div class="hero"><div class="ar" style="font-family:IndoPak,serif">قِبْلَه</div><p>Choose your city to find the Qibla</p></div><div class="card" id="pick"></div>${LOC?'<button class="btn" id="cancelEdit">Cancel</button>':''}`;
    cityPicker($('pick'));if($('cancelEdit'))$('cancelEdit').onclick=()=>{editing=false;renderQibla()};return}
  const b=qibla(LOC.lat,LOC.lng),km=distKm(LOC.lat,LOC.lng);
  const card=['N','NE','E','SE','S','SW','W','NW'][Math.round(b/45)%8];
  const ticks=Array.from({length:72},(_,i)=>{const a=i*5,l=i%18===0?14:i%2===0?8:4;return`<line x1="150" y1="${22}" x2="150" y2="${22+l}" transform="rotate(${a} 150 150)" stroke="var(--muted)" stroke-width="${i%18===0?2:1}"/>`}).join('');
  app.innerHTML=`
   <div class="card loc" style="margin-top:16px"><b>📍 ${esc(LOC.name)}</b><button class="btn" id="chg">Change</button></div>
   <div class="card" style="text-align:center">
     <svg class="dial" id="qDial" viewBox="0 0 300 300">
       <g id="roseAll" style="transition:transform .15s ease-out;transform-origin:150px 150px">
       <circle cx="150" cy="150" r="134" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/>${ticks}
       ${['N','E','S','W'].map((t,i)=>`<text x="150" y="58" text-anchor="middle" font-size="18" font-weight="600" fill="${t==='N'?'#c0392b':'var(--muted)'}" transform="rotate(${i*90} 150 150)" font-family="Inter,sans-serif">${t}</text>`).join('')}
       <g transform="rotate(${b.toFixed(1)} 150 150)">
         <line x1="150" y1="150" x2="150" y2="62" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>
         <path d="M150 44 L162 70 L138 70 Z" fill="var(--accent)"/>
         <g transform="translate(150 30) rotate(${(-b).toFixed(1)})"><rect x="-11" y="-11" width="22" height="22" rx="2" fill="#1d1d1d"/><rect x="-11" y="-5" width="22" height="3.5" fill="#d4b06a"/></g>
       </g>
       </g>
       <circle cx="150" cy="150" r="7" fill="var(--accent)"/>
       ${window.NH?'<path d="M150 4 L158 18 L142 18 Z" fill="var(--ink)"/>':''}
     </svg>
     ${window.NH?`<div id="qStatus" class="qstat">Hold your phone flat…</div>
     <button class="btn pri" id="qStart" style="margin:6px 0 4px" hidden>Try again</button>
     <div class="hint">Qibla ${b.toFixed(1)}° ${card} from true North · Makkah ${Math.round(km).toLocaleString()} km</div>`:`<div class="qdeg">${b.toFixed(1)}° <span style="font-size:20px;color:var(--muted)">${card}</span></div>
     <div class="hint">clockwise from true North · Makkah is ${Math.round(km).toLocaleString()} km away</div>`}
   </div>
   ${dediHTML()}
   ${window.NH?'':`<div class="card hint"><b style="color:var(--ink)">How to use it:</b> open your phone's Compass app, turn until it reads <b>${Math.round(b)}°</b> — you're then facing the Qibla. (A web page can't read your phone's compass sensor, so this dial doesn't turn by itself.)</div>`}`;
  if(window.NH){$('qStart').onclick=()=>NH.startCompass(b);setTimeout(()=>{if($('roseAll'))NH.startCompass(b)},150)}
  $('chg').onclick=()=>{editing=true;renderQibla()};
}

/* ================= routing hook ================= */
/* ================= SHIA CALENDAR ================= */
const EVT=JSON.parse(document.getElementById('evdata').textContent); // [ 'MM-DD', color(1 joy,0 grief,2 other), en, urTitle, urContent ]
const HM=['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhul Qadah','Dhul Hijjah'];
const HMU=['محرم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'];
let hAdj=store.get('hAdj',0);
const HFMT=(()=>{for(const c of ['islamic-umalqura','islamic-civil','islamic']){try{const f=new Intl.DateTimeFormat('en-u-ca-'+c,{day:'numeric',month:'numeric',year:'numeric',timeZone:'UTC'});
  const p=f.formatToParts(new Date(Date.UTC(2026,10,3)));if(p.find(x=>x.type==='month'))return f}catch(e){}}return null})();
function hijri(y,m,d){ // civil date -> {d,m,y}
  if(!HFMT)return null;const dt=new Date(Date.UTC(y,m-1,d+hAdj));const p={};
  HFMT.formatToParts(dt).forEach(x=>p[x.type]=x.value);
  return{d:parseInt(p.day),m:parseInt(p.month),y:parseInt((p.year||p.relatedYear||'0').replace(/\D/g,''))}}
const civ=dt=>[dt.getFullYear(),dt.getMonth()+1,dt.getDate()];
function hijriToday(){const [y,m,d]=civ(new Date());return hijri(y,m,d)}
const evKey=h=>String(h.m).padStart(2,'0')+'-'+String(h.d).padStart(2,'0');
function eventsOn(h){return EVT.filter(e=>e[0]===evKey(h))}
const evTitle=e=>e[2].split('\n')[0];
function hijriStr(h){return h?`${h.d} ${HM[h.m-1]} ${h.y} AH`:''}
function upcoming(n,days){const out=[];const t=new Date();
  for(let i=0;i<days&&out.length<n;i++){const dt=new Date(t.getFullYear(),t.getMonth(),t.getDate()+i);const h=hijri(...civ(dt));if(!h)break;
    eventsOn(h).forEach(e=>out.push({dt,h,e,i}))}return out.slice(0,n)}
let calStart=null,calSel=null;
function monthStart(dt){ // civil Date of the 1st of the hijri month containing dt
  let d=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate());
  for(let i=0;i<31;i++){const h=hijri(...civ(d));if(h.d===1)return d;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1)}return d}
function gMonthDays(st){const days=[];let d=new Date(st.getFullYear(),st.getMonth(),1);while(d.getMonth()===st.getMonth()){days.push({dt:new Date(d),h:hijri(...civ(d))});d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)}return days}
function hSpan(days,ur){const a=days[0].h,b=days[days.length-1].h,N=ur?HMU:HM;
  return a.m===b.m?`${N[a.m-1]} ${a.y}${ur?'ھ':''}`:`${N[a.m-1]}${a.y!==b.y?' '+a.y:''} – ${N[b.m-1]} ${b.y}${ur?'ھ':''}`}
function renderCalendar(){
  setHeader('Calendar',true);noJump();
  if(!HFMT){app.innerHTML='<div class="empty">This browser cannot show Islamic dates.</div>';return}
  if(!calStart){const n=new Date();calStart=new Date(n.getFullYear(),n.getMonth(),1)}
  const days=gMonthDays(calStart);
  const today=civ(new Date()).join('-'),lead=calStart.getDay();
  const gm=calStart.toLocaleDateString([], {month:'long',year:'numeric'});
  const cells=Array(lead).fill('<div></div>').concat(days.map(x=>{const ev=eventsOn(x.h),k=civ(x.dt).join('-');
    const cls=ev.length?(ev.some(e=>e[1]===0)?' grief':ev.some(e=>e[1]===1)?' joy':' other'):'';
    return `<button class="cday${cls}${k===today?' today':''}${calSel===k?' sel':''}" data-cd="${k}"><b>${x.dt.getDate()}</b><small>${x.h.d}</small>${ev.length?'<i></i>':''}</button>`}));
  const sel=calSel?days.find(x=>civ(x.dt).join('-')===calSel):null;
  const evHTML=x=>eventsOn(x.h).map(e=>`<div class="ev ${e[1]===1?'joy':e[1]===0?'grief':'other'}"><div class="evd">${x.h.d} ${HM[x.h.m-1]} · ${x.dt.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})}</div>
      <div class="evt">${esc(e[2]).replace(/\n+/g,'<br>')}</div>${e[4]?`<div class="evu">${esc(e[4]).replace(/\n+/g,'<br>')}</div>`:''}</div>`).join('');
  app.innerHTML=`
   <div class="calhead"><button class="btn" id="cPrev" aria-label="Previous month">‹</button>
     <div style="flex:1;text-align:center"><b style="font-size:19px">${gm}</b><div style="color:var(--accent);font-size:14px;font-weight:600;margin-top:2px">${hSpan(days)}</div><div style="font-family:'Noto Nastaliq Urdu',serif;color:var(--muted);line-height:2;font-size:14px">${hSpan(days,1)}</div></div>
     <button class="btn" id="cNext" aria-label="Next month">›</button></div>
   <div class="calgrid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<div class="wd">${w}</div>`).join('')}${cells.join('')}</div>
   <div class="legend"><span><i class="joy"></i>Birth / Eid</span><span><i class="grief"></i>Martyrdom / mourning</span><span><i class="other"></i>Other</span></div>
   ${sel?`<div class="card">${eventsOn(sel.h).length?evHTML(sel):`<div class="hint">${sel.h.d} ${HM[sel.h.m-1]} · no listed occasion</div>`}</div>`:''}
   <div class="tlabel" style="margin:16px 4px 6px">Occasions this month</div>
   ${days.filter(x=>eventsOn(x.h).length).map(evHTML).join('')||'<div class="hint">No listed occasions this month.</div>'}
   <div class="card" style="margin-top:16px"><b>Moon-sighting adjustment</b>
     <div class="hint" style="margin:4px 0 10px">Islamic months start with the sighting of the new moon, so your local Shia centre may be a day ahead of or behind this calendar. Adjust it to match.</div>
     <div class="sizer"><button id="hM">−1</button><div style="flex:1;text-align:center;font-weight:600">${hAdj>0?'+':''}${hAdj} day${Math.abs(hAdj)===1?'':'s'} · today is ${hijriStr(hijriToday())}</div><button id="hP">+1</button></div></div>
`;
  $('cPrev').onclick=()=>{calStart=new Date(calStart.getFullYear(),calStart.getMonth()-1,1);calSel=null;renderCalendar()};
  $('cNext').onclick=()=>{calStart=new Date(calStart.getFullYear(),calStart.getMonth()+1,1);calSel=null;renderCalendar()};
  app.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{calSel=calSel===b.dataset.cd?null:b.dataset.cd;renderCalendar()});
  const setAdj=v=>{hAdj=Math.max(-2,Math.min(2,v));store.set('hAdj',hAdj);calStart=null;renderCalendar()};
  $('hM').onclick=()=>setAdj(hAdj-1);$('hP').onclick=()=>setAdj(hAdj+1);
}

/* month grid on the Today screen */
let tSel=null;
function todayCal(){
  const el=$('tcal');if(!el)return;
  const n0=new Date(),st=new Date(n0.getFullYear(),n0.getMonth(),1),days=gMonthDays(st);
  const today=civ(new Date()).join('-');
  if(!tSel){const nx=days.find(x=>civ(x.dt).join('-')>=today&&eventsOn(x.h).length);tSel=nx?civ(nx.dt).join('-'):today}
  const gm=hSpan(days);
  const cells=Array(st.getDay()).fill('<div></div>').concat(days.map(x=>{const ev=eventsOn(x.h),k=civ(x.dt).join('-');
    const cls=ev.length?(ev.some(e=>e[1]===0)?' grief':ev.some(e=>e[1]===1)?' joy':' other'):'';
    return `<button class="cday${cls}${k===today?' today':''}${tSel===k?' sel':''}" data-td="${k}"><b>${x.dt.getDate()}</b><small>${x.h.d}</small>${ev.length?'<i></i>':''}</button>`}));
  const sel=days.find(x=>civ(x.dt).join('-')===tSel);
  const evs=sel?eventsOn(sel.h):[];
  el.innerHTML=`<div style="display:flex;align-items:center"><div style="flex:1"><div class="tlabel">${st.toLocaleDateString([], {month:'long',year:'numeric'})}</div><small class="hint">${gm}</small></div><a href="#calendar" class="btn" style="font-size:13px;padding:7px 11px">Full calendar ›</a></div>
    <div class="calgrid" style="margin-top:10px">${['S','M','T','W','T','F','S'].map(w=>`<div class="wd">${w}</div>`).join('')}${cells.join('')}</div>
    ${sel?`<div class="tcalev">${evs.length?evs.map(e=>`<div class="ev ${e[1]===1?'joy':e[1]===0?'grief':'other'}"><div class="evd">${sel.h.d} ${HM[sel.h.m-1]} · ${sel.dt.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})}${civ(sel.dt).join('-')===today?' · today':''}</div><div class="evt">${esc(evTitle(e))}</div></div>`).join(''):`<div class="hint" style="padding:8px 2px">${sel.h.d} ${HM[sel.h.m-1]} · no listed occasion</div>`}</div>`:''}`;
  el.querySelectorAll('[data-td]').forEach(b=>b.onclick=()=>{tSel=b.dataset.td;todayCal()});
}

/* ================= TODAY / AYAH OF THE DAY ================= */
// Hand-picked verses (surah, first verse, last verse) – shown one per day, same for everyone on a given date.
const DAILY=[[94,5,6],[13,28,28],[2,286,286],[2,153,153],[65,3,3],[39,53,53],[2,186,186],[3,139,139],[9,40,40],[20,114,114],
 [29,69,69],[40,60,60],[2,152,152],[93,3,5],[21,87,87],[3,173,173],[8,46,46],[14,7,7],[17,24,24],[25,63,63],
 [49,13,13],[3,8,8],[2,201,201],[6,162,162],[33,56,56],[42,23,23],[5,55,55],[33,33,33],[76,8,9],[13,11,11],
 [16,128,128],[39,10,10],[31,17,17],[7,56,56],[2,45,46],[3,103,103],[64,11,11],[65,2,2],[50,16,16],[57,4,4],
 [2,115,115],[12,87,87],[15,99,99],[20,25,28],[3,190,191],[2,255,255],[24,35,35],[59,22,22],[112,1,4],[55,13,13],
 [11,6,6],[28,88,88],[16,97,97],[3,92,92],[2,177,177],[4,36,36],[18,10,10],[27,62,62],[35,15,15],[89,27,30]];
function dayIndex(){const d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)}
function ayahOfDay(){const [s,a,b]=DAILY[dayIndex()%DAILY.length];return{s,a,b}}
const WEEK_DUAS={2:['dua-tawassul'],4:['dua-kumayl','ziyarat-warith'],5:['dua-nudba']};
function renderToday(){
  setHeader('Today',false);
  const now=new Date();let dstr='';try{dstr=now.toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'})}catch(e){}
  const A=ayahOfDay(),ref=A.a===A.b?`${A.s}:${A.a}`:`${A.s}:${A.a}–${A.b}`;
  const vs=[];for(let v=A.a;v<=A.b;v++)vs.push(v);
  const ar=vs.map(v=>`${Q.ARX()[A.s-1][v-1]} <span class="end">${Q.endMark(v)}</span>`).join(' ');
  const en=vs.map(v=>EN[A.s-1][v-1]).join(' '),ur=vs.map(v=>UR[A.s-1][v-1]).join(' ');
  let pr='';
  if(LOC){const T=timesFor(LOC,now),np=nextPrayer();
    pr=`<a class="tcard prayer-card" href="#prayer"><div class="tlabel">${esc(LOC.name)}</div>
      <div class="tbig">${np?np.n:''} <span>${np?fmt(LOC,np.t):''}</span></div><div class="tsub" id="todayCd"></div>
      <div class="prow">${PR.filter(p=>p[3]).map(([k,n])=>`<div class="pc${np&&np.k===k?' nx':''}"><small>${n}</small><b>${fmt(LOC,T[k]).replace(/\s*([AaPp]\.?\s?[Mm]\.?)$/,'<i>$1</i>')}</b></div>`).join('')}</div></a>`;
  } else pr=`<a class="tcard" href="#prayer"><div class="tlabel">Prayer times</div><div class="tsub">Choose your city to see today's prayer times and azan alerts ›</div></a>`;
  const last=Q.S.last;
  const dow=now.getDay(), todays=['dua-e-ahad',...(WEEK_DUAS[dow]||[]),'ziyarat-ashura','ziyarat-waritha'];
  const ht=HFMT?hijriToday():null, tev=ht?eventsOn(ht):[], up=HFMT?upcoming(4,60).filter(x=>x.i>0).slice(0,3):[];
  app.innerHTML=`<div class="hero" style="padding-top:18px"><p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase">${esc(dstr)}</p>
     ${ht?`<a href="#calendar" style="display:block;margin-top:4px"><b style="font-size:17px;color:var(--accent)">${hijriStr(ht)}</b> <span style="font-family:'Noto Nastaliq Urdu',serif;color:var(--muted)">${ht.d} ${HMU[ht.m-1]}</span></a>`:''}</div>
   ${tev.map(e=>`<a class="ev ${e[1]===1?'joy':e[1]===0?'grief':'other'}" href="#calendar" style="display:block"><div class="evd">Today</div><div class="evt">${esc(e[2]).replace(/\n+/g,'<br>')}</div></a>`).join('')}
   ${pr}
   <div class="tcard ayah-card">
     <div class="tlabel">Ayah of the day · ${esc(META[A.s-1][1])} ${ref}</div>
     <div class="v-ar" style="text-align:center;margin:8px 0 10px">${ar}</div>
     <div class="v-en" style="text-align:center">${esc(en)}</div>
     <div class="v-ur qur" style="text-align:center;margin-top:6px">${esc(ur)}</div>
     <div class="tact"><button class="listen" id="ayPlay">${Q.icon?'':''}▶ Listen</button><a class="btn" href="#surah-${A.s}-${A.a}">Open in Quran</a><button class="btn" id="ayCopy">Copy</button></div>
   </div>
   ${last?`<a class="continue" href="#surah-${last.s}-${last.v}"><div style="flex:1"><small>Continue reading</small><b>${esc(META[last.s-1][1])} · Verse ${last.v}</b></div>›</a>`:''}
   ${HFMT?`<div class="tcard tcal" id="tcal"></div>`:''}
   <div class="tlabel" style="margin:18px 4px 8px">For today</div>
   <div class="list">${todays.map(id=>{const d=LIST.find(x=>x.id===id);return d?`<a class="item dua-item" href="#dua-${d.id}"><div class="t"><b>${esc(d.name)}</b><small>${esc(d.sub)}</small></div></a>`:''}).join('')}</div>
   ${dediHTML()}
   ${window.NH?`<div class="card hint" style="margin-top:16px"><b style="color:var(--ink)">Widgets:</b> add the Next Prayer and Ayah of the Day widgets to your home or lock screen — touch and hold an empty spot, tap <b>+</b> (iPhone) or <b>Widgets</b> (Android), and search “Quran & Duas”.</div>`:`<div class="card hint" style="margin-top:16px"><b style="color:var(--ink)">Widgets:</b> lock-screen and home-screen widgets need an app installed from the App Store, so this web app can't add one. This Today page shows the same things — next prayer and the ayah of the day.</div>`}`;
  if($('tcal'))todayCal();
  $('ayPlay').onclick=()=>{Q.playVerse(A.s,A.a)};
  $('ayCopy').onclick=()=>{const t=`${vs.map(v=>Q.ARX()[A.s-1][v-1]).join(' ')}\n\n${en}\n\n${ur}\n— Quran ${ref} (${META[A.s-1][1]})`;
    try{navigator.clipboard.writeText(t).then(()=>toast('Ayah copied'),()=>toast('Copy not allowed here'))}catch(e){toast('Copy not allowed here')}};
  updToday();
}
function updToday(){const el=$('todayCd');if(!el||!LOC)return;const np=nextPrayer();if(!np)return;
  const s=Math.max(0,Math.round((np.t-new Date())/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);
  el.textContent=`Next prayer in ${h?h+' hr ':''}${m} min`}
setInterval(()=>{if(location.hash===''||location.hash==='#today')updToday()},20000);

window.XR=function(h){
  if(h===''||h==='today'){renderToday();return true}
  if(h==='calendar'){renderCalendar();return true}
  if(h!=='prayer'&&h!=='qibla')editing=false;
  if(h==='duas'){renderDuas();return true}
  if(h.startsWith('duas-')){renderDuas(h.slice(5));return true}
  if(h.startsWith('dua-'))return renderDua(h.slice(4));
  if(h==='prayer'){renderPrayer();return true}
  if(h==='qibla'){renderQibla();return true}
  return false;
};
setInterval(tick,1000);
window.QX={meritsHTML,autoLocate,locateMe,get LOC(){return LOC},get ALERTS(){return ALERTS},timesFor,PR,nextPrayer,fmt,DAILY,LIST,UD,DU,slotFor,get AZ(){return AZ},playAlert,stopAlert,hijriToday:()=>HFMT?hijriToday():null,hijriStr,eventsOn,evTitle,HMU,HM};
})();
