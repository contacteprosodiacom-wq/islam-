import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { EngagementMetric, FirestoreDonation, DonationCampagne } from '../types';

// Collection paths
export const DONATIONS_COLLECTION = 'donations';
export const CAMPAIGNS_COLLECTION = 'donation_campaigns';
export const ENGAGEMENT_COLLECTION = 'engagement_metrics';

// Default initial campaign data
export const DEFAULT_CAMPAIGN_ID = 'ramadan_wells_2026';
export const INITIAL_CAMPAIGN_DATA: DonationCampagne & { title: string } = {
  title: 'Projet Puits d\'eau & Sadaqa Jariya 2026',
  collected: 2450,
  target: 3500,
  donorsCount: 84,
  lastUpdate: new Date().toISOString()
};

// Default seed data for engagement metrics (last 14 days)
export const INITIAL_ENGAGEMENT_METRICS: EngagementMetric[] = [
  { date: '2026-09-08', visits: 1120, pageViews: 3840, quranListens: 640, quizCompletions: 112, articleReads: 420 },
  { date: '2026-09-09', visits: 1240, pageViews: 4120, quranListens: 710, quizCompletions: 135, articleReads: 490 },
  { date: '2026-09-10', visits: 1180, pageViews: 3950, quranListens: 680, quizCompletions: 98, articleReads: 440 },
  { date: '2026-09-11', visits: 1450, pageViews: 5200, quranListens: 920, quizCompletions: 184, articleReads: 610 }, // Vendredi
  { date: '2026-09-12', visits: 1680, pageViews: 5900, quranListens: 1040, quizCompletions: 210, articleReads: 720 },
  { date: '2026-09-13', visits: 1510, pageViews: 5340, quranListens: 980, quizCompletions: 175, articleReads: 650 },
  { date: '2026-09-14', visits: 1320, pageViews: 4480, quranListens: 810, quizCompletions: 140, articleReads: 510 },
  { date: '2026-09-15', visits: 1290, pageViews: 4310, quranListens: 790, quizCompletions: 125, articleReads: 480 },
  { date: '2026-09-16', visits: 1350, pageViews: 4620, quranListens: 830, quizCompletions: 152, articleReads: 540 },
  { date: '2026-09-17', visits: 1410, pageViews: 4890, quranListens: 870, quizCompletions: 164, articleReads: 580 },
  { date: '2026-09-18', visits: 1790, pageViews: 6420, quranListens: 1180, quizCompletions: 230, articleReads: 840 }, // Vendredi
  { date: '2026-09-19', visits: 1850, pageViews: 6710, quranListens: 1240, quizCompletions: 245, articleReads: 890 },
  { date: '2026-09-20', visits: 1620, pageViews: 5820, quranListens: 1090, quizCompletions: 195, articleReads: 710 },
  { date: '2026-09-21', visits: 1480, pageViews: 5140, quranListens: 940, quizCompletions: 168, articleReads: 630 }
];

// Default seed data for individual donations
export const INITIAL_DONATIONS: FirestoreDonation[] = [
  { donorName: 'Myriem B.', donorEmail: 'myriem.b@example.com', amount: 50, project: 'Puits d\'eau Sahel', paymentStatus: 'completed', createdAt: '2026-09-21T14:30:00Z' },
  { donorName: 'Karim Z.', donorEmail: 'karim.z@example.com', amount: 100, project: 'Sadaqa Jariya 2026', paymentStatus: 'completed', createdAt: '2026-09-21T10:15:00Z' },
  { donorName: 'Anonyme (Fi Sabilillah)', donorEmail: 'anon@sadaqa.org', amount: 200, project: 'Distribution Coran & Livres', paymentStatus: 'completed', createdAt: '2026-09-20T19:40:00Z' },
  { donorName: 'Youssef & Famille', donorEmail: 'youssef@example.com', amount: 75, project: 'Puits d\'eau Sahel', paymentStatus: 'completed', createdAt: '2026-09-19T16:20:00Z' },
  { donorName: 'Sarah K.', donorEmail: 'sarah.k@example.com', amount: 30, project: 'Soutien Orphelins', paymentStatus: 'completed', createdAt: '2026-09-18T11:05:00Z' },
  { donorName: 'Tariq M.', donorEmail: 'tariq.m@example.com', amount: 150, project: 'Puits d\'eau Sahel', paymentStatus: 'completed', createdAt: '2026-09-17T09:12:00Z' },
  { donorName: 'Fatima E.', donorEmail: 'fatima.e@example.com', amount: 40, project: 'Distribution Coran & Livres', paymentStatus: 'completed', createdAt: '2026-09-16T18:45:00Z' },
  { donorName: 'Ibrahim D.', donorEmail: 'ibrahim.d@example.com', amount: 250, project: 'Sadaqa Jariya 2026', paymentStatus: 'completed', createdAt: '2026-09-15T13:22:00Z' }
];

/**
 * Ensures initial Firestore documents exist so the dashboard has rich data to display.
 */
export async function seedInitialFirestoreMetricsIfEmpty(): Promise<void> {
  try {
    // 1. Check campaigns
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, DEFAULT_CAMPAIGN_ID);
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) {
      await setDoc(campaignRef, {
        ...INITIAL_CAMPAIGN_DATA,
        createdAt: serverTimestamp()
      });
    }

    // 2. Check engagement metrics
    const metricsCol = collection(db, ENGAGEMENT_COLLECTION);
    const metricsSnap = await getDocs(query(metricsCol, limit(1)));
    if (metricsSnap.empty) {
      for (const item of INITIAL_ENGAGEMENT_METRICS) {
        await setDoc(doc(db, ENGAGEMENT_COLLECTION, item.date), {
          ...item,
          serverCreatedAt: serverTimestamp()
        });
      }
    }

    // 3. Check donations
    const donationsCol = collection(db, DONATIONS_COLLECTION);
    const donationsSnap = await getDocs(query(donationsCol, limit(1)));
    if (donationsSnap.empty) {
      for (let i = 0; i < INITIAL_DONATIONS.length; i++) {
        const d = INITIAL_DONATIONS[i];
        await setDoc(doc(db, DONATIONS_COLLECTION, `donation_${i + 1}`), {
          ...d,
          serverCreatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.warn('Note: seeding initial metrics encountered an issue (may already be seeded or waiting on auth):', error);
  }
}

/**
 * Subscribe in real time to engagement metrics from Firestore
 */
export function subscribeToEngagementMetrics(
  onUpdate: (metrics: EngagementMetric[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, ENGAGEMENT_COLLECTION), orderBy('date', 'asc'), limit(30));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const metrics: EngagementMetric[] = [];
        snapshot.forEach((d) => {
          metrics.push({ id: d.id, ...d.data() } as EngagementMetric);
        });
        if (metrics.length > 0) {
          onUpdate(metrics);
        } else {
          onUpdate(INITIAL_ENGAGEMENT_METRICS);
        }
      },
      (error) => {
        console.warn('Realtime engagement listener note:', error);
        if (onError) onError(error);
        // Fallback to initial metrics so UI remains functional
        onUpdate(INITIAL_ENGAGEMENT_METRICS);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish engagement listener:', err);
    onUpdate(INITIAL_ENGAGEMENT_METRICS);
    return () => {};
  }
}

/**
 * Subscribe in real time to donations from Firestore
 */
export function subscribeToDonations(
  onUpdate: (donations: FirestoreDonation[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, DONATIONS_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const donations: FirestoreDonation[] = [];
        snapshot.forEach((d) => {
          donations.push({ id: d.id, ...d.data() } as FirestoreDonation);
        });
        if (donations.length > 0) {
          onUpdate(donations);
        } else {
          onUpdate(INITIAL_DONATIONS);
        }
      },
      (error) => {
        console.warn('Realtime donations listener note:', error);
        if (onError) onError(error);
        onUpdate(INITIAL_DONATIONS);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish donations listener:', err);
    onUpdate(INITIAL_DONATIONS);
    return () => {};
  }
}

/**
 * Subscribe to current fundraising campaign from Firestore
 */
export function subscribeToDonationCampaign(
  onUpdate: (campaign: DonationCampagne & { title: string }) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, DEFAULT_CAMPAIGN_ID);
    const unsubscribe = onSnapshot(
      campaignRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as DonationCampagne & { title: string });
        } else {
          onUpdate(INITIAL_CAMPAIGN_DATA);
        }
      },
      (error) => {
        console.warn('Campaign snapshot listener note:', error);
        if (onError) onError(error);
        onUpdate(INITIAL_CAMPAIGN_DATA);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish campaign listener:', err);
    onUpdate(INITIAL_CAMPAIGN_DATA);
    return () => {};
  }
}

/**
 * Helper to record a new donation to Firestore
 */
export async function addDonationToFirestore(donation: Omit<FirestoreDonation, 'createdAt'>): Promise<string> {
  const path = DONATIONS_COLLECTION;
  try {
    const newDonation: FirestoreDonation = {
      ...donation,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, path), {
      ...newDonation,
      serverCreatedAt: serverTimestamp()
    });

    // Also update campaign totals
    try {
      const campaignRef = doc(db, CAMPAIGNS_COLLECTION, DEFAULT_CAMPAIGN_ID);
      const snap = await getDoc(campaignRef);
      if (snap.exists()) {
        const cur = snap.data() as DonationCampagne;
        await setDoc(campaignRef, {
          ...cur,
          collected: (cur.collected || 0) + donation.amount,
          donorsCount: (cur.donorsCount || 0) + 1,
          lastUpdate: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Campaign update note:', e);
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
