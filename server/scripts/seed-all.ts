import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/database/schema";
import { eq, sql, inArray } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// --- User config ---
const ADMIN_EMAILS = ["tejasimma033@gmail.com", "sailakshmiborra4104@gmail.com"];

// --- Exams & Specialties ---
interface SpecialtyDef {
  en: string;
  es: string;
}
interface ExamDef {
  slug: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  sortOrder: number;
  specialties: SpecialtyDef[];
}

const examsData: ExamDef[] = [
  {
    slug: "enurm",
    name: { en: "ENURM", es: "ENURM" },
    description: { en: "Examen Nacional Único de Residencias Médicas (Latin America)", es: "Examen Nacional Único de Residencias Médicas (Latinoamérica)" },
    sortOrder: 0,
    specialties: [
      { en: "ENURM Basic Sciences", es: "ENURM Ciencias Básicas" },
      { en: "ENURM Internal Medicine", es: "ENURM Medicina Interna" },
      { en: "ENURM Pediatrics", es: "ENURM Pediatría" },
      { en: "ENURM Surgery", es: "ENURM Cirugía" },
      { en: "ENURM Gynecology and Obstetrics", es: "ENURM Ginecología y Obstetricia" },
      { en: "Anatomy", es: "Anatomía" },
      { en: "Cardiology", es: "Cardiología" },
      { en: "Surgery", es: "Cirugía" },
      { en: "Pharmacology", es: "Farmacología" },
      { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
      { en: "Infectious Diseases", es: "Infectología" },
      { en: "Maxillofacial Surgery", es: "Maxilofacial" },
      { en: "Internal Medicine", es: "Medicina Interna" },
      { en: "Nephro-Urology", es: "Nefro-Urología" },
      { en: "Pulmonology", es: "Neumología" },
      { en: "Neurology", es: "Neurología" },
      { en: "Pediatrics", es: "Pediatría" },
    ],
  },
  {
    slug: "enarm",
    name: { en: "ENARM", es: "ENARM" },
    description: { en: "Examen Nacional de Aspirantes a Residencias Médicas (Mexico)", es: "Examen Nacional de Aspirantes a Residencias Médicas (México)" },
    sortOrder: 1,
    specialties: [
      { en: "ENARM Surgery", es: "ENARM Cirugía" },
      { en: "ENARM Internal Medicine", es: "ENARM Medicina Interna" },
      { en: "ENARM Pediatrics", es: "ENARM Pediatría" },
      { en: "Internal Medicine - ENARM", es: "Medicina Interna - ENARM" },
      { en: "Anatomy", es: "Anatomía" },
      { en: "Cardiology", es: "Cardiología" },
      { en: "Surgery", es: "Cirugía" },
      { en: "Pharmacology", es: "Farmacología" },
      { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
      { en: "Infectious Diseases", es: "Infectología" },
      { en: "Maxillofacial Surgery", es: "Maxilofacial" },
      { en: "Internal Medicine", es: "Medicina Interna" },
      { en: "Nephro-Urology", es: "Nefro-Urología" },
      { en: "Pulmonology", es: "Neumología" },
      { en: "Neurology", es: "Neurología" },
      { en: "Pediatrics", es: "Pediatría" },
    ],
  },
  {
    slug: "mir",
    name: { en: "MIR", es: "MIR" },
    description: { en: "Médico Interno Residente (Spain)", es: "Médico Interno Residente (España)" },
    sortOrder: 2,
    specialties: [
      { en: "Anatomy", es: "Anatomía" },
      { en: "Cardiology", es: "Cardiología" },
      { en: "Surgery", es: "Cirugía" },
      { en: "Pharmacology", es: "Farmacología" },
      { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
      { en: "Infectious Diseases", es: "Infectología" },
      { en: "Maxillofacial Surgery", es: "Maxilofacial" },
      { en: "Internal Medicine", es: "Medicina Interna" },
      { en: "Nephro-Urology", es: "Nefro-Urología" },
      { en: "Pulmonology", es: "Neumología" },
      { en: "Neurology", es: "Neurología" },
      { en: "Pediatrics", es: "Pediatría" },
    ],
  },
  {
    slug: "usmle-step-1",
    name: { en: "USMLE Step 1", es: "USMLE Step 1" },
    description: { en: "United States Medical Licensing Examination Step 1", es: "Examen de Licencia Médica de EE.UU. Step 1" },
    sortOrder: 3,
    specialties: [
      { en: "Anatomy", es: "Anatomía" },
      { en: "Pharmacology", es: "Farmacología" },
    ],
  },
  {
    slug: "usmle-step-2",
    name: { en: "USMLE Step 2 CK", es: "USMLE Step 2 CK" },
    description: { en: "United States Medical Licensing Examination Step 2 Clinical Knowledge", es: "Examen de Licencia Médica de EE.UU. Step 2 Conocimiento Clínico" },
    sortOrder: 4,
    specialties: [
      { en: "Cardiology", es: "Cardiología" },
      { en: "Surgery", es: "Cirugía" },
      { en: "Gynecology and Obstetrics", es: "Ginecología y Obstetricia" },
      { en: "Infectious Diseases", es: "Infectología" },
      { en: "Internal Medicine", es: "Medicina Interna" },
      { en: "Nephro-Urology", es: "Nefro-Urología" },
      { en: "Pulmonology", es: "Neumología" },
      { en: "Neurology", es: "Neurología" },
      { en: "Pediatrics", es: "Pediatría" },
    ],
  },
];

// Flashcards must include ALL specialties for ENURM, ENARM, MIR
const flashcardExamSlugs = ["enurm", "enarm", "mir"];

const questionsData = [
  {
    text: "A 65-year-old male presents with chest pain radiating to the left arm, diaphoresis, and nausea. ECG shows ST-segment elevation in leads V1-V4. Which of the following is the most appropriate immediate treatment?",
    explanation: "ST-segment elevation myocardial infarction (STEMI) requires immediate reperfusion therapy. Primary percutaneous coronary intervention (PCI) within 90 minutes is the gold standard. If PCI is not available within 120 minutes, fibrinolytic therapy should be administered.",
    difficulty: "medium",
    options: [
      { text: "Aspirin and observation", isCorrect: false, sortOrder: 0 },
      { text: "Primary PCI", isCorrect: true, sortOrder: 1 },
      { text: "IV heparin only", isCorrect: false, sortOrder: 2 },
      { text: "Oral nitroglycerin and discharge", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A 3-year-old child presents with fever, cough, and inspiratory stridor. What is the most likely diagnosis?",
    explanation: "Croup (laryngotracheobronchitis) typically presents in children aged 6 months to 3 years with barky cough, inspiratory stridor, and hoarseness. It is most commonly caused by parainfluenza virus.",
    difficulty: "easy",
    options: [
      { text: "Epiglottitis", isCorrect: false, sortOrder: 0 },
      { text: "Croup", isCorrect: true, sortOrder: 1 },
      { text: "Bacterial tracheitis", isCorrect: false, sortOrder: 2 },
      { text: "Foreign body aspiration", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A patient with peptic ulcer disease develops sudden severe epigastric pain, board-like rigidity, and rebound tenderness. What is the most likely complication?",
    explanation: "Perforation of a peptic ulcer leads to peritonitis presenting with sudden severe epigastric pain, board-like rigidity, and rebound tenderness. Free air under the diaphragm on upright chest X-ray confirms the diagnosis.",
    difficulty: "medium",
    options: [
      { text: "Gastric outlet obstruction", isCorrect: false, sortOrder: 0 },
      { text: "Perforation", isCorrect: true, sortOrder: 1 },
      { text: "Hemorrhage", isCorrect: false, sortOrder: 2 },
      { text: "Penetration into pancreas", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "Which of the following is the most common cause of community-acquired pneumonia in adults?",
    explanation: "Streptococcus pneumoniae is the most common cause of community-acquired pneumonia across all age groups. It typically presents with acute onset of fever, productive cough, and lobar consolidation on chest X-ray.",
    difficulty: "easy",
    options: [
      { text: "Mycoplasma pneumoniae", isCorrect: false, sortOrder: 0 },
      { text: "Streptococcus pneumoniae", isCorrect: true, sortOrder: 1 },
      { text: "Haemophilus influenzae", isCorrect: false, sortOrder: 2 },
      { text: "Chlamydia pneumoniae", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A 55-year-old female with rheumatoid arthritis on chronic prednisone therapy presents with acute onset of severe right hip pain. X-ray shows avascular necrosis of the femoral head. What is the most likely contributing factor?",
    explanation: "Chronic corticosteroid use is a well-known risk factor for avascular necrosis (AVN) of the femoral head. The mechanism is thought to involve osteocyte apoptosis and impaired blood flow to the femoral head.",
    difficulty: "hard",
    options: [
      { text: "Calcium deficiency", isCorrect: false, sortOrder: 0 },
      { text: "Corticosteroid use", isCorrect: true, sortOrder: 1 },
      { text: "Rheumatoid arthritis activity", isCorrect: false, sortOrder: 2 },
      { text: "Weight-bearing exercise", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A newborn presents with cyanosis, tachypnea, and a single S2 heart sound. Chest X-ray shows decreased pulmonary vascularity and a boot-shaped heart. What is the most likely diagnosis?",
    explanation: "Tetralogy of Fallot presents with cyanosis, a single S2 (due to overriding aorta), and a boot-shaped heart on X-ray (due to right ventricular hypertrophy). It consists of four defects: VSD, overriding aorta, pulmonary stenosis, and RV hypertrophy.",
    difficulty: "medium",
    options: [
      { text: "Ventricular septal defect", isCorrect: false, sortOrder: 0 },
      { text: "Tetralogy of Fallot", isCorrect: true, sortOrder: 1 },
      { text: "Transposition of great arteries", isCorrect: false, sortOrder: 2 },
      { text: "Patent ductus arteriosus", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "Which laboratory finding is most consistent with nephrotic syndrome?",
    explanation: "Nephrotic syndrome is characterized by massive proteinuria (>3.5g/day), hypoalbuminemia, hyperlipidemia, and edema. The primary abnormality is increased glomerular permeability to proteins.",
    difficulty: "easy",
    options: [
      { text: "Hypoalbuminemia and hyperlipidemia", isCorrect: true, sortOrder: 0 },
      { text: "Hyperalbuminemia and hypolipidemia", isCorrect: false, sortOrder: 1 },
      { text: "Elevated creatinine and BUN", isCorrect: false, sortOrder: 2 },
      { text: "Leukocytosis and fever", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A 45-year-old male presents with episodic severe headaches, palpitations, diaphoresis, and hypertension. 24-hour urine collection shows elevated metanephrines. What is the most likely diagnosis?",
    explanation: "Pheochromocytoma is a catecholamine-secreting tumor of the adrenal medulla. Classic presentation includes episodic hypertension, headache, palpitations, and diaphoresis. Elevated urinary metanephrines and catecholamines confirm the diagnosis.",
    difficulty: "hard",
    options: [
      { text: "Renal artery stenosis", isCorrect: false, sortOrder: 0 },
      { text: "Pheochromocytoma", isCorrect: true, sortOrder: 1 },
      { text: "Cushing syndrome", isCorrect: false, sortOrder: 2 },
      { text: "Primary hyperaldosteronism", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "Which cranial nerve is most commonly affected in Bell's palsy?",
    explanation: "Bell's palsy is an idiopathic peripheral facial nerve palsy affecting CN VII (facial nerve). It presents with sudden onset of unilateral facial weakness, inability to close the eye, and drooping of the mouth corner.",
    difficulty: "easy",
    options: [
      { text: "CN V (Trigeminal)", isCorrect: false, sortOrder: 0 },
      { text: "CN VII (Facial)", isCorrect: true, sortOrder: 1 },
      { text: "CN IX (Glossopharyngeal)", isCorrect: false, sortOrder: 2 },
      { text: "CN XII (Hypoglossal)", isCorrect: false, sortOrder: 3 },
    ],
  },
  {
    text: "A 60-year-old female with type 2 diabetes presents with a painless red eye. Slit-lamp examination shows neovascularization of the iris. What is the most likely complication?",
    explanation: "Neovascularization of the iris (rubeosis iridis) is a complication of proliferative diabetic retinopathy. It can lead to neovascular glaucoma, where new blood vessels block aqueous humor outflow, causing increased intraocular pressure.",
    difficulty: "hard",
    options: [
      { text: "Open-angle glaucoma", isCorrect: false, sortOrder: 0 },
      { text: "Neovascular glaucoma", isCorrect: true, sortOrder: 1 },
      { text: "Cataract formation", isCorrect: false, sortOrder: 2 },
      { text: "Macular edema", isCorrect: false, sortOrder: 3 },
    ],
  },
];

const coursesData = [
  {
    slug: "usmle-step-1-comprehensive",
    title: { en: "USMLE Step 1 Comprehensive Review" },
    description: { en: "Complete coverage of basic sciences for USMLE Step 1 including anatomy, physiology, biochemistry, pharmacology, microbiology, and pathology." },
    shortDescription: { en: "Master basic sciences with expert-led lessons and practice questions" },
    price: "299.99",
    durationDays: 90,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Cardiovascular System" },
        description: { en: "Heart anatomy, cardiac physiology, and cardiovascular pathology" },
        sortOrder: 0,
        lessons: [
          { title: { en: "Cardiac Anatomy and Embryology" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a7/iframe", duration: 1800, content: "Detailed overview of cardiac anatomy including chambers, valves, coronary circulation, and cardiac embryology.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Cardiac Physiology" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/h8i9j0k1l2m3n4o5p6a7b8c9d0e1f2g3/iframe", duration: 2400, content: "Cardiac cycle, hemodynamics, ECG interpretation, and cardiac output regulation.", sortOrder: 1, isFreePreview: false },
        ],
      },
      {
        title: { en: "Respiratory System" },
        description: { en: "Pulmonary anatomy, physiology, and respiratory pathology" },
        sortOrder: 1,
        lessons: [
          { title: { en: "Pulmonary Anatomy" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/c3d4e5f6g7h8i9j0k1l2m3n4o5p6a7b8/iframe", duration: 1500, content: "Upper and lower respiratory tract anatomy, bronchopulmonary segments, and pleural spaces.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Ventilation and Gas Exchange" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/g7h8i9j0k1l2m3n4o5p6a7b8c9d0e1f2/iframe", duration: 2100, content: "Mechanics of breathing, lung volumes, diffusion, and ventilation-perfusion matching.", sortOrder: 1, isFreePreview: false },
        ],
      },
    ],
  },
  {
    slug: "enarm-mexico-preparation",
    title: { en: "ENARM Mexico Preparation Course" },
    description: { en: "Comprehensive preparation for the ENARM exam with focus on Mexican clinical practice guidelines and epidemiology." },
    shortDescription: { en: "Specifically designed for ENARM exam success" },
    price: "199.99",
    durationDays: 120,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Internal Medicine for ENARM" },
        description: { en: "High-yield internal medicine topics for ENARM" },
        sortOrder: 0,
        lessons: [
          { title: { en: "Cardiovascular Diseases in Mexico" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/d4e5f6g7h8i9j0k1l2m3n4o5p6a7b8c9/iframe", duration: 2000, content: "Epidemiology and management of cardiovascular diseases prevalent in the Mexican population.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Diabetes and Metabolic Syndrome" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/i9j0k1l2m3n4o5p6a7b8c9d0e1f2g3h4/iframe", duration: 1800, content: "Management of diabetes and metabolic syndrome according to Mexican clinical guidelines.", sortOrder: 1, isFreePreview: false },
        ],
      },
      {
        title: { en: "Infectious Diseases" },
        description: { en: "Tropical and infectious diseases common in Latin America" },
        sortOrder: 1,
        lessons: [
          { title: { en: "Vector-Borne Diseases" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/iframe", duration: 2200, content: "Dengue, Chikungunya, Zika, and other arboviruses prevalent in Mexico and Latin America.", sortOrder: 0, isFreePreview: true },
        ],
      },
    ],
  },
  {
    slug: "mir-spain-preparation",
    title: { en: "MIR Spain Exam Preparation" },
    description: { en: "Complete MIR exam preparation covering all specialties required for medical residency in Spain." },
    shortDescription: { en: "Ace the MIR exam with comprehensive training" },
    price: "249.99",
    durationDays: 150,
    hasCertificate: true,
    modules: [
      {
        title: { en: "Medical Surgery" },
        description: { en: "Core surgical topics for MIR" },
        sortOrder: 0,
        lessons: [
          { title: { en: "General Surgery Principles" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/e5f6g7h8i9j0k1l2m3n4o5p6a7b8c9d0/iframe", duration: 2500, content: "Preoperative evaluation, wound healing, surgical infections, and postoperative care.", sortOrder: 0, isFreePreview: true },
          { title: { en: "Abdominal Surgery" }, contentType: "video", videoUrl: "https://customer-ohx6f4u7x4k5k5qk.cloudflarestream.com/f6g7h8i9j0k1l2m3n4o5p6a7b8c9d0e1/iframe", duration: 2000, content: "Management of acute abdomen, appendicitis, cholecystitis, and intestinal obstruction.", sortOrder: 1, isFreePreview: false },
        ],
      },
    ],
  },
];

const articlesData = [
  {
    slug: "understanding-usmle-step1-pass-fail",
    title: { en: "Understanding the USMLE Step 1 Pass/Fail Change" },
    excerpt: { en: "A comprehensive guide to the transition of USMLE Step 1 to pass/fail scoring and how to adapt your study strategy." },
    content: { en: "In January 2022, the USMLE Step 1 transitioned from a three-digit numeric score to pass/fail. This change was implemented to reduce the emphasis on rote memorization and encourage medical students to focus on deep learning. The shift has significant implications for residency applications, as programs now place greater weight on Step 2 CK scores, research experience, and clinical performance. Students should adjust their study strategies accordingly, focusing on understanding foundational concepts while preparing for Step 2 CK with greater intensity." },
    isPublished: true,
  },
  {
    slug: "top-10-study-strategies-medical-boards",
    title: { en: "Top 10 Study Strategies for Medical Board Exams" },
    excerpt: { en: "Evidence-based study techniques to maximize your performance on medical board examinations." },
    content: { en: "Medical board exams require strategic preparation. Key evidence-based strategies include: (1) Active recall - testing yourself instead of passive review, (2) Spaced repetition - using tools like Anki or our built-in flashcard system, (3) Interleaving - mixing different subjects in study sessions, (4) Practice questions - the single most effective preparation method, (5) Study groups - collaborative learning enhances retention, (6) Time management - creating a structured study schedule, (7) Self-care - adequate sleep and exercise improve cognitive function, (8) Question analysis - learning to identify what the exam is truly asking, (9) Review of incorrect answers - understanding why you got a question wrong, and (10) Simulated exams - building test-taking endurance." },
    isPublished: true,
  },
  {
    slug: "approach-to-chest-pain-emergency-department",
    title: { en: "Approach to Chest Pain in the Emergency Department" },
    excerpt: { en: "A systematic approach to evaluating and managing patients presenting with chest pain." },
    content: { en: "Chest pain is one of the most common emergency department presentations and requires careful evaluation to rule out life-threatening causes. The initial assessment should focus on hemodynamic stability and ECG findings. ST-elevation MI requires immediate reperfusion. Non-ST-elevation ACS is managed with antiplatelet therapy, anticoagulation, and risk stratification. Other important causes include pulmonary embolism (assess with Wells criteria and D-dimer), aortic dissection (consider with tearing chest pain and blood pressure differential), pneumothorax (diagnosed on chest X-ray), and pericarditis (diffuse ST-elevation with PR depression). A systematic approach ensures that life-threatening conditions are not missed." },
    isPublished: true,
  },
  {
    slug: "antibiotic-stewardship-clinical-practice",
    title: { en: "Antibiotic Stewardship in Clinical Practice" },
    excerpt: { en: "Principles of rational antibiotic use to combat antimicrobial resistance." },
    content: { en: "Antimicrobial resistance is a global health crisis driven by inappropriate antibiotic use. Principles of antibiotic stewardship include: (1) prescribing antibiotics only when bacterial infection is confirmed or strongly suspected, (2) selecting the narrowest spectrum antibiotic effective against the likely pathogen, (3) using appropriate dosing and duration, (4) reviewing and de-escalating based on culture results, (5) avoiding unnecessary dual coverage, and (6) following local antibiograms. Common pitfalls include treating viral infections with antibiotics, overly broad empiric coverage, and excessively long treatment courses." },
    isPublished: true,
  },
  {
    slug: "guide-cardiovascular-physical-examination",
    title: { en: "Guide to the Physical Examination: The Cardiovascular System" },
    excerpt: { en: "Step-by-step guide to performing a thorough cardiovascular physical examination." },
    content: { en: "A systematic cardiovascular examination includes: Inspection - observing for jugular venous distension, heaves, and visible pulsations. Palpation - assessing the apical impulse, thrills, and heaves. Auscultation - listening at each cardiac auscultation area (aortic, pulmonic, tricuspid, mitral) with both diaphragm and bell. Key heart sounds include S1 (mitral and tricuspid closure), S2 (aortic and pulmonic closure), S3 (ventricular filling, normal in children, abnormal in adults), and S4 (atrial contraction, associated with stiff ventricles). Murmurs should be characterized by timing, location, radiation, intensity, pitch, and quality." },
    isPublished: true,
  },
];

const plansData = [
  { name: { en: "Monthly", es: "Mensual" }, description: { en: "Full question bank access, basic analytics", es: "Acceso completo al banco de preguntas, analíticas básicas" }, price: "29", interval: "month", sortOrder: 0, isVisible: true, maxExamAttempts: 20 },
  { name: { en: "Quarterly", es: "Trimestral" }, description: { en: "Everything in Monthly plus advanced analytics, priority support, mock exams", es: "Todo lo de Mensual más analíticas avanzadas, soporte prioritario, exámenes simulados" }, price: "69", interval: "quarter", sortOrder: 1, isVisible: true, maxExamAttempts: 50 },
  { name: { en: "Annual", es: "Anual" }, description: { en: "Everything in Quarterly plus 1-on-1 tutoring, certificate, early access", es: "Todo lo de Trimestral más tutoría personalizada, certificado, acceso anticipado" }, price: "199", interval: "year", sortOrder: 2, isVisible: true, maxExamAttempts: 999999 },
];

const paramsData = [
  {
    key: "terms_of_service",
    value: {
      en: "MD Exam Terms of Service\n\n1. Acceptance of Terms\nBy accessing and using MD Exam, you agree to be bound by these Terms of Service.\n\n2. Description of Service\nMD Exam provides an online platform for medical exam preparation including question banks, flashcards, video classes, and courses.\n\n3. User Accounts\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n4. Subscription & Billing\nPaid subscriptions auto-renew unless canceled. Refunds are handled per our refund policy.\n\n5. Intellectual Property\nAll content on MD Exam is protected by copyright and other intellectual property laws.\n\n6. Limitation of Liability\nMD Exam is not responsible for any exam outcomes or medical decisions made using our platform.\n\n7. Contact\nFor questions, contact support@mdexams.com",
      es: "Términos del Servicio de MD Exam\n\n1. Aceptación de Términos\nAl acceder y usar MD Exam, aceptas estar sujeto a estos Términos del Servicio.\n\n2. Descripción del Servicio\nMD Exam proporciona una plataforma en línea para preparación de exámenes médicos incluyendo bancos de preguntas, tarjetas de estudio, videoclases y cursos.\n\n3. Cuentas de Usuario\nEres responsable de mantener la confidencialidad de tus credenciales de cuenta.\n\n4. Suscripción y Facturación\nLas suscripciones pagadas se renuevan automáticamente a menos que se cancelen.\n\n5. Propiedad Intelectual\nTodo el contenido en MD Exam está protegido por derechos de autor.\n\n6. Limitación de Responsabilidad\nMD Exam no es responsable por resultados de exámenes o decisiones médicas.\n\n7. Contacto\nPara preguntas, contacta a support@mdexams.com",
    },
    description: "Terms of Service page content",
  },
  {
    key: "privacy_policy",
    value: {
      en: "MD Exam Privacy Policy\n\n1. Information We Collect\nWe collect personal information you provide (name, email) and usage data (questions answered, exam results).\n\n2. How We Use Your Information\nWe use your data to provide and improve our services, send updates, and personalize your experience.\n\n3. Data Security\nWe implement industry-standard security measures to protect your personal information.\n\n4. Third-Party Services\nWe use Stripe for payment processing. Your payment data is handled by Stripe, not stored by us.\n\n5. Cookies\nWe use essential cookies for authentication and analytics cookies to improve our platform.\n\n6. Your Rights\nYou may request access, correction, or deletion of your personal data at any time.\n\n7. Contact\nFor privacy inquiries: privacy@mdexams.com",
      es: "Política de Privacidad de MD Exam\n\n1. Información que Recopilamos\nRecopilamos información personal que proporcionas (nombre, correo) y datos de uso.\n\n2. Cómo Usamos tu Información\nUsamos tus datos para proporcionar y mejorar nuestros servicios.\n\n3. Seguridad de Datos\nImplementamos medidas de seguridad estándar de la industria.\n\n4. Servicios de Terceros\nUsamos Stripe para procesamiento de pagos.\n\n5. Cookies\nUsamos cookies esenciales para autenticación y cookies analíticas.\n\n6. Tus Derechos\nPuedes solicitar acceso, corrección o eliminación de tus datos.\n\n7. Contacto\nConsultas de privacidad: privacy@mdexams.com",
    },
    description: "Privacy Policy page content",
  },
  {
    key: "faq_content",
    value: {
      en: "Frequently Asked Questions\n\nQ: How does the question bank work?\nA: Our question bank contains thousands of exam-style questions organized by specialty and topic. You can study in Study Mode with instant feedback or Exam Mode for timed simulation.\n\nQ: What is spaced repetition?\nA: Spaced repetition schedules reviews at optimal intervals. Our SM-2 algorithm ensures you review cards right when you're about to forget them.\n\nQ: Can I access content on mobile?\nA: Yes! Our platform is fully responsive. Mobile app coming soon.\n\nQ: Is there a money-back guarantee?\nA: Yes, we offer a 14-day money-back guarantee on all plans.\n\nQ: How do I upgrade or downgrade my plan?\nA: Visit the Subscribe page in your dashboard and select a new plan. Proration applies.\n\nQ: How do I cancel my subscription?\nA: Go to the Subscribe page and click Cancel Subscription. Access continues until the end of the billing period.",
      es: "Preguntas Frecuentes\n\nP: ¿Cómo funciona el banco de preguntas?\nR: Nuestro banco contiene miles de preguntas tipo examen organizadas por especialidad y tema.\n\nP: ¿Qué es la repetición espaciada?\nR: La repetición espaciada programa revisiones en intervalos óptimos.\n\nP: ¿Puedo acceder al contenido en mi móvil?\nR: ¡Sí! Nuestra plataforma es totalmente responsive. La app móvil estará disponible pronto.\n\nP: ¿Hay garantía de devolución?\nR: Sí, ofrecemos una garantía de 14 días en todos los planes.\n\nP: ¿Cómo actualizo mi plan?\nR: Ve a la página de Suscripción y selecciona un nuevo plan.\n\nP: ¿Cómo cancelo mi suscripción?\nR: Ve a Suscripción y haz clic en Cancelar Suscripción.",
    },
    description: "FAQ page content",
  },
];

// --- Helper: create a slug from exam slug + specialty name ---
function specialtySlug(examSlug: string, en: string): string {
  return `${examSlug}-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

async function main() {
  console.log("Connected to database\n");

  // Find admin user
  let adminUser: any = null;
  for (const email of ADMIN_EMAILS) {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (rows.length > 0) {
      adminUser = rows[0];
      break;
    }
  }

  if (!adminUser) {
    console.error(`No admin user found among: ${ADMIN_EMAILS.join(", ")}. Please create one first.`);
    await pool.end();
    process.exit(1);
  }
  const userId = adminUser.id;
  console.log(`Using admin user: ${adminUser.email}\n`);

  // ========================================================================
  // 1. EXAMS & SPECIALTIES
  // ========================================================================
  console.log("=== 1. Exams & Specialties ===");
  let examCount = 0;
  let specialtyCount = 0;

  for (const exam of examsData) {
    let [existing] = await db
      .select()
      .from(schema.exams)
      .where(eq(schema.exams.slug, exam.slug))
      .limit(1);

    if (!existing) {
      [existing] = await db.insert(schema.exams).values({
        slug: exam.slug,
        name: exam.name,
        description: exam.description,
        sortOrder: exam.sortOrder,
        isActive: true,
      }).returning();
      console.log(`  Created exam: ${exam.name.en}`);
      examCount++;
    } else {
      console.log(`  Skipped (exists): ${exam.name.en}`);
    }

    // Upsert specialties
    for (let i = 0; i < exam.specialties.length; i++) {
      const s = exam.specialties[i];
      const slug = specialtySlug(exam.slug, s.en);
      const [existingSpec] = await db
        .select()
        .from(schema.specialties)
        .where(eq(schema.specialties.slug, slug))
        .limit(1);

      if (!existingSpec) {
        await db.insert(schema.specialties).values({
          examId: existing.id,
          name: { en: s.en, es: s.es },
          slug,
          sortOrder: i,
        });
        specialtyCount++;
      }
    }
  }
  console.log(`Exams: ${examCount} created, ${examsData.length} total`);
  console.log(`Specialties: ${specialtyCount} created\n`);

  // ========================================================================
  // 2. QUESTIONS
  // ========================================================================
  console.log("=== 2. Questions ===");
  let qCreated = 0;
  for (const q of questionsData) {
    // Check if question already exists by text
    const [existingQ] = await db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.text, q.text))
      .limit(1);

    if (existingQ) {
      process.stdout.write(".");
      continue;
    }

    const [question] = await db.insert(schema.questions).values({
      text: q.text,
      explanation: q.explanation,
      difficulty: q.difficulty,
      isActive: true,
      createdBy: userId,
    }).returning();

    await db.insert(schema.questionOptions).values(
      q.options.map((o) => ({ ...o, questionId: question.id })),
    );
    qCreated++;
    process.stdout.write(".");
  }
  console.log(`\nQuestions: ${qCreated} created\n`);

  // ========================================================================
  // 3. FLASHCARDS (for ENURM, ENARM, MIR — all specialties)
  // ========================================================================
  console.log("=== 3. Flashcards ===");
  let fcCreated = 0;

  interface FlashcardDef {
    front: string;
    back: string;
    reference?: string;
  }

  const flashcardTemplates: FlashcardDef[] = [
    { front: "What is the first-line treatment for hypertension in diabetic patients?", back: "ACE inhibitors or ARBs. They provide renoprotective effects in addition to blood pressure control.", reference: "JNC 8 Guidelines" },
    { front: "What is the most common cause of community-acquired pneumonia?", back: "Streptococcus pneumoniae. It accounts for approximately 30-40% of all CAP cases.", reference: "IDSA Guidelines" },
    { front: "What is the Gold standard for diagnosing pulmonary embolism?", back: "CT pulmonary angiography (CTPA). Has high sensitivity and specificity for detecting PE.", reference: "Radiology" },
    { front: "What is the most common arrhythmia in clinical practice?", back: "Atrial fibrillation. Affects 1-2% of the general population, increasing with age.", reference: "ACC/AHA Guidelines" },
    { front: "What is the treatment for anaphylaxis?", back: "Epinephrine IM (1:1000, 0.3-0.5 mg) in the anterolateral thigh. First-line treatment.", reference: "ACAAI Guidelines" },
    { front: "What is the most common cause of acute pancreatitis?", back: "Gallstones (40%) followed by alcohol (30%). Other causes include hypertriglyceridemia, medications, and trauma.", reference: "ACG Guidelines" },
    { front: "What is the difference between a stroke and a TIA?", back: "Stroke symptoms last >24 hours or cause permanent damage. TIA symptoms resolve within 24 hours (usually <1 hour) without permanent damage.", reference: "ASA Guidelines" },
    { front: "What is the most common cause of Cushing syndrome?", back: "Iatrogenic (exogenous glucocorticoid use). The most common endogenous cause is pituitary adenoma (Cushing disease).", reference: "Endocrinology" },
    { front: "What is the first-line treatment for major depressive disorder?", back: "SSRIs (e.g., fluoxetine, sertraline, citalopram). They have a favorable side effect profile compared to TCAs and MAOIs.", reference: "APA Guidelines" },
    { front: "What is the most common cause of iron deficiency anemia in adults?", back: "Chronic blood loss (GI bleeding in men/postmenopausal women, menorrhagia in premenopausal women).", reference: "Hematology" },
    { front: "What are the diagnostic criteria for systemic lupus erythematosus (SLE)?", back: "Mnemonic: SOAP BRAIN MD. Serositis, Oral ulcers, Arthritis, Photosensitivity, Blood disorders, Renal involvement, ANA positive, Immunologic disorders, Neurologic disorders, Malar rash, Discoid rash.", reference: "ACR Criteria" },
    { front: "What is the most common malignant bone tumor in children?", back: "Osteosarcoma. Most commonly occurs in the metaphysis of long bones, especially distal femur.", reference: "Orthopedics" },
    { front: "What is the mechanism of action of proton pump inhibitors?", back: "Irreversibly inhibit the H+/K+ ATPase pump in gastric parietal cells, reducing gastric acid secretion.", reference: "Pharmacology" },
    { front: "What is the most common cause of hyperthyroidism?", back: "Graves disease (autoimmune). Accounts for 50-80% of hyperthyroidism cases. More common in women.", reference: "Endocrinology" },
    { front: "What is the treatment for acute gout flare?", back: "NSAIDs (indomethacin), colchicine, or corticosteroids. Initiate within 24 hours of symptom onset.", reference: "ACR Guidelines" },
  ];

  const flashcardExams = await db
    .select()
    .from(schema.exams)
    .where(inArray(schema.exams.slug, flashcardExamSlugs));

  for (const exam of flashcardExams) {
    const examSpecialties = await db
      .select()
      .from(schema.specialties)
      .where(eq(schema.specialties.examId, exam.id));

    if (examSpecialties.length === 0) {
      console.log(`  No specialties found for ${exam.slug}, skipping flashcards`);
      continue;
    }

    let count = 0;
    // Distribute flashcards across all specialties
    for (let i = 0; i < flashcardTemplates.length; i++) {
      const fc = flashcardTemplates[i];
      const specialty = examSpecialties[i % examSpecialties.length];

      // Check if similar flashcard exists
      const [existingFC] = await db
        .select()
        .from(schema.flashcards)
        .where(sql`${schema.flashcards.front} = ${fc.front} AND ${schema.flashcards.examId} = ${exam.id}`)
        .limit(1);

      if (existingFC) continue;

      await db.insert(schema.flashcards).values({
        examId: exam.id,
        specialtyId: specialty.id,
        front: fc.front,
        back: fc.back,
        reference: fc.reference,
        isActive: true,
        createdBy: userId,
      });
      count++;
    }
    console.log(`  ${exam.slug}: ${count} flashcards created`);
    fcCreated += count;
  }
  console.log(`Flashcards total: ${fcCreated} created\n`);

  // ========================================================================
  // 4. COURSES
  // ========================================================================
  console.log("=== 4. Courses ===");
  let cCreated = 0;
  for (const course of coursesData) {
    const [existing] = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.slug, course.slug))
      .limit(1);

    if (existing) {
      const modCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.courseModules)
        .where(eq(schema.courseModules.courseId, existing.id));

      if ((modCount[0]?.count || 0) === 0) {
        for (const mod of course.modules) {
          const [module] = await db.insert(schema.courseModules).values({
            courseId: existing.id,
            title: mod.title,
            description: mod.description,
            sortOrder: mod.sortOrder,
          }).returning();
          for (const lesson of mod.lessons) {
            await db.insert(schema.courseLessons).values({
              moduleId: module.id,
              ...lesson,
            });
          }
        }
        console.log(`  Added modules to existing: ${course.title.en}`);
      } else {
        console.log(`  Skipped (exists): ${course.title.en}`);
      }
      continue;
    }

    const [created] = await db.insert(schema.courses).values({
      slug: course.slug,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription,
      price: course.price,
      durationDays: course.durationDays,
      hasCertificate: course.hasCertificate,
      isActive: true,
      createdBy: userId,
    }).returning();

    for (const mod of course.modules) {
      const [module] = await db.insert(schema.courseModules).values({
        courseId: created.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
      }).returning();
      for (const lesson of mod.lessons) {
        await db.insert(schema.courseLessons).values({
          moduleId: module.id,
          ...lesson,
        });
      }
    }
    console.log(`  Created: ${course.title.en}`);
    cCreated++;
  }
  console.log(`Courses: ${cCreated} created\n`);

  // ========================================================================
  // 5. ARTICLES
  // ========================================================================
  console.log("=== 5. Articles ===");
  let aCreated = 0;
  for (const article of articlesData) {
    const [existing] = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.slug, article.slug))
      .limit(1);

    if (existing) {
      console.log(`  Skipped (exists): ${article.title.en}`);
      continue;
    }

    await db.insert(schema.articles).values({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      isPublished: article.isPublished,
      publishedAt: article.isPublished ? new Date() : null,
      authorId: userId,
    });
    console.log(`  Created: ${article.title.en}`);
    aCreated++;
  }
  console.log(`Articles: ${aCreated} created\n`);

  // ========================================================================
  // 6. SUBSCRIPTION PLANS
  // ========================================================================
  console.log("=== 6. Subscription Plans ===");
  let pCreated = 0;
  for (const plan of plansData) {
    const [existing] = await db
      .select()
      .from(schema.subscriptionPlans)
      .where(sql`${schema.subscriptionPlans.name}->>'en' = ${plan.name.en}`)
      .limit(1);

    if (existing) {
      console.log(`  Skipped (exists): ${plan.name.en}`);
      continue;
    }

    await db.insert(schema.subscriptionPlans).values(plan);
    console.log(`  Created: ${plan.name.en}`);
    pCreated++;
  }
  console.log(`Plans: ${pCreated} created\n`);

  // ========================================================================
  // 7. SYSTEM PARAMETERS
  // ========================================================================
  console.log("=== 7. System Parameters ===");
  let paramsCreated = 0;
  for (const param of paramsData) {
    const [existing] = await db
      .select()
      .from(schema.systemParameters)
      .where(eq(schema.systemParameters.key, param.key))
      .limit(1);

    if (existing) {
      console.log(`  Skipped (exists): ${param.key}`);
      continue;
    }

    await db.insert(schema.systemParameters).values(param);
    console.log(`  Created: ${param.key}`);
    paramsCreated++;
  }
  console.log(`System Parameters: ${paramsCreated} created\n`);

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log("=== Seed Complete ===");
  console.log(`  Exams: ${examCount} new, ${examsData.length} total`);
  console.log(`  Specialties: ${specialtyCount} new`);
  console.log(`  Questions: ${qCreated} new`);
  console.log(`  Flashcards: ${fcCreated} new`);
  console.log(`  Courses: ${cCreated} new`);
  console.log(`  Articles: ${aCreated} new`);
  console.log(`  Plans: ${pCreated} new`);
  console.log(`  System Parameters: ${paramsCreated} new`);

  await pool.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
