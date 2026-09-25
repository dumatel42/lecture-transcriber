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
  'Hari-bhakti-vilāsa',
  'Laghu-bhāgavatāmṛta',
  'Bhakti-sandarbha',
  'Tattva-sandarbha',
  'Kṛṣṇa-sandarbha',
  'Mādhurya-kādambinī',
  'Prema-sampuṭa',
  'Brahma-sūtra (Vedānta-sūtra)',
  'Śrī Īśopaniṣad',
  'Katha Upaniṣad',
  'Bṛhad-āraṇyaka Upaniṣad',
  'Gopāla-tāpanī Upaniṣad',
  'Śvetāśvatara Upaniṣad',
  'Muṇḍaka Upaniṣad'
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
  { term: 'citta', proper: false },
  { term: 'saṁskāra', proper: false },
  { term: 'saṁskāras', proper: false },
  { term: 'vṛtti', proper: false },
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
  { term: 'saṅkīrtana', proper: false },
  { term: 'māyāvāda', proper: false },
  { term: 'vivartavāda', proper: false },
  { term: 'pariṇāmavāda', proper: false },
  { term: 'mādhurya', proper: false },
  { term: 'audārya', proper: false }
];

export interface SoundAlikeEntry {
  misheard: string;
  canonical: string;
  category: string;
}

export const TOP_60_SOUND_ALIKES: SoundAlikeEntry[] = [
  { misheard: 'giver / diva / deva', canonical: 'jīva / jīva-tattva', category: 'Ontology' },
  { misheard: 'sudden / southern / sadana', canonical: 'sādhana / sādhana-bhakti', category: 'Practice' },
  { misheard: 'car-treat-well / cartrita / kaatrita', canonical: 'kartṛtva', category: 'Agency' },
  { misheard: 'natural / gyatrita / jnatrita', canonical: 'jñātṛtva', category: 'Knowing' },
  { misheard: 'bokhtrita / boxtrita', canonical: 'bhoktṛtva', category: 'Experiencing' },
  { misheard: 'another novelty / anartha novelty', canonical: 'anartha-nivṛtti', category: 'Stages of Bhakti' },
  { misheard: 'shudder / shadow', canonical: 'śraddhā', category: 'Stages of Bhakti' },
  { misheard: 'shadow song / sadu sanga', canonical: 'sādhu-saṅga', category: 'Stages of Bhakti' },
  { misheard: 'virgin Korea / bhajan Korea', canonical: 'bhajana-kriyā', category: 'Stages of Bhakti' },
  { misheard: 'nesta / nishta', canonical: 'niṣṭhā', category: 'Stages of Bhakti' },
  { misheard: 'rookie / ruchi', canonical: 'ruci', category: 'Stages of Bhakti' },
  { misheard: 'a sock tea / asakti', canonical: 'āsakti', category: 'Stages of Bhakti' },
  { misheard: 'bava / power', canonical: 'bhāva / bhāva-bhakti', category: 'Stages of Bhakti' },
  { misheard: 'primer / prayer', canonical: 'prema / prema-bhakti', category: 'Stages of Bhakti' },
  { misheard: 'Venus / Venice / guna', canonical: 'guṇas', category: 'Modes of Nature' },
  { misheard: 'some banda / sambanda', canonical: 'sambandha / sambandha-jñāna', category: 'Philosophy' },
  { misheard: 'abidaya / abhideya', canonical: 'abhidheya', category: 'Philosophy' },
  { misheard: 'proyojon / prayojan', canonical: 'prayojana', category: 'Philosophy' },
  { misheard: 'some scars / scar', canonical: 'saṁskāra / saṁskāras', category: 'Mind' },
  { misheard: 'another city / ananyata', canonical: 'ananyathā-upapatti / ananyathā-siddha', category: 'Logic' },
  { misheard: 'viper lips / vipralipsa', canonical: 'vipralipsā', category: 'Cognitive Defects' },
  { misheard: 'promada / paramada', canonical: 'pramāda', category: 'Cognitive Defects' },
  { misheard: 'Karan apatava', canonical: 'kāraṇāpāṭava', category: 'Cognitive Defects' },
  { misheard: 'sadrisya brahma / brahma', canonical: 'bhrama / sādṛśya-bhrama', category: 'Cognitive Defects' },
  { misheard: 'a cinta beta beta', canonical: 'acintya-bhedābheda', category: 'Theology' },
  { misheard: 'onomatodoxy', canonical: 'onomatodoxy / śabda-brahman', category: 'Theology' },
  { misheard: 'guru tatva', canonical: 'guru-tattva', category: 'Theology' },
  { misheard: 'hari katha', canonical: 'hari-kathā', category: 'Practice' },
  { misheard: 'sankirtan / kirtan', canonical: 'saṅkīrtana / kīrtana', category: 'Practice' },
  { misheard: 'maya vada', canonical: 'māyāvāda', category: 'Philosophy' },
  { misheard: 'vivarta vada', canonical: 'vivartavāda', category: 'Philosophy' },
  { misheard: 'parinama vada', canonical: 'pariṇāmavāda', category: 'Philosophy' },
  { misheard: 'sat cit ananda', canonical: 'sat-cit-ānanda', category: 'Ontology' },
  { misheard: 'upanishad', canonical: 'Upaniṣad', category: 'Scripture' },
  { misheard: 'raganuga / vaidhi', canonical: 'rāgānugā / vaidhī-bhakti', category: 'Practice' },
  { misheard: 'madhurya / audarya', canonical: 'mādhurya / audārya', category: 'Theology' },
  { misheard: 'prana / cetana', canonical: 'prāṇa / cetanā', category: 'Mind' },
  { misheard: 'manas / buddhi / ahankara', canonical: 'manas / buddhi / ahaṅkāra', category: 'Mind' },
  { misheard: 'abhinivesha', canonical: 'abhiniveśa', category: 'Mind' }
];
