import { KumonLevelId, Question } from '../types';

export function getStepByStepSolutionForQuestion(levelId: KumonLevelId, q: Partial<Question>): string[] {
  const ans = q.correctAnswer || '';
  switch (levelId) {
    case '6A':
      return [
        'Langkah 1: Amati objek gambar secara teliti dari kiri ke kanan.',
        'Langkah 2: Hitung bertahap satu per satu: 1, 2, 3, ... hingga objek terakhir.',
        `Langkah 3: Jumlah seluruh objek yang terhitung adalah ${ans}.`,
        `Hasil Akhir: ${ans}`
      ];
    case '5A':
      return [
        'Langkah 1: Perhatikan pola deret bilangan yang teratur bertambah 1 (+1).',
        'Langkah 2: Temukan bilangan sebelum dan sesudah kotak yang kosong.',
        `Langkah 3: Bilangan pengisi yang tepat adalah ${ans}.`,
        `Hasil Akhir: ${ans}`
      ];
    case '4A':
      return [
        'Langkah 1: Konsep penjumlahan 1 (+1) adalah mencari bilangan bulat tepat berikutnya.',
        `Langkah 2: Bilangan penerus dari suku awal adalah ${ans}.`,
        `Hasil Akhir: ${ans}`
      ];
    case '3A':
      return [
        'Langkah 1: Gunakan teknik membilang maju sesuai nilai penambah.',
        'Langkah 2: Jumlahkan secara langsung atau genapkan ke kelipatan 10 terdekat.',
        `Langkah 3: Nilai total penjumlahan adalah ${ans}.`,
        `Hasil Akhir: ${ans}`
      ];
    case '2A':
      return [
        'Langkah 1: Identifikasi operasi hitung yang diminta (penjumlahan atau pengurangan).',
        'Langkah 2: Hitung nilai secara bertahap pada garis bilangan.',
        `Langkah 3: Uji kebalikan operasi: hasil + pengurang = bilangan awal.`,
        `Hasil Akhir: ${ans}`
      ];
    case 'A':
      return [
        'Langkah 1: Pisahkan bilangan menurut nilai tempat (puluhan dan satuan).',
        'Langkah 2: Operasikan nilai puluhan, lalu operasikan nilai satuan.',
        'Langkah 3: Gabungkan hasil puluhan dan satuan secara cermat.',
        `Hasil Akhir: ${ans}`
      ];
    case 'B':
      return [
        'Langkah 1: Susun bilangan sejajar lurus ke bawah berdasarkan kolom nilai tempat.',
        'Langkah 2: Hitung kolom satuan terlebih dahulu (terapkan teknik simpan/pinjam jika diperlukan).',
        'Langkah 3: Lanjutkan ke kolom puluhan dan ratusan secara berurutan.',
        `Hasil Akhir: ${ans}`
      ];
    case 'C':
      return [
        'Langkah 1: Terapkan konsep perkalian sebagai penjumlahan berulang atau kebalikan pembagian.',
        'Langkah 2: Hitung hasil kali atau bagi bilangan secara bertahap.',
        `Langkah 3: Pastikan hasil akhir sesuai dengan tabel perkalian dasar standar.`,
        `Hasil Akhir: ${ans}`
      ];
    case 'D':
      return [
        'Langkah 1: Lakukan pembagian bersusun dari digit bernilai tempat tertinggi.',
        'Langkah 2: Kalikan hasil bagi sementara dengan pembagi, lalu kurangkan untuk mencari sisa.',
        'Langkah 3: Tuliskan hasil bagi lengkap beserta sisa pembagiannya secara rapi.',
        `Hasil Akhir: ${ans}`
      ];
    case 'E':
      return [
        'Langkah 1: Samakan penyebut kedua pecahan dengan mencari KPK penyebut.',
        'Langkah 2: Tuliskan pecahan senilai yang memiliki penyebut baru yang sama.',
        'Langkah 3: Operasikan bagian pembilang dan pertahankan penyebut yang sudah sama.',
        'Langkah 4: Sederhanakan bentuk pecahan akhir ke bentuk paling sederhana.',
        `Hasil Akhir: ${ans}`
      ];
    case 'F':
      return [
        'Langkah 1 (Hierarki Operasi KABATAKU): Selesaikan operasi di dalam tanda kurung terlebih dahulu.',
        'Langkah 2: Kerjakan operasi perkalian (×) dan pembagian (÷) dari kiri ke kanan.',
        'Langkah 3: Kerjakan operasi penjumlahan (+) dan pengurangan (-) pada tahap akhir.',
        `Hasil Akhir: ${ans}`
      ];
    case 'G':
      return [
        'Langkah 1: Kumpulkan semua suku bervariabel x di ruas kiri dan konstanta di ruas kanan.',
        'Langkah 2: Sederhanakan suku-suku sejenis di kedua ruas.',
        'Langkah 3: Bagi kedua ruas dengan koefisien dari x untuk memperoleh nilai x.',
        `Hasil Akhir: x = ${ans}`
      ];
    case 'H':
      return [
        'Langkah 1 (Metode Eliminasi): Samakan koefisien salah satu variabel, lalu kurangkan/jumlahkan persamaan.',
        'Langkah 2: Tentukan nilai dari variabel pertama.',
        'Langkah 3 (Metode Substitusi): Masukkan nilai variabel yang telah diperoleh ke salah satu persamaan.',
        'Langkah 4: Tentukan nilai variabel kedua dan nyatakan pasangan penyelesaian (x, y).',
        `Hasil Akhir: (x, y) = (${ans})`
      ];
    case 'I':
      return [
        'Langkah 1: Tuliskan bentuk umum persamaan kuadrat ax² + bx + c = 0.',
        'Langkah 2: Tentukan dua bilangan p dan q sedemikian hingga p × q = c dan p + q = b.',
        'Langkah 3: Faktorkan menjadi bentuk (x - p)(x - q) = 0 atau (x + p)(x + q) = 0.',
        'Langkah 4: Tentukan akar-akar penyelesaian: x = x₁ atau x = x₂.',
        `Hasil Akhir: x = ${ans}`
      ];
    case 'J':
      return [
        'Langkah 1 (Teorema Sisa): Jika suku banyak P(x) dibagi oleh (x - k), maka sisa pembagian adalah S = P(k).',
        'Langkah 2: Tentukan pembuat nol pembagi: x - k = 0 ⟹ x = k.',
        'Langkah 3: Substitusikan nilai x = k ke dalam fungsi polinomial P(x).',
        'Langkah 4: Hitung nilai perpangkatan dan perkalian suku per suku secara teliti.',
        `Hasil Akhir: Sisa = ${ans}`
      ];
    case 'K':
      return [
        'Langkah 1: Terapkan definisi logaritma: log_a(b) = c ⟺ a^c = b.',
        'Langkah 2: Gunakan sifat dasar logaritma: log_a(u) + log_a(v) = log_a(u × v).',
        'Langkah 3: Selesaikan persamaan eksponen/aljabar untuk mencari nilai variabel x.',
        'Langkah 4: Pastikan syarat numerus terpenuhi (numerus > 0).',
        `Hasil Akhir: x = ${ans}`
      ];
    case 'L':
      return [
        'Langkah 1 (Aturan Pangkat Turunan): d/dx (a · x^n) = a · n · x^(n - 1).',
        'Langkah 2: Kalikan koefisien fungsi dengan pangkat mula-mula (a × n).',
        'Langkah 3: Kurangi eksponen variabel x sebanyak 1 (n - 1).',
        'Langkah 4: Turunan suku konstanta murni selalu bernilai 0.',
        `Hasil Akhir: f'(x) = ${ans}`
      ];
    case 'M':
      return [
        'Langkah 1: Tentukan fungsi antiturunan F(x) = ∫ f(x) dx.',
        'Langkah 2: Terapkan Teorema Dasar Kalkulus: ∫_a^b f(x) dx = [F(x)]_a^b = F(b) - F(a).',
        'Langkah 3: Evaluasi nilai fungsi pada batas atas F(b) dan batas bawah F(a).',
        'Langkah 4: Kurangkan F(b) - F(a) untuk memperoleh nilai integral tentu.',
        `Hasil Akhir: ${ans}`
      ];
    default:
      return [
        'Langkah 1: Pahami model soal dan formula yang diberikan.',
        'Langkah 2: Hitung langkah demi langkah secara bertingkat.',
        `Hasil Akhir: ${ans}`
      ];
  }
}

export function generateWorksheetQuestions(levelId: KumonLevelId, worksheetNum: number): Question[] {
  const questions: Question[] = [];
  const seed = (worksheetNum - 1) * 10;

  for (let i = 1; i <= 10; i++) {
    const qNum = i;
    const qId = `${levelId}-w${worksheetNum}-q${i}`;

    switch (levelId) {
      case '6A': {
        // Counting 1-10, visual dots and number recognition
        const count = ((seed + i) % 10) + 1;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Hitunglah berapa banyak objek/titik berikut ini:`,
          visualItems: {
            type: 'dots',
            count
          },
          options: [
            `${Math.max(1, count - 1)}`,
            `${count}`,
            `${count + 1}`,
            `${count + 2}`
          ].sort(() => 0.5 - Math.random()),
          correctAnswer: `${count}`,
          explanation: `Ada tepat ${count} buah titik jika dihitung satu per satu.`
        });
        break;
      }

      case '5A': {
        // Number sequences 1-50, missing numbers
        const base = (worksheetNum * 4 + i * 2) % 42 + 2;
        const missingPos = i % 3; // 0: first, 1: mid, 2: last
        let formula = '';
        let ans = '';

        if (missingPos === 0) {
          formula = `\\underline{\\quad}, \\; ${base + 1}, \\; ${base + 2}, \\; ${base + 3}`;
          ans = `${base}`;
        } else if (missingPos === 1) {
          formula = `${base}, \\; \\underline{\\quad}, \\; ${base + 2}, \\; ${base + 3}`;
          ans = `${base + 1}`;
        } else {
          formula = `${base}, \\; ${base + 1}, \\; \\underline{\\quad}, \\; ${base + 3}`;
          ans = `${base + 2}`;
        }

        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Isilah bilangan yang hilang pada deret bilangan berikut:`,
          mathFormula: formula,
          isLatex: true,
          correctAnswer: ans,
          explanation: `Urutan bilangan maju teratur bertambah 1 (+1), sehingga bilangan pengisi yang tepat adalah ${ans}.`
        });
        break;
      }

      case '4A': {
        // Numbers up to 100 & +1 concept
        const a = (worksheetNum * 9 + i * 7) % 98 + 1;
        const ans = a + 1;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
          mathFormula: `${a} + 1 = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Konsep penambahan 1: bilangan bulat tepat setelah ${a} adalah ${ans}.`
        });
        break;
      }

      case '3A': {
        // Basic additions (+1 to +5)
        const addend = ((i + worksheetNum) % 5) + 1;
        const a = (worksheetNum * 2 + i * 3) % 15 + 1;
        const ans = a + addend;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
          mathFormula: `${a} + ${addend} = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `${a} + ${addend} = ${ans}.`
        });
        break;
      }

      case '2A': {
        // Additions (+6 to +10) or Subtractions (-1 to -5)
        const isSubtraction = i % 2 === 0;
        if (isSubtraction) {
          const sub = ((i + worksheetNum) % 5) + 1;
          const a = sub + (i % 10) + 2;
          const ans = a - sub;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil pengurangan bilangan berikut:`,
            mathFormula: `${a} - ${sub} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} - ${sub} = ${ans} (karena ${ans} + ${sub} = ${a}).`
          });
        } else {
          const add = ((i + worksheetNum) % 5) + 6;
          const a = (i * 2 + worksheetNum) % 12 + 1;
          const ans = a + add;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil penjumlahan bilangan berikut:`,
            mathFormula: `${a} + ${add} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} + ${add} = ${ans}.`
          });
        }
        break;
      }

      case 'A': {
        // Horizontal Addition & Subtraction (2-digit)
        const isSub = i % 2 === 0;
        if (isSub) {
          const a = (worksheetNum * 7 + i * 8) % 70 + 25;
          const b = (i * 3 + worksheetNum * 2) % 20 + 7;
          const ans = a - b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil pengurangan mendatar berikut:`,
            mathFormula: `${a} - ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} - ${b} = ${ans}.`
          });
        } else {
          const a = (worksheetNum * 6 + i * 5) % 45 + 15;
          const b = (i * 4 + worksheetNum * 3) % 40 + 12;
          const ans = a + b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Berapakah hasil penjumlahan mendatar berikut:`,
            mathFormula: `${a} + ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} + ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'B': {
        // Vertical addition with carrying / subtraction with borrowing
        const isSub = i % 2 === 0;
        if (isSub) {
          const a = (worksheetNum * 25 + i * 37) % 600 + 250;
          const b = (i * 19 + worksheetNum * 14) % 200 + 75;
          const ans = a - b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah pengurangan bersusun berikut:`,
            mathFormula: `\\begin{array}{rr} & ${a} \\\\[2pt] - & ${b} \\\\[2pt] \\hline \\end{array}`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Pengurangan bersusun dengan teknik meminjam: ${a} - ${b} = ${ans}.`
          });
        } else {
          const a = (worksheetNum * 33 + i * 29) % 550 + 180;
          const b = (i * 27 + worksheetNum * 19) % 400 + 145;
          const ans = a + b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah penjumlahan bersusun berikut:`,
            mathFormula: `\\begin{array}{rr} & ${a} \\\\[2pt] + & ${b} \\\\[2pt] \\hline \\end{array}`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Penjumlahan bersusun dengan teknik menyimpan: ${a} + ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'C': {
        // Multiplication table 1-9 & basic division
        const isDiv = i % 2 === 0;
        if (isDiv) {
          const b = ((i + worksheetNum) % 8) + 2;
          const quotient = ((i * 3 + worksheetNum) % 8) + 2;
          const a = b * quotient;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah pembagian bilangan berikut:`,
            mathFormula: `${a} \\div ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${quotient}`,
            explanation: `${a} ÷ ${b} = ${quotient} (karena ${b} × ${quotient} = ${a}).`
          });
        } else {
          const a = ((i + worksheetNum * 2) % 8) + 2;
          const b = ((i * 3 + worksheetNum) % 8) + 2;
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah perkalian bilangan berikut:`,
            mathFormula: `${a} \\times ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} × ${b} = ${ans}.`
          });
        }
        break;
      }

      case 'D': {
        // Long multiplication / division with remainders & fraction simplification
        if (i % 3 === 1) {
          // 2 digit × 2 digit
          const a = (i * 7 + worksheetNum * 4) % 60 + 20;
          const b = (i * 5 + worksheetNum * 3) % 40 + 12;
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian bilangan berikut:',
            mathFormula: `${a} \\times ${b} = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `${a} × ${b} = ${ans}.`
          });
        } else if (i % 3 === 2) {
          // Division with remainder
          const divisor = ((i + worksheetNum) % 7) + 3;
          const q = (i * 4 + worksheetNum * 6) % 30 + 10;
          const rem = (i % (divisor - 1)) + 1;
          const dividend = divisor * q + rem;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: `Hitunglah hasil bagi dan sisa dari pembagian berikut (contoh format: ${q} sisa ${rem}):`,
            mathFormula: `${dividend} \\div ${divisor} = \\dots`,
            isLatex: true,
            correctAnswer: `${q} sisa ${rem}`,
            acceptableAnswers: [`${q} sisa ${rem}`, `${q}r${rem}`, `${q} sisa: ${rem}`],
            explanation: `Berdasarkan algoritma pembagian: ${dividend} = (${divisor} × ${q}) + ${rem}. Jadi hasilnya ${q} dengan sisa ${rem}.`
          });
        } else {
          // Simplify fraction
          const factor = ((i + worksheetNum) % 4) + 2;
          const num = ((i * 2 + worksheetNum) % 5) + 1;
          const den = num + ((i + 1) % 4) + 1;
          const bigNum = num * factor;
          const bigDen = den * factor;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Sederhanakan bentuk pecahan berikut ke bentuk paling sederhana (contoh jawaban: 2/3):',
            mathFormula: `\\frac{${bigNum}}{${bigDen}} = \\dots`,
            isLatex: true,
            correctAnswer: `${num}/${den}`,
            acceptableAnswers: [`${num}/${den}`, `\\frac{${num}}{${den}}`],
            explanation: `Bagi pembilang dan penyebut dengan FPB keduanya (${factor}): (${bigNum} ÷ ${factor}) / (${bigDen} ÷ ${factor}) = ${num}/${den}.`
          });
        }
        break;
      }

      case 'E': {
        // Operations on Fractions
        const d1 = ((i + worksheetNum) % 4) + 2;
        const d2 = ((i * 2 + worksheetNum) % 3) + 3;
        const n1 = 1;
        const n2 = 1;

        if (i % 2 === 1) {
          // Addition
          const lcm = d1 === d2 ? d1 : d1 * d2;
          const resNum = (n1 * (lcm / d1)) + (n2 * (lcm / d2));
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah penjumlahan pecahan berikut (contoh jawaban: 5/6):',
            mathFormula: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = \\dots`,
            isLatex: true,
            correctAnswer: `${resNum}/${lcm}`,
            acceptableAnswers: [`${resNum}/${lcm}`, `\\frac{${resNum}}{${lcm}}`],
            explanation: `Samakan penyebut ke KPK (${lcm}): ${n1 * (lcm / d1)}/${lcm} + ${n2 * (lcm / d2)}/${lcm} = ${resNum}/${lcm}.`
          });
        } else {
          // Multiplication
          const resNum = n1 * n2 * 2;
          const resDen = d1 * d2;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian pecahan berikut:',
            mathFormula: `\\frac{2}{${d1}} \\times \\frac{1}{${d2}} = \\dots`,
            isLatex: true,
            correctAnswer: `${resNum}/${resDen}`,
            acceptableAnswers: [`${resNum}/${resDen}`, `\\frac{${resNum}}{${resDen}}`],
            explanation: `Kalikan pembilang dengan pembilang dan penyebut dengan penyebut: (2 × 1) / (${d1} × ${d2}) = ${resNum}/${resDen}.`
          });
        }
        break;
      }

      case 'F': {
        // Mixed operations, decimals & BODMAS
        const a = (i * 3 + worksheetNum) % 20 + 10;
        const b = ((i + worksheetNum) % 4) + 2;
        const c = ((i * 2 + worksheetNum) % 5) + 3;
        const ans = a + (b * c);
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Hitunglah hasil urutan operasi campuran berikut:',
          mathFormula: `${a} + ${b} \\times ${c} = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Sesuai aturan urutan operasi (KABATAKU), perkalian dikerjakan terlebih dahulu: ${b} × ${c} = ${b * c}, lalu ${a} + ${b * c} = ${ans}.`
        });
        break;
      }

      case 'G': {
        // Signed integers & 1-variable linear equations
        if (i % 2 === 1) {
          const a = -((i * 3 + worksheetNum) % 8 + 2);
          const b = ((i * 2 + worksheetNum) % 9 + 3);
          const ans = a * b;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Hitunglah perkalian bilangan bulat bertanda berikut:',
            mathFormula: `(${a}) \\times (${b}) = \\dots`,
            isLatex: true,
            correctAnswer: `${ans}`,
            explanation: `Bilangan negatif dikali bilangan positif menghasilkan negatif: (${a}) × (${b}) = ${ans}.`
          });
        } else {
          const coeff = ((i + worksheetNum) % 3) + 2;
          const xVal = ((i * 2 + worksheetNum) % 7) + 1;
          const constVal = ((i * 3 + worksheetNum) % 10) + 3;
          const rhs = coeff * xVal + constVal;
          questions.push({
            id: qId,
            levelId,
            worksheetNum,
            questionNumber: qNum,
            prompt: 'Tentukan nilai x dari persamaan linear berikut:',
            mathFormula: `${coeff}x + ${constVal} = ${rhs}`,
            isLatex: true,
            correctAnswer: `${xVal}`,
            acceptableAnswers: [`${xVal}`, `x=${xVal}`, `x = ${xVal}`],
            explanation: `${coeff}x = ${rhs} - ${constVal} ⟹ ${coeff}x = ${coeff * xVal} ⟹ x = ${coeff * xVal} ÷ ${coeff} = ${xVal}.`
          });
        }
        break;
      }

      case 'H': {
        // Systems of Linear Equations (SPLDV) & Inequalities
        const xVal = ((i + worksheetNum) % 5) + 2;
        const yVal = ((i * 2 + worksheetNum) % 4) + 1;
        const eq1Res = xVal + yVal;
        const eq2Res = 2 * xVal - yVal;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan himpunan penyelesaian (x, y) dari SPLDV berikut (format: x, y):',
          mathFormula: `\\begin{cases} x + y = ${eq1Res} \\\\[4pt] 2x - y = ${eq2Res} \\end{cases}`,
          isLatex: true,
          correctAnswer: `${xVal}, ${yVal}`,
          acceptableAnswers: [`${xVal}, ${yVal}`, `${xVal},${yVal}`, `(${xVal},${yVal})`, `(${xVal}, ${yVal})`, `x=${xVal},y=${yVal}`],
          explanation: `Eliminasi y dengan menjumlahkan kedua persamaan: 3x = ${eq1Res + eq2Res} ⟹ x = ${xVal}. Substitusikan ke x + y = ${eq1Res} ⟹ ${xVal} + y = ${eq1Res} ⟹ y = ${yVal}. Jadi pasangan penyelesaian adalah (x, y) = (${xVal}, ${yVal}).`
        });
        break;
      }

      case 'I': {
        // Factoring and Quadratic Equations
        const r1 = ((i + worksheetNum) % 4) + 1;
        const r2 = ((i * 2 + worksheetNum) % 5) + 2;
        const sumR = r1 + r2;
        const prodR = r1 * r2;
        const sumTerm = sumR === 1 ? 'x' : `${sumR}x`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: `Tentukan akar-akar persamaan kuadrat berikut (format: ${Math.min(r1, r2)}, ${Math.max(r1, r2)}):`,
          mathFormula: `x^2 - ${sumTerm} + ${prodR} = 0`,
          isLatex: true,
          correctAnswer: `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
          acceptableAnswers: [
            `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
            `${Math.max(r1, r2)}, ${Math.min(r1, r2)}`,
            `${Math.min(r1, r2)},${Math.max(r1, r2)}`,
            `x=${r1}, x=${r2}`,
            `x=${r2}, x=${r1}`
          ],
          explanation: `Faktorkan: (x - ${r1})(x - ${r2}) = 0 ⟹ x - ${r1} = 0 atau x - ${r2} = 0 ⟹ x = ${r1} atau x = ${r2}.`
        });
        break;
      }

      case 'J': {
        // Polynomials and Remainder Theorem
        const a = ((i + worksheetNum) % 3) + 1;
        const c = ((i * 2 + worksheetNum) % 4) + 2;
        // P(x) = x^2 - a*x + c, evaluate at x = 3
        const val = 3 * 3 - a * 3 + c;
        const aTerm = a === 1 ? 'x' : `${a}x`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Berapakah sisa pembagian suku banyak P(x) berikut jika dibagi oleh (x - 3):',
          mathFormula: `P(x) = x^2 - ${aTerm} + ${c}`,
          isLatex: true,
          correctAnswer: `${val}`,
          explanation: `Menurut Teorema Sisa, sisa pembagian P(x) oleh (x - 3) adalah S = P(3): P(3) = (3)² - ${a}(3) + ${c} = 9 - ${a * 3} + ${c} = ${val}.`
        });
        break;
      }

      case 'K': {
        // Exponents & Logarithms
        const base = ((i + worksheetNum) % 3) + 2; // 2, 3, 4
        const exp = ((i * 2 + worksheetNum) % 3) + 2; // 2, 3, 4
        const result = Math.pow(base, exp);
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan nilai x yang memenuhi persamaan logaritma berikut:',
          mathFormula: `\\log_{${base}}(${result}) = x`,
          isLatex: true,
          correctAnswer: `${exp}`,
          acceptableAnswers: [`${exp}`, `x=${exp}`, `x = ${exp}`],
          explanation: `Berdasarkan definisi logaritma: log_${base}(${result}) = x ⟺ ${base}^x = ${result}. Karena ${result} = ${base}^${exp}, maka diperoleh x = ${exp}.`
        });
        break;
      }

      case 'L': {
        // Trigonometry, Limits & Basic Derivatives
        const n = ((i + worksheetNum) % 4) + 2;
        const coeff = ((i * 2 + worksheetNum) % 3) + 2;
        const newCoeff = coeff * n;
        const newPower = n - 1;
        const term = newPower === 1 ? `${newCoeff}x` : `${newCoeff}x^${newPower}`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Tentukan turunan pertama f\'(x) dari fungsi aljabar berikut:',
          mathFormula: `f(x) = ${coeff}x^{${n}}`,
          isLatex: true,
          options: [
            `${newCoeff}x^{${newPower}}`,
            `${coeff}x^{${newPower}}`,
            `${newCoeff}x^{${n}}`,
            `${coeff * 2}x^{${newPower}}`
          ].sort(() => 0.5 - Math.random()),
          correctAnswer: `${newCoeff}x^{${newPower}}`,
          explanation: `Gunakan aturan turunan pangkat: f'(x) = ${coeff} · ${n} · x^{${n} - 1} = ${term}.`
        });
        break;
      }

      case 'M': {
        // Comprehensive Calculus & Integrals
        const a = ((i + worksheetNum) % 3) + 1; // 1, 2, 3
        const upper = ((i * 2 + worksheetNum) % 3) + 2; // 2, 3, 4
        // \int_0^upper (2a x) dx = [a x^2]_0^upper = a * upper^2
        const ans = a * upper * upper;
        const coeffStr = 2 * a === 1 ? '' : `${2 * a}`;
        const antiCoeff = a === 1 ? '' : `${a}`;
        questions.push({
          id: qId,
          levelId,
          worksheetNum,
          questionNumber: qNum,
          prompt: 'Hitunglah nilai integral tentu kalkulus berikut:',
          mathFormula: `\\int_0^{${upper}} ${coeffStr}x \\, dx = \\dots`,
          isLatex: true,
          correctAnswer: `${ans}`,
          explanation: `Antiturunan: ∫ ${coeffStr}x dx = ${antiCoeff}x². Evaluasi batas Teorema Dasar Kalkulus: [${antiCoeff}x²]_0^${upper} = ${a}(${upper})² - ${a}(0)² = ${ans}.`
        });
        break;
      }

      default:
        break;
    }
  }

  // Ensure Question #1 is always an Example with step-by-step hierarchical solution
  if (questions.length > 0) {
    questions[0].isExample = true;
    questions[0].stepByStepSolution = getStepByStepSolutionForQuestion(levelId, questions[0]);
  }

  return questions;
}
