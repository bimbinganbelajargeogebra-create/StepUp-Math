import { PretestQuestion, KumonLevelId } from '../types';

export const PRETEST_QUESTIONS: PretestQuestion[] = [
  {
    id: 'pt-6a',
    levelId: '6A',
    difficultyOrder: 0,
    prompt: 'Berapakah jumlah titik merah berikut: ● ● ● ● ● ● ●',
    options: ['5', '6', '7', '8'],
    correctAnswer: '7',
    explanation: 'Menghitung secara berurutan ada 7 buah titik merah.'
  },
  {
    id: 'pt-5a',
    levelId: '5A',
    difficultyOrder: 1,
    prompt: 'Lengkapilah urutan angka yang hilang berikut:',
    mathFormula: '27, \\; 28, \\; \\underline{\\quad}, \\; 30, \\; 31',
    isLatex: true,
    options: ['26', '29', '32', '39'],
    correctAnswer: '29',
    explanation: 'Pola deret bilangan bertambah 1 (+1): angka setelah 28 dan sebelum 30 adalah 29.'
  },
  {
    id: 'pt-4a',
    levelId: '4A',
    difficultyOrder: 2,
    prompt: 'Berapakah hasil penjumlahan berikut:',
    mathFormula: '18 + 1 = \\dots',
    isLatex: true,
    options: ['17', '18', '19', '20'],
    correctAnswer: '19',
    explanation: 'Konsep penambahan 1 (+1): bilangan bulat tepat setelah 18 adalah 19.'
  },
  {
    id: 'pt-3a',
    levelId: '3A',
    difficultyOrder: 3,
    prompt: 'Berapakah hasil penjumlahan berikut:',
    mathFormula: '7 + 4 = \\dots',
    isLatex: true,
    options: ['10', '11', '12', '13'],
    correctAnswer: '11',
    explanation: '7 + 4 = 11 (membilang maju 4 langkah dari 7).'
  },
  {
    id: 'pt-2a',
    levelId: '2A',
    difficultyOrder: 4,
    prompt: 'Berapakah hasil pengurangan berikut:',
    mathFormula: '15 - 7 = \\dots',
    isLatex: true,
    options: ['7', '8', '9', '6'],
    correctAnswer: '8',
    explanation: '15 - 7 = 8 (karena 8 + 7 = 15).'
  },
  {
    id: 'pt-a',
    levelId: 'A',
    difficultyOrder: 5,
    prompt: 'Berapakah hasil penjumlahan mendatar berikut:',
    mathFormula: '38 + 25 = \\dots',
    isLatex: true,
    options: ['53', '63', '61', '58'],
    correctAnswer: '63',
    explanation: '38 + 25 = (30 + 20) + (8 + 5) = 50 + 13 = 63.'
  },
  {
    id: 'pt-b',
    levelId: 'B',
    difficultyOrder: 6,
    prompt: 'Berapakah hasil pengurangan bersusun berikut:',
    mathFormula: '\\begin{array}{rr} & 304 \\\\[2pt] - & 168 \\\\[2pt] \\hline \\end{array}',
    isLatex: true,
    options: ['136', '146', '236', '126'],
    correctAnswer: '136',
    explanation: '304 - 168 = 136 (pengurangan bersusun dengan teknik meminjam puluhan dan ratusan).'
  },
  {
    id: 'pt-c',
    levelId: 'C',
    difficultyOrder: 7,
    prompt: 'Berapakah hasil dari perkalian dan pembagian berikut berturut-turut:',
    mathFormula: '7 \\times 8 \\quad \\text{dan} \\quad 54 \\div 6',
    isLatex: true,
    options: ['56 dan 9', '54 dan 8', '48 dan 9', '56 dan 8'],
    correctAnswer: '56 dan 9',
    explanation: '7 × 8 = 56 dan 54 ÷ 6 = 9.'
  },
  {
    id: 'pt-d',
    levelId: 'D',
    difficultyOrder: 8,
    prompt: 'Berapakah hasil bagi dan sisa dari pembagian berikut:',
    mathFormula: '247 \\div 4 = \\dots',
    isLatex: true,
    options: ['61 sisa 3', '61 sisa 1', '62 sisa 3', '60 sisa 7'],
    correctAnswer: '61 sisa 3',
    explanation: '247 = (4 × 61) + 3. Jadi hasilnya 61 dengan sisa 3.'
  },
  {
    id: 'pt-e',
    levelId: 'E',
    difficultyOrder: 9,
    prompt: 'Hitunglah penjumlahan pecahan berikut dalam bentuk paling sederhana:',
    mathFormula: '\\frac{2}{3} + \\frac{3}{5} = \\dots',
    isLatex: true,
    options: ['\\frac{5}{8}', '\\frac{19}{15}', '1 \\frac{4}{15}', '\\frac{6}{15}'],
    correctAnswer: '1 \\frac{4}{15}',
    explanation: 'KPK(3, 5) = 15: 10/15 + 9/15 = 19/15 = 1 4/15.'
  },
  {
    id: 'pt-f',
    levelId: 'F',
    difficultyOrder: 10,
    prompt: 'Hitunglah nilai urutan operasi hitung campuran berikut:',
    mathFormula: '18 - 4 \\times (2.5 + 1.5) \\div 2 = \\dots',
    isLatex: true,
    options: ['10', '14', '8', '12'],
    correctAnswer: '10',
    explanation: 'Hitung operasi dalam kurung: 2.5 + 1.5 = 4. Lalu perkalian & pembagian: 4 × 4 ÷ 2 = 8. Terakhir pengurangan: 18 - 8 = 10.'
  },
  {
    id: 'pt-g',
    levelId: 'G',
    difficultyOrder: 11,
    prompt: 'Selesaikan persamaan aljabar linear berikut untuk mencari nilai x:',
    mathFormula: '-3x + 14 = -7',
    isLatex: true,
    options: ['x = 7', 'x = -7', 'x = 3', 'x = -3'],
    correctAnswer: 'x = 7',
    explanation: '-3x = -7 - 14 ⟹ -3x = -21 ⟹ x = (-21) ÷ (-3) = 7.'
  },
  {
    id: 'pt-h',
    levelId: 'H',
    difficultyOrder: 12,
    prompt: 'Tentukan himpunan penyelesaian (x, y) dari SPLDV berikut:',
    mathFormula: '\\begin{cases} 2x + y = 11 \\\\[4pt] x - y = 1 \\end{cases}',
    isLatex: true,
    options: ['x = 4, \\, y = 3', 'x = 3, \\, y = 5', 'x = 5, \\, y = 1', 'x = 4, \\, y = 2'],
    correctAnswer: 'x = 4, \\, y = 3',
    explanation: 'Jumlahkan kedua persamaan: 3x = 12 ⟹ x = 4. Substitusi x = 4 ke persamaan kedua: 4 - y = 1 ⟹ y = 3.'
  },
  {
    id: 'pt-i',
    levelId: 'I',
    difficultyOrder: 13,
    prompt: 'Tentukan akar-akar riil dari persamaan kuadrat berikut:',
    mathFormula: 'x^2 - 7x + 12 = 0',
    isLatex: true,
    options: ['x = 3 \\; \\text{dan} \\; x = 4', 'x = -3 \\; \\text{dan} \\; x = -4', 'x = 2 \\; \\text{dan} \\; x = 6', 'x = -2 \\; \\text{dan} \\; x = -6'],
    correctAnswer: 'x = 3 \\; \\text{dan} \\; x = 4',
    explanation: 'Faktorkan: (x - 3)(x - 4) = 0 ⟹ x = 3 atau x = 4.'
  },
  {
    id: 'pt-j',
    levelId: 'J',
    difficultyOrder: 14,
    prompt: 'Berapakah sisa pembagian suku banyak P(x) berikut jika dibagi oleh (x - 2):',
    mathFormula: 'P(x) = 2x^3 - 3x^2 + 4x - 5',
    isLatex: true,
    options: ['7', '9', '11', '5'],
    correctAnswer: '7',
    explanation: 'Menurut Teorema Sisa, sisa = P(2) = 2(2)^3 - 3(2)^2 + 4(2) - 5 = 2(8) - 3(4) + 8 - 5 = 16 - 12 + 8 - 5 = 7.'
  },
  {
    id: 'pt-k',
    levelId: 'K',
    difficultyOrder: 15,
    prompt: 'Tentukan nilai x yang memenuhi persamaan logaritma berikut:',
    mathFormula: '\\log_2(x) + \\log_2(x - 6) = 4',
    isLatex: true,
    options: ['x = 8', 'x = 6', 'x = 4', 'x = 10'],
    correctAnswer: 'x = 8',
    explanation: 'Sifat logaritma: log_2(x(x - 6)) = 4 ⟹ x(x - 6) = 2^4 = 16 ⟹ x^2 - 6x - 16 = 0 ⟹ (x - 8)(x + 2) = 0. Karena syarat numerus x > 6, maka x = 8.'
  },
  {
    id: 'pt-l',
    levelId: 'L',
    difficultyOrder: 16,
    prompt: 'Tentukan turunan pertama f\'(x) dari fungsi polinomial:',
    mathFormula: 'f(x) = 3x^4 - 5x^2 + 7x - 9',
    isLatex: true,
    options: ['12x^3 - 10x + 7', '12x^3 - 5x + 7', '7x^3 - 10x', '12x^4 - 10x^2 + 7'],
    correctAnswer: '12x^3 - 10x + 7',
    explanation: 'Aturan turunan aljabar: f\'(x) = 4(3)x^3 - 2(5)x^1 + 7(1) - 0 = 12x^3 - 10x + 7.'
  },
  {
    id: 'pt-m',
    levelId: 'M',
    difficultyOrder: 17,
    prompt: 'Hitunglah nilai integral tentu kalkulus berikut:',
    mathFormula: '\\int_0^3 (3x^2 - 2x + 1) \\, dx = \\dots',
    isLatex: true,
    options: ['21', '18', '24', '15'],
    correctAnswer: '21',
    explanation: 'Antiturunan: ∫ (3x^2 - 2x + 1) dx = x^3 - x^2 + x. Evaluasi batas: [x^3 - x^2 + x]_0^3 = (3^3 - 3^2 + 3) - 0 = 27 - 9 + 3 = 21.'
  }
];

export function calculateStartingLevel(answers: Record<string, string>): {
  assignedLevel: KumonLevelId;
  score: number;
  total: number;
  levelEvaluations: { levelId: KumonLevelId; isCorrect: boolean }[];
} {
  let score = 0;
  const levelEvaluations: { levelId: KumonLevelId; isCorrect: boolean }[] = [];

  PRETEST_QUESTIONS.forEach((q) => {
    const isCorrect = answers[q.id] === q.correctAnswer;
    if (isCorrect) score++;
    levelEvaluations.push({
      levelId: q.levelId,
      isCorrect
    });
  });

  // Kumon Diagnostic Placement Algorithm:
  // Find the first failure point where student makes errors or needs reinforcement.
  // We place student at a comfortable starting level to ensure 100% mastery foundation.
  let firstFailIdx = levelEvaluations.findIndex((e) => !e.isCorrect);

  let assignedLevel: KumonLevelId;
  if (firstFailIdx === -1) {
    // Perfect score: can start at Level M
    assignedLevel = 'M';
  } else if (firstFailIdx === 0) {
    // Failed first question: start at 6A
    assignedLevel = '6A';
  } else {
    // In Kumon methodology, placing 1 step at or slightly below the first challenge point
    // builds speed, accuracy, and confidence.
    assignedLevel = levelEvaluations[firstFailIdx].levelId;
  }

  return {
    assignedLevel,
    score,
    total: PRETEST_QUESTIONS.length,
    levelEvaluations
  };
}
