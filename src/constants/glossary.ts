/**
 * Canonical Gaudiya Vaishnava Glossary & Editorial Reference
 * Used for terminology validation, punctuation, and IAST formatting.
 */

export interface VaishnavaGlossaryEntry {
  term: string;
  iast: string;
  category: 'acharya' | 'concept' | 'scripture' | 'mantra';
  isProperNoun: boolean;
  definitionRu?: string;
  definitionEn?: string;
}

export const CANONICAL_ACHARYAS = [
  'Śrī Caitanya Mahāprabhu',
  'Śrī Nityānanda Prabhu',
  'Śrī Advaita Ācārya',
  'Śrī Gadādhara Paṇḍita',
  'Śrīvāsa Ṭhākura',
  'Śrīla Rūpa Gosvāmī',
  'Śrīla Sanātana Gosvāmī',
  'Śrīla Jīva Gosvāmī',
  'Śrīla Raghunātha dāsa Gosvāmī',
  'Śrīla Raghunātha Bhaṭṭa Gosvāmī',
  'Śrīla Gopāla Bhaṭṭa Gosvāmī',
  'Śrīla Kṛṣṇadāsa Kavirāja Gosvāmī',
  'Śrīla Narottama dāsa Ṭhākura',
  'Śrīla Viśvanātha Cakravartī Ṭhākura',
  'Śrīla Baladeva Vidyābhūṣaṇa',
  'Śrīla Bhaktivinoda Ṭhākura',
  'Śrīla Gaura Kiśora dāsa Bābājī Mahārāja',
  'Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda',
  'Śrīla Bhakti Prajñāna Keśava Gosvāmī Mahārāja',
  'Śrīla Bhaktivedānta Svāmī Prabhupāda',
  'Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja (Śrīla Gurudeva)'
];

export const CANONICAL_SCRIPTURES = [
  'Bhagavad-gītā',
  'Śrīmad-Bhāgavatam',
  'Śrī Caitanya-caritāmṛta',
  'Śrī Caitanya-bhāgavata',
  'Brahma-saṁhitā',
  'Bhakti-rasāmṛta-sindhu',
  'Ujjvala-nīlamaṇi',
  'Jaiva-dharma',
  'Brahma-sūtra (Vedānta-sūtra)',
  'Śrī Īśopaniṣad',
  'Katha Upaniṣad',
  'Bṛhad-āraṇyaka Upaniṣad',
  'Gopāla-tāpanī Upaniṣad'
];

export const CANONICAL_TERMS_IAST = [
  // Core ontology
  { term: 'jīva', proper: false },
  { term: 'jīva-tattva', proper: false },
  { term: 'ātman', proper: false },
  { term: 'paramātman', proper: true },
  { term: 'bhagavān', proper: true },
  { term: 'brahman', proper: true },
  { term: 'prakṛti', proper: false },
  { term: 'māyā', proper: false },
  { term: 'sat-cit-ānanda', proper: false },
  { term: 'svarūpa', proper: false },
  { term: 'sambandha', proper: false },
  { term: 'abhidheya', proper: false },
  { term: 'prayojana', proper: false },
  // Faculties of consciousness
  { term: 'jñātṛtva', proper: false },
  { term: 'kartṛtva', proper: false },
  { term: 'bhoktṛtva', proper: false },
  { term: 'cetanā', proper: false },
  // Epistemology & 4 defects
  { term: 'kāraṇāpāṭava', proper: false },
  { term: 'vipralipsā', proper: false },
  { term: 'pramāda', proper: false },
  { term: 'bhrama', proper: false },
  { term: 'sādṛśya-bhrama', proper: false },
  { term: 'ananyathā-siddha', proper: false },
  { term: 'ananyathā-upapatti', proper: false },
  // Gunas & mind
  { term: 'guṇa', proper: false },
  { term: 'guṇas', proper: false },
  { term: 'sattva-guṇa', proper: false },
  { term: 'rajo-guṇa', proper: false },
  { term: 'tamo-guṇa', proper: false },
  { term: 'śuddha-sattva', proper: false },
  { term: 'manas', proper: false },
  { term: 'buddhi', proper: false },
  { term: 'ahaṅkāra', proper: false },
  { term: 'saṁskāra', proper: false },
  { term: 'saṁskāras', proper: false },
  { term: 'prāṇa', proper: false },
  { term: 'abhiniveśa', proper: false },
  // Devotional practice & philosophy
  { term: 'bhakti', proper: false },
  { term: 'prema', proper: false },
  { term: 'sādhana', proper: false },
  { term: 'sādhana-bhakti', proper: false },
  { term: 'bhāva-bhakti', proper: false },
  { term: 'prema-bhakti', proper: false },
  { term: 'vaidhī-bhakti', proper: false },
  { term: 'rāgānugā-bhakti', proper: false },
  { term: 'darśana', proper: false },
  { term: 'śāstra', proper: false },
  { term: 'guru-tattva', proper: false },
  { term: 'acintya-bhedābheda', proper: false },
  { term: 'harināma', proper: false },
  { term: 'saṅkīrtana', proper: false }
];
