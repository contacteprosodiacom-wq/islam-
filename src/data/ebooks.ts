import { Ebook } from '../types';

export const ebooks: Ebook[] = [
  {
    id: "prophetic-stories-aboubakar",
    title: {
      fr: "Histoires & Enseignements — Un voyage sublime au cœur des récits prophétiques",
      en: "Prophetic Stories & Wisdoms — A sublime journey into prophetic narrations",
      ar: "قصص وعبر نبوية — رحلة غامرة في فقه المأثور"
    },
    description: {
      fr: "Ouvrage complet inspiré de nos meilleures séries YouTube. Apprenez de la patience d'Ayyoub, la foi de Moussa et le caractère de Muhammad ﷺ.",
      en: "Comprehensive work inspired by our finest YouTube lectures. Draw gems from Jacob's patience, Moses' faith, and Muhammad's final character ﷺ.",
      ar: "مصنف فريد مستوحى من أفضل سلاسلنا على اليوتيوب. يعلمك الصبر من أيوب، واليقين من موسى، وكمال الأخلاق من محمد ﷺ."
    },
    author: "Aboubakar",
    isFree: false,
    price: 15,
    badge: {
      fr: "Soutien",
      en: "Support",
      ar: "مساندة ووقف"
    },
    category: "histoire"
  },
  {
    id: "cinq-piliers-guide",
    title: {
      fr: "Le Guide Pratique Illustré des 5 Piliers de l'Islam",
      en: "The Practical Illustrated Guide to the 5 Pillars of Islam",
      ar: "الدليل العملي المصور لأركان الإسلام الخمسة"
    },
    description: {
      fr: "Un guide étape par étape pour les débutants et les familles afin de parfaire la prière, comprendre les calculs de Zakat et le jeûne.",
      en: "A step-by-step master guide for beginners and households to perfect prayer, comprehend Zakat figures, and perform Siyam easily.",
      ar: "دليل توضيحي شامل للناشئة والأسر لتعلم صفة الصلاة الصحيحة، وفقه الصيام، وحساب نصاب الزكاة الشرعية بأيسر الطرق."
    },
    author: "Aboubakar",
    isFree: true,
    badge: {
      fr: "Gratuit",
      en: "Free",
      ar: "مجاني"
    },
    category: "fiqh"
  },
  {
    id: "douas-quotidiennes-forteresse",
    title: {
      fr: "La Forteresse du Cœur : 40 Invocations Essentielles du Matin et du Soir",
      en: "Fortress of the Heart: 40 Essential Morning & Evening Adhkar",
      ar: "حصن القلب: الأذكار والأدعية اليومية الأربعون المستحبة في الصباح والمساء"
    },
    description: {
      fr: "Recueil d'invocations authentiques écrites en arabe de haute lisibilité avec translittération phonétique et traduction en français.",
      en: "Compendium of authentic prophetic invocations with clear Arabic typography, phonetic transliteration, and direct English translation.",
      ar: "كتيب يضم الأدعية والتعقيبات النبوية الثابتة في الصباح والمساء مكتوبة بخط أميري مريح لتسهل المداومة عليها وقراءتها."
    },
    author: "Aboubakar",
    isFree: true,
    badge: {
      fr: "Gratuit",
      en: "Free",
      ar: "مجاني"
    },
    category: "spiritualite"
  },
  {
    id: "coran-meditation-methode",
    title: {
      fr: "Méditer le Coran : Méthodes & Secrets (Tadabbour)",
      en: "Contemplating the Quran: Methods & Secrets of Tadabbur",
      ar: "منهجية تدبر القرآن الكريم: القواعد والخطوات (تدبر)"
    },
    description: {
      fr: "Conseils pratiques pour se connecter profondément avec le message divin au-delà d'une simple mémorisation mécanique.",
      en: "Practical techniques to establish deep connection with the Divine message beyond standard mechanical repetitive reading.",
      ar: "إضاءات سلوكية وقواعد مفيدة تساعد المسلم على العيش في ظلال الآيات وتجاوز القراءة السطحية للحفظ المتدبر."
    },
    author: "Aboubakar",
    isFree: false,
    price: 10,
    badge: {
      fr: "Soutien",
      en: "Support",
      ar: "مساندة ووقف"
    },
    category: "coran"
  }
];
